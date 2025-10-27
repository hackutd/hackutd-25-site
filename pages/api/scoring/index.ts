import initializeApi from '@/lib/admin/init';
import { extractUserDataFromToken } from '@/lib/authorization/check-authorization';
import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';

initializeApi();
const db = firestore();
// TODO: change this to acceptreject
const SCORING_COLLECTION = '/scoring';
const REGISTRATION_COLLECTION = '/registrations';

export interface ScoringDataType {
  adminId: string;
  hackerId: string;
  score: number;
  note: string;
  isSuperVote?: boolean;
}

const SCORING_NO = 1;
const SCORING_MAYBE_NO = 2;
const SCORING_MAYBE_YES = 3;
const SCORING_YES = 4;

async function getTeamMembers(hackerId: string): Promise<string[]> {
  const hackerApplication = await db.collection(REGISTRATION_COLLECTION).doc(hackerId).get();
  const data = hackerApplication.data();
  if (!data) return [hackerId];

  const teammates = [data.teammate1, data.teammate2, data.teammate3].filter(
    (t) => t && t.trim() !== '',
  );

  // Find all team members by checking who has this person as a teammate
  const teamMembers = new Set([hackerId]);
  teammates.forEach((teammateEmail) => {
    teamMembers.add(teammateEmail);
  });

  // Check if other people have this person as a teammate
  const allApps = await db
    .collection(REGISTRATION_COLLECTION)
    .where('user.permissions', 'array-contains', 'hacker')
    .get();

  allApps.docs.forEach((doc) => {
    const appData = doc.data();
    const appTeammates = [appData.teammate1, appData.teammate2, appData.teammate3];
    if (appTeammates.includes(data.user.preferredEmail)) {
      teamMembers.add(doc.id);
    }
  });

  return Array.from(teamMembers);
}

async function checkAppShouldEnterCommonPool(hackerId: string, isInATeam: boolean) {
  const hackerApplication = await db.collection(REGISTRATION_COLLECTION).doc(hackerId).get();
  // NOTE: if app already had `inCommonPool` flag, there's no reason to move it to common pool again
  if (!!hackerApplication.data().inCommonPool) {
    return false;
  }
  const scoring = await db
    .collection(SCORING_COLLECTION)
    .where('hackerId', '==', hackerId)
    .where('appIsAssigned', '==', true)
    .get();
  if (scoring.docs.length > 2) {
    // NOTE: if this happens, something is very wrong here :)
    console.error('App is assigned to 2 more than 2 officers.');
  }
  const hasMaybeVerdict = scoring.docs.some(
    (doc) => doc.data().score === SCORING_MAYBE_YES || doc.data().score === SCORING_MAYBE_NO,
  );
  if (hasMaybeVerdict) return true;

  // NOTE: appScore can only be either -2, 0, or 2
  const appScore = scoring.docs.reduce((acc, curr) => {
    const currentScore = curr.data().score;
    if (currentScore === SCORING_NO) return acc - 1;
    if (currentScore !== SCORING_YES) {
      console.error('got a different score. something is wrong :)');
    }
    return acc + 1;
  }, 0);

  // If individual gets outright rejected (negative score), remove them from review process
  if (scoring.docs.length === 2 && appScore < 0) {
    // Remove individual from review process (fully rejected)
    await db
      .collection(REGISTRATION_COLLECTION)
      .doc(hackerId)
      .update({
        'user.permissions': ['hacker'], // Remove 'in_review' permission
        inCommonPool: false,
      });

    // If this was a team member, move the rest of the team to common pool
    if (isInATeam) {
      const teamMembers = await getTeamMembers(hackerId);
      for (const teamMemberId of teamMembers) {
        if (teamMemberId !== hackerId) {
          // Move other team members to common pool for individual judgment
          await moveAppToCommonPool(teamMemberId);
        }
      }
    }

    return false; // Don't move to common pool, they're fully rejected
  }

  return appScore === 0;
}

async function moveAppToCommonPool(hackerId: string) {
  await db.collection(REGISTRATION_COLLECTION).doc(hackerId).set(
    {
      inCommonPool: true,
    },
    {
      merge: true,
    },
  );
}

async function checkConsensusThreshold(hackerId: string): Promise<boolean> {
  // Get all scoring data for this application
  const scoringSnapshot = await db
    .collection(SCORING_COLLECTION)
    .where('hackerId', '==', hackerId)
    .get();

  // Calculate total score (accepts = +1, rejects = -1, maybes = 0)
  const totalScore = scoringSnapshot.docs.reduce((acc, doc) => {
    const score = doc.data().score;
    const multiplier = doc.data().isSuperVote ? 50 : 1; // Super votes count as 50x

    if (score === 4) return acc + multiplier; // Accept
    if (score === 1) return acc - multiplier; // Reject
    return acc; // Maybe (score 2 or 3)
  }, 0);

  // Remove from common pool if strong consensus reached
  if (totalScore >= 3 || totalScore <= -3) {
    await db
      .collection(REGISTRATION_COLLECTION)
      .doc(hackerId)
      .update({
        inCommonPool: false,
        'user.permissions': ['hacker'], // Remove 'in_review' permission
      });
    return true; // Application was removed from common pool
  }

  return false; // Application remains in common pool
}

