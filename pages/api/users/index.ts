import { firestore } from 'firebase-admin';
import { auth } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../../lib/admin/init';
import {
  extractUserDataFromToken,
  userIsAuthorized,
} from '../../../lib/authorization/check-authorization';

initializeApi();
const db = firestore();

const USERS_COLLECTION = '/registrations';
const MISC_COLLECTION = '/miscellaneous';
const SCORING_COLLECTION = '/scoring';
/**
 *
 * Represent how data of a User is stored in the backend
 *
 */
export interface UserData {
  id: string;
  scans?: string[];
  user: {
    firstName: string;
    lastName: string;
    permissions: string[];
  };
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}
/**
 *
 * API endpoint to fetch all users from the database
 *
 * @param req HTTP request object
 * @param res HTTP response object
 *
 *
 */
async function getAllUsers(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;

  const userToken = headers['authorization'];
  const isAuthorized = await userIsAuthorized(userToken);

  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform admin functionality.',
    });
  }

  const doc = await db.collection(MISC_COLLECTION).doc('allusers').get();

  return res.json(doc.data().users);
}

/**
 *
 * Function to groups users together into groups based on teammate information. If you understand how this function works, you're a genius :D
 *
 * @param userList List of user infos
 * @return list of groups, each represented as `Registration[]`
 *
 */
// Helper function to validate if a user is actually part of a valid team
function isValidTeamMember(user: Registration, allUsers: Registration[]): boolean {
  const teammates = [user.teammate1, user.teammate2, user.teammate3].filter(
    (t) => t && t.trim() !== '',
  );

  if (teammates.length === 0) return false; // No teammates listed

  // Check if all listed teammates exist in the database
  const userEmails = new Set(allUsers.map((u) => u?.user?.preferredEmail).filter(Boolean));
  for (const teammateEmail of teammates) {
    if (!userEmails.has(teammateEmail)) {
      return false; // Teammate doesn't exist
    }
  }

  // Check bidirectional relationships
  for (const teammateEmail of teammates) {
    const teammate = allUsers.find((u) => u?.user?.preferredEmail === teammateEmail);
    if (!teammate) continue;

    const teammateTeammates = [teammate.teammate1, teammate.teammate2, teammate.teammate3].filter(
      (t) => t && t.trim() !== '',
    );

    if (!teammateTeammates.includes(user?.user?.preferredEmail)) {
      return false; // Teammate doesn't have this user listed back
    }
  }

  return true;
}