async function checkTeamMajorityAcceptance(hackerId: string): Promise<boolean> {
  const teamMembers = await getTeamMembers(hackerId);
  if (teamMembers.length < 2) return false; // Not a team

  let acceptedCount = 0;
  let totalScoredCount = 0;

  for (const teamMemberId of teamMembers) {
    const teamMemberScoring = await db
      .collection(SCORING_COLLECTION)
      .where('hackerId', '==', teamMemberId)
      .where('appIsAssigned', '==', true)
      .get();

    if (teamMemberScoring.docs.length >= 2) {
      // Has been fully reviewed
      totalScoredCount++;
      const teamMemberScore = teamMemberScoring.docs.reduce((acc, curr) => {
        const currentScore = curr.data().score;
        if (currentScore === SCORING_NO) return acc - 1;
        if (currentScore === SCORING_YES) return acc + 1;
        return acc;
      }, 0);

      if (teamMemberScore > 0) {
        // Accepted
        acceptedCount++;
      }
    }
  }

  // If majority of scored team members are accepted, accept whole team
  if (totalScoredCount > 0 && acceptedCount > totalScoredCount / 2) {
    return true;
  }

  return false;
}

async function acceptWholeTeam(hackerId: string) {
  const teamMembers = await getTeamMembers(hackerId);

  for (const teamMemberId of teamMembers) {
    // Remove from review process (accepted)
    await db
      .collection(REGISTRATION_COLLECTION)
      .doc(teamMemberId)
      .update({
        'user.permissions': ['hacker'], // Remove 'in_review' permission
        inCommonPool: false,
      });
  }
}

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;
  const userToken = headers['authorization'];
  const reviewerData = await extractUserDataFromToken(userToken);
  if (!reviewerData) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform admin functionality',
    });
  }
  // check if adminId === reviewerData.id
  if ((req.body.scores as ScoringDataType[]).some((score) => score.adminId !== reviewerData.id)) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform admin functionality',
    });
  }

  // Check if this is a team member by looking at the hacker's teammates
  const firstScore = req.body.scores[0];
  const hackerDoc = await db.collection(REGISTRATION_COLLECTION).doc(firstScore.hackerId).get();
  const isTeam =
    hackerDoc.exists &&
    (hackerDoc.data().teammate1 || hackerDoc.data().teammate2 || hackerDoc.data().teammate3);

  // NOTE: req.body will be of type { scores: ScoringDataType[] }
  try {
    await Promise.all(
      (req.body.scores as ScoringDataType[]).map(async (scoring) => {
        // check if hackerId is valid
        const hackerDoc = await db.collection(REGISTRATION_COLLECTION).doc(scoring.hackerId).get();
        if (!hackerDoc.exists) {
          // if hacker data does not exist, then do nothing
          return;
        }

        //  store scoring into database
        const appAssignee: string[] = hackerDoc.data().reviewer;
        if (!appAssignee || appAssignee.length === 0) {
          await db.collection(SCORING_COLLECTION).add({
            ...scoring,
            appIsAssigned: false,
          });
          return;
        }
        // checking whether organizer is reviewing an app assigned to them or an app from common pool
        const scoringRef = await db
          .collection(SCORING_COLLECTION)
          .where('adminId', '==', scoring.adminId)
          .where('hackerId', '==', scoring.hackerId)
          .get();
        if (!scoringRef.empty) {
          await scoringRef.docs[0].ref.update({
            score: scoring.score,
            isSuperVote: !!scoring.isSuperVote,
            note: scoring.note,
          });
        } else {
          const appIsAssigned = appAssignee.some((assigneeId) => assigneeId === scoring.adminId);
          await db.collection(SCORING_COLLECTION).add({
            ...scoring,
            appIsAssigned,
          });
        }
        if (scoring.isSuperVote) {
          // remove app from all pool
          await hackerDoc.ref.update({
            'user.permissions': [hackerDoc.data().user.permissions[0]],
          });
        } else {
          //  check if application should be moved into common pool.
          const appShouldBeMovedToCommonPool = await checkAppShouldEnterCommonPool(
            scoring.hackerId,
            isTeam,
          );
          if (appShouldBeMovedToCommonPool) {
            await moveAppToCommonPool(scoring.hackerId);
          }

          // Check for consensus threshold (remove from common pool if +3 or -3)
          const wasRemovedFromCommonPool = await checkConsensusThreshold(scoring.hackerId);
          if (wasRemovedFromCommonPool) {
            console.log(
              `Application ${scoring.hackerId} removed from common pool due to consensus threshold`,
            );
            return; // Skip further processing if removed from common pool
          }

          // Check if team should be accepted based on majority
          // Only check when the current score is an acceptance (score = 4) and after both reviewers have completed their reviews
          if (isTeam && scoring.score === 4) {
            // Only check for team acceptance when accepting someone
            const currentScoring = await db
              .collection(SCORING_COLLECTION)
              .where('hackerId', '==', scoring.hackerId)
              .where('appIsAssigned', '==', true)
              .get();

            // Only check for team acceptance if this team member has been fully reviewed (2 scores)
            if (currentScoring.docs.length >= 2) {
              // Additional check: only accept team if at least 2 team members have been fully reviewed
              const teamMembers = await getTeamMembers(scoring.hackerId);
              let fullyReviewedCount = 0;

              for (const teamMemberId of teamMembers) {
                const memberScoring = await db
                  .collection(SCORING_COLLECTION)
                  .where('hackerId', '==', teamMemberId)
                  .where('appIsAssigned', '==', true)
                  .get();

                if (memberScoring.docs.length >= 2) {
                  fullyReviewedCount++;
                }
              }

              // Only check for team acceptance if at least 2 team members have been fully reviewed
              if (fullyReviewedCount >= 2) {
                const shouldAcceptTeam = await checkTeamMajorityAcceptance(scoring.hackerId);
                if (shouldAcceptTeam) {
                  await acceptWholeTeam(scoring.hackerId);
                }
              }
            }
          }
        }
      }),
    );
    return res.status(200).json({
      msg: 'Score submitted successful',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: 'Internal server error',
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case 'POST': {
      return handlePostRequest(req, res);
    }
    default: {
      return res.status(404).json({
        msg: 'Route not found',
      });
    }
  }
}