export function generateGroupsFromUserData(userList: Registration[]): Registration[][] {
  const groupLeader = new Map<string, string>();
  const groupSize = new Map<string, number>();

  userList.forEach((user) => {
    if (user?.user?.preferredEmail) {
      groupLeader.set(user.user.preferredEmail, user.user.preferredEmail);
      groupSize.set(user.user.preferredEmail, 1);
    }
  });

  const findLeader = (userEmail: string) => {
    if (groupLeader.get(userEmail) === userEmail) return userEmail;
    groupLeader.set(userEmail, findLeader(groupLeader.get(userEmail)));
    return groupLeader.get(userEmail);
  };

  const validateEmail = (email: string | null | undefined) => {
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return false;
    }
    try {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
    } catch (error) {
      console.error('Email validation error:', error, 'for email:', email);
      return false;
    }
  };

  const mergeGroup = (firstUserEmail: string, secondUserEmail: string) => {
    const firstUserLeaderEmail = findLeader(firstUserEmail);
    const secondUserLeaderEmail = findLeader(secondUserEmail);
    if (firstUserLeaderEmail === secondUserLeaderEmail) return;
    const firstGroupSize = groupSize.get(firstUserLeaderEmail);
    const secondGroupSize = groupSize.get(secondUserLeaderEmail);
    if (firstGroupSize > secondGroupSize) {
      groupLeader.set(secondUserLeaderEmail, firstUserLeaderEmail);
      groupSize.set(firstUserLeaderEmail, firstGroupSize + secondGroupSize);
    } else {
      groupLeader.set(firstUserLeaderEmail, secondUserLeaderEmail);
      groupSize.set(secondUserLeaderEmail, firstGroupSize + secondGroupSize);
    }
  };

  userList.forEach((user) => {
    if (!user?.user?.preferredEmail) return;
    try {
      [user.teammate1, user.teammate2, user.teammate3]
        .filter((email) => validateEmail(email) && groupLeader.has(email))
        .forEach((teammateEmail) => {
          mergeGroup(user.user.preferredEmail, teammateEmail);
        });
    } catch (error) {
      console.error(
        'Error processing team relationships for user:',
        user.user.preferredEmail,
        error,
      );
    }
  });

  const preliminaryGroups = new Map<string, Registration[]>();
  userList
    .filter(
      (user) =>
        user?.user?.preferredEmail &&
        findLeader(user.user.preferredEmail) === user.user.preferredEmail,
    )
    .forEach((user) => {
      preliminaryGroups.set(user.user.preferredEmail, []);
    });
  userList.forEach((user) => {
    if (user?.user?.preferredEmail) {
      const leader = findLeader(user.user.preferredEmail);
      if (preliminaryGroups.has(leader)) {
        preliminaryGroups.get(leader).push(user);
      }
    }
  });

  const validGroup = (potentialGroup: Registration[]) => {
    if (potentialGroup.length < 2 || potentialGroup.length > 4) return false;

    // First, verify that all listed teammates actually exist in the userList
    const userEmails = new Set(userList.map((user) => user?.user?.preferredEmail).filter(Boolean));

    for (const user of potentialGroup) {
      const listedTeammates = [user.teammate1, user.teammate2, user.teammate3].filter(
        (email) => email && email.trim() !== '',
      );

      // Check if all listed teammates exist in the database
      for (const teammateEmail of listedTeammates) {
        if (!userEmails.has(teammateEmail)) {
          // This teammate doesn't exist in the database, so this is not a valid team
          return false;
        }
      }
    }

    // Now check bidirectional relationships (existing logic)
    const voteCounter = new Map<string, number>();
    potentialGroup.forEach((user) => {
      if (user?.user?.preferredEmail) {
        voteCounter.set(user.user.preferredEmail, 0);
      }
    });
    potentialGroup.forEach((user) => {
      [user.teammate1, user.teammate2, user.teammate3]
        .filter((teammateEmail) => voteCounter.has(teammateEmail))
        .forEach((teammateEmail) =>
          voteCounter.set(teammateEmail, voteCounter.get(teammateEmail) + 1),
        );
    });
    const expectedVotes = potentialGroup.length - 1;
    let isValidGroup = true;
    voteCounter.forEach((value, _) => {
      if (value !== expectedVotes) isValidGroup = false;
    });
    return isValidGroup;
  };

  const ret: Registration[][] = [];

  preliminaryGroups.forEach((value, _) => {
    // Always treat each person as an individual in the review queue
    // This ensures proper workload distribution and individual attention
    value.forEach((user) => ret.push([user]));
  });

  return ret;
}

async function checkDecisionIsReleased() {
  const systemManagerDoc = await db.collection('/miscellaneous').doc('preferences').get();
  return systemManagerDoc.data().applicationDecisions;
}

/**
 *
 * API endpoint to fetch all users from the database
 *
 * @param req HTTP request object
 * @param res HTTP response object
 *
 *
 */
async function getAllRegistrations(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;

  const userToken = headers['authorization'];
  let userData;

  try {
    userData = await extractUserDataFromToken(userToken);

    if (!userData) {
      return res.status(401).json({
        msg: 'Invalid or missing authentication token.',
      });
    }

    const isAuthorized =
      (userData.user.permissions as string[]).includes('super_admin') ||
      (userData.user.permissions as string[]).includes('admin');

    if (!isAuthorized) {
      return res.status(403).json({
        msg: 'Request is not authorized to perform admin functionality.',
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      msg: 'Authentication failed. Please check your token.',
    });
  }

  try {
    const decisionReleased = await checkDecisionIsReleased();
    const statusString = ['Rejected', 'Maybe No', 'Maybe Yes', 'Accepted'];
    let allApps = [];
    if ((userData.user.permissions as string[]).includes('super_admin')) {
      const allAppsSnapshot = await db.collection(USERS_COLLECTION).get();
      const alLFormattedApp = await Promise.all(
        allAppsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          delete data.reviewer; // Remove reviewer data from response
          delete data.github; // Remove github data from response
          delete data.linkedin; // Remove linkedin data from response
          delete data.resume; // Remove resume data from response
          delete data.phoneNumber; // Remove phone number data from response
          const scoringSnapshot = await db
            .collection(SCORING_COLLECTION)
            .where('hackerId', '==', doc.id)
            .get();
          const reviewerIds = scoringSnapshot.docs.map((doc) => doc.data().adminId);
          const organizerReview = scoringSnapshot.docs.find(
            (d) => d.data().adminId === userData.id,
          );
          const reviewerInfo =
            reviewerIds.length === 0
              ? []
              : await db
                  .collection(USERS_COLLECTION)
                  .where('id', 'in', reviewerIds)
                  .select('id', 'user.firstName', 'user.lastName')
                  .get();
          const reviewerMapping = new Map<string, string>();
          reviewerInfo.forEach((info) => {
            reviewerMapping.set(
              info.data().id,
              `${info.data().user.firstName} ${info.data().user.lastName}`,
            );
          });
          const appScore = scoringSnapshot.docs.reduce((acc, doc) => {
            const scoreMultiplier = !!doc.data().isSuperVote ? 50 : 1;
            if (doc.data().score === 4) return acc + scoreMultiplier;
            if (doc.data().score === 1) return acc - scoreMultiplier;
            return acc;
          }, 0);
          return {
            ...data,
            scoring: scoringSnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                score: data.score,
                note: data.note,
                reviewer: reviewerMapping.get(data.adminId),
                isSuperVote: !!data.isSuperVote,
              };
            }),
            status: decisionReleased
              ? appScore >= 2
                ? 'Accepted'
                : 'Rejected'
              : organizerReview
              ? statusString[organizerReview?.data().score - 1]
              : 'In Review',
          };
        }),
      );
      allApps = generateGroupsFromUserData(alLFormattedApp as any[]);
      return res.json({
        groups: allApps,
      });
    }
    const assignedAppCollectionRef = await db
      .collection(USERS_COLLECTION)
      .where('reviewer', 'array-contains', userData.id)
      .get();
    const commonPoolCollectionRef = await db
      .collection(USERS_COLLECTION)
      .where('inCommonPool', '==', true)
      .where('user.permissions', 'array-contains', 'in_review')
      .get();

    // Get all user emails to validate team relationships
    const allUserEmails = new Set<string>();
    assignedAppCollectionRef.docs.forEach((doc) => {
      const email = doc.data()?.user?.preferredEmail;
      if (email) allUserEmails.add(email);
    });
    commonPoolCollectionRef.docs.forEach((doc) => {
      const email = doc.data()?.user?.preferredEmail;
      if (email) allUserEmails.add(email);
    });
    const commonAppWithScores = await Promise.all(
      commonPoolCollectionRef.docs.map(async (doc) => {
        const data = doc.data();
        delete data.reviewer; // Remove reviewer data from response
        delete data.github; // Remove github data from response
        delete data.linkedin; // Remove linkedin data from response
        delete data.resume; // Remove resume data from response
        delete data.phoneNumber; // Remove phone number data from response
        const scoringSnapshot = await db
          .collection(SCORING_COLLECTION)
          .where('hackerId', '==', doc.id)
          .get();

        // Skip applications that have never been reviewed (0 reviews)
        // Applications in common pool should have at least 1 review
        if (scoringSnapshot.empty) {
          return null; // Skip this application
        }

        // Check consensus threshold - remove apps with +3 or -3 scores
        const totalScore = scoringSnapshot.docs.reduce((acc, doc) => {
          const score = doc.data().score;
          const multiplier = doc.data().isSuperVote ? 50 : 1;

          if (score === 4) return acc + multiplier; // Accept
          if (score === 1) return acc - multiplier; // Reject
          return acc; // Maybe (score 2 or 3)
        }, 0);

        // Skip applications that have reached consensus threshold
        if (totalScore >= 3 || totalScore <= -3) {
          console.log(
            `Skipping app ${doc.id} from users API - consensus reached (score: ${totalScore})`,
          );
          return null; // Skip this application
        }
        const reviewerIds = scoringSnapshot.docs.map((doc) => doc.data().adminId);
        const organizerReview = scoringSnapshot.docs.find((d) => d.data().adminId === userData.id);
        const reviewerInfo =
          reviewerIds.length === 0
            ? []
            : await db
                .collection(USERS_COLLECTION)
                .where('id', 'in', reviewerIds)
                .select('id', 'user.firstName', 'user.lastName')
                .get();
        const reviewerMapping = new Map<string, string>();
        reviewerInfo.forEach((info) => {
          reviewerMapping.set(
            info.data().id,
            `${info.data().user.firstName} ${info.data().user.lastName}`,
          );
        });
        const appScore = scoringSnapshot.docs.reduce((acc, doc) => {
          const scoreMultiplier = !!doc.data().isSuperVote ? 50 : 1;
          if (doc.data().score === 4) return acc + scoreMultiplier;
          if (doc.data().score === 1) return acc - scoreMultiplier;
          return acc;
        }, 0);

        // Check if this person is part of a valid team (for common pool)
        const teammates = [data.teammate1, data.teammate2, data.teammate3].filter(
          (t) => t && t.trim() !== '',
        );
        // Check if teammates exist in the database
        const isTeamMember =
          teammates.length > 0 &&
          teammates.every((teammateEmail) => {
            return allUserEmails.has(teammateEmail);
          });

        // Generate a unique team ID by sorting all team member emails
        let teamId = null;
        if (isTeamMember && data?.user?.preferredEmail) {
          const allTeamEmails = [data.user.preferredEmail, ...teammates].sort();
          // Create a simple hash from the sorted emails
          teamId = allTeamEmails
            .join('|')
            .split('')
            .reduce((acc, char) => {
              return (acc << 5) - acc + char.charCodeAt(0);
            }, 0)
            .toString(36);
        }

        if (scoringSnapshot.empty || organizerReview === undefined) {
          return {
            ...data,
            status: decisionReleased ? (appScore >= 2 ? 'Accepted' : 'Rejected') : 'In Review',
            isAssigned: false,
            isTeamMember: isTeamMember,
            teamSize: isTeamMember ? teammates.length + 1 : 1,
            teamId: teamId,
          };
        }
        const commonPoolReviewerIds = scoringSnapshot.docs.map((doc) => doc.data().adminId);
        const commonPoolReviewerInfo =
          commonPoolReviewerIds.length === 0
            ? []
            : await db
                .collection(USERS_COLLECTION)
                .where('id', 'in', commonPoolReviewerIds)
                .select('id', 'user.firstName', 'user.lastName')
                .get();
        const commonPoolReviewerMapping = new Map<string, string>();
        commonPoolReviewerInfo.forEach((info) => {
          commonPoolReviewerMapping.set(
            info.data().id,
            `${info.data().user.firstName} ${info.data().user.lastName}`,
          );
        });

        return {
          ...data,
          scoring: scoringSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              score: data.score,
              note: data.note,
              reviewer: commonPoolReviewerMapping.get(data.adminId),
            };
          }),
          status: decisionReleased
            ? appScore >= 2
              ? 'Accepted'
              : 'Rejected'
            : appScore >= 2
            ? 'Accepted'
            : appScore <= -2
            ? 'Rejected'
            : organizerReview
            ? statusString[organizerReview.data().score - 1]
            : 'In Review',
          isAssigned: false,
          isTeamMember: isTeamMember,
          teamSize: isTeamMember ? teammates.length + 1 : 1,
          teamId: teamId,
        };
      }),
    );

    // Filter out null values (applications with 0 reviews that shouldn't be in common pool)
    const filteredCommonAppWithScores = commonAppWithScores.filter((app) => app !== null);

    const assignedApps = await Promise.all(
      assignedAppCollectionRef.docs
        .filter(
          (doc) => doc.data().user.permissions.includes('in_review') && !doc.data().inCommonPool,
        )
        .map(async (doc) => {
          const data = doc.data();
          delete data.reviewer; // Remove reviewer data from response
          delete data.github; // Remove github data from response
          delete data.linkedin; // Remove linkedin data from response
          delete data.resume; // Remove resume data from response
          delete data.phoneNumber; // Remove phone number data from response
          const scoringSnapshot = await db
            .collection(SCORING_COLLECTION)
            .where('hackerId', '==', doc.id)
            .get();
          const organizerReview = scoringSnapshot.docs.find(
            (d) => d.data().adminId === userData.id,
          );

          // Check if this person is part of a valid team (bidirectional validation)
          const teammates = [data.teammate1, data.teammate2, data.teammate3].filter(
            (t) => t && t.trim() !== '',
          );
          // Check if teammates exist in the database
          const isTeamMember =
            teammates.length > 0 &&
            teammates.every((teammateEmail) => {
              return allUserEmails.has(teammateEmail);
            });

          // Generate a unique team ID by sorting all team member emails
          let teamId = null;
          if (isTeamMember && data?.user?.preferredEmail) {
            const allTeamEmails = [data.user.preferredEmail, ...teammates].sort();
            // Create a simple hash from the sorted emails
            teamId = allTeamEmails
              .join('|')
              .split('')
              .reduce((acc, char) => {
                return (acc << 5) - acc + char.charCodeAt(0);
              }, 0)
              .toString(36);
          }
          if (!decisionReleased) {
            return {
              ...data,
              status: organizerReview
                ? statusString[organizerReview.data().score - 1]
                : 'In Review',
              scoring: organizerReview
                ? [
                    {
                      score: organizerReview.data().score,
                      note: organizerReview.data().note,
                      reviewer: `${userData.user.firstName} ${userData.user.lastName}`,
                    },
                  ]
                : undefined,
              isAssigned: true,
              isTeamMember: isTeamMember,
              teamSize: isTeamMember ? teammates.length + 1 : 1, // +1 to include the person themselves
              teamId: teamId,
            };
          }
          const reviewerIds = scoringSnapshot.docs.map((doc) => doc.data().adminId);
          const reviewerInfo =
            reviewerIds.length === 0
              ? []
              : await db
                  .collection(USERS_COLLECTION)
                  .where('id', 'in', reviewerIds)
                  .select('id', 'user.firstName', 'user.lastName')
                  .get();
          const reviewerMapping = new Map<string, string>();
          reviewerInfo.forEach((info) => {
            reviewerMapping.set(
              info.data().id,
              `${info.data().user.firstName} ${info.data().user.lastName}`,
            );
          });
          const appScore = scoringSnapshot.docs.reduce((acc, doc) => {
            const scoreMultiplier = !!doc.data().isSuperVote ? 50 : 1;
            if (doc.data().score === 4) return acc + scoreMultiplier;
            if (doc.data().score === 1) return acc - scoreMultiplier;
            return acc;
          }, 0);
          return {
            ...data,
            scoring: scoringSnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                score: data.score,
                note: data.note,
                reviewer: reviewerMapping.get(data.adminId),
              };
            }),
            status: appScore >= 2 ? 'Accepted' : 'Rejected',
            isAssigned: true,
            isTeamMember: isTeamMember,
            teamSize: isTeamMember ? teammates.length + 1 : 1, // +1 to include the person themselves
            teamId: teamId,
          };
        }),
    );

    // Shuffle assigned apps and common pool apps separately
    shuffle(assignedApps);
    shuffle(filteredCommonAppWithScores);

    const sortedCommonPoolApps = filteredCommonAppWithScores.sort((a, b) => {
      const aReviewCount = (a as any)?.scoring?.length || 0;
      const bReviewCount = (b as any)?.scoring?.length || 0;
      return aReviewCount - bReviewCount; // 0 reviews first, then 1, 2, 3, etc.
    });

    // Combine with assigned apps first, then sorted common pool apps
    const data = [...assignedApps, ...sortedCommonPoolApps];
    // Hide sensitive data
    const hideSensitiveData = (data: Registration[]) => {
      return data.map((d) => ({
        ...d,
        user: {
          ...d.user,
          firstName: 'Anonymous',
          lastName: '',
          // Keep preferredEmail for grouping purposes, but don't expose it in the response
          preferredEmail: d?.user?.preferredEmail || '',
        },
      }));
    };

    const groups = (userData as UserData).user.permissions.includes('super_admin')
      ? generateGroupsFromUserData(data as unknown as Registration[])
      : generateGroupsFromUserData(hideSensitiveData(data as unknown as Registration[]));

    // For regular admins, hide emails in the final response after grouping
    const finalGroups = (userData as UserData).user.permissions.includes('super_admin')
      ? groups
      : groups.map((group) =>
          group.map((member) => ({
            ...member,
            user: {
              ...member?.user,
              preferredEmail: '', // Hide email in final response
            },
          })),
        );

    return res.json({
      groups: finalGroups,
      allApps: allApps || [],
    });
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return res.status(500).json({
      msg: 'An error occurred while fetching user data.',
      error: error.message,
    });
  }
}

function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  return getAllRegistrations(req, res);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case 'GET': {
      return handleGetRequest(req, res);
    }
    default: {
      return res.status(404).json({
        msg: 'Route not found',
      });
    }
  }
}
