/**
 *
 * Applications in common pool
 *
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { auth, firestore } from 'firebase-admin';
import initializeApi from '../../../../lib/admin/init';
import {
  extractUserDataFromToken,
  userIsAuthorized,
} from '../../../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();

const APPLICATIONS_COLLECTION = '/registrations';
const SCORING_COLLECTION = '/scoring';
const USERS_COLLECTION = '/registrations';

/**
 * Handles GET requests to /api/application/reviews/[reviewerId].
 *
 * This returns the applications that requires review from the reviewer.
 *
 * @param req The HTTP request
 * @param res The HTTP response
 */
async function handleGetApplicationForReviewFromCommonPool(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // TODO: Handle user authorization
  const {
    query: { token, maxReviews },
    headers,
  } = req;

  //
  // Check if request header contains token
  // TODO: Figure out how to handle the string | string[] mess.
  const userToken = (token as string) || (headers['authorization'] as string);

  // only permits action for admin and super admin
  const isAuthorized = await userIsAuthorized(userToken, ['admin', 'super_admin']);

  // TODO: Extract from bearer token
  // Probably not safe
  if (!isAuthorized) {
    return res.status(401).send({
      type: 'request-unauthorized',
      message: 'Request is not authorized to perform admin functionality.',
    });
  }

  const userData = await extractUserDataFromToken(userToken);

  const userID = userData.user.id as string;

  try {
    const applicationsSnapshot = await db
      .collection(APPLICATIONS_COLLECTION)
      .where('inCommonPool', '==', true)
      .get();

    /**
     * currently we are fetching all applications from common pool including the one that contains the reviewer
     * firebase does not contain array-does-not-contain query, if there is any other way to do this, feel free to update this code
     */
    const applications = await Promise.all(
      applicationsSnapshot.docs.map(async (doc) => {
        const data: Registration & { reviewer?: string[] } = {
          ...(doc.data() as Registration),
          id: doc.id,
        };

        // if userId is in reviewer, skip this application
        if (data.reviewer.includes(userID)) {
          return;
        }

        // get scorings for application if already exist
        const scoringSnapshot = await db
          .collection(SCORING_COLLECTION)
          .where('hackerId', '==', doc.id)
          .get();

        // Apply review count filter if maxReviews parameter is provided
        if (maxReviews !== undefined) {
          const reviewCount = scoringSnapshot.docs.length;
          const maxReviewCount = parseInt(maxReviews as string, 10);

          if (!isNaN(maxReviewCount) && reviewCount > maxReviewCount) {
            return; // Skip this application if it has more reviews than the limit
          }
        }

        // Check consensus threshold - remove apps with +3 or -3 scores
        if (!scoringSnapshot.empty) {
          const totalScore = scoringSnapshot.docs.reduce((acc, doc) => {
            const score = doc.data().score;
            const multiplier = doc.data().isSuperVote ? 50 : 1;

            if (score === 4) return acc + multiplier; // Accept
            if (score === 1) return acc - multiplier; // Reject
            return acc; // Maybe (score 2 or 3)
          }, 0);

          // Skip applications that have reached consensus threshold
          if (totalScore >= 3 || totalScore <= -3) {
            console.log(`Skipping app ${doc.id} - consensus reached (score: ${totalScore})`);
            return; // Skip this application
          }
        }

        delete data.user; // Remove user data from response
        delete data.reviewer; // Remove reviewer data from response
        delete data.github; // Remove github data from response
        delete data.linkedin; // Remove linkedin data from response
        delete data.resume; // Remove resume data from response
        delete data.phoneNumber; // Remove phone number data from response

        if (scoringSnapshot.empty) {
          return data;
        } else {
          // Get reviewer information for all scores
          const reviewerIds = scoringSnapshot.docs.map((doc) => doc.data().adminId);

          const reviewerInfo =
            reviewerIds.length === 0
              ? { docs: [] }
              : await db
                  .collection(USERS_COLLECTION)
                  .where(firestore.FieldPath.documentId(), 'in', reviewerIds)
                  .get();

          const reviewerMapping = new Map<string, string>();
          reviewerInfo.docs.forEach((info) => {
            const reviewerName = `${info.data().user.firstName} ${info.data().user.lastName}`;
            reviewerMapping.set(info.id, reviewerName);
          });

          // return application data with score, note, and reviewer
          return {
            ...data,
            scoring: scoringSnapshot.docs.map((doc) => {
              const scoreData = doc.data();
              const reviewerName = reviewerMapping.get(scoreData.adminId) || 'Unknown Reviewer';
              return {
                score: scoreData.score,
                note: scoreData.note,
                reviewer: reviewerName,
              };
            }),
          };
        }
      }),
    );

    // Filter out undefined values (applications that were skipped)
    const filteredApplications = applications.filter((app) => app !== undefined);

    return res.status(200).json(filteredApplications);
  } catch (error) {
    console.error('Error when fetching applications from common pool', error);
    res.status(500).json({
      code: 'internal-error',
      message: 'Something went wrong when processing this request. Try again later.',
    });
  }
  return;
}

/**
 * Get application for review from common pool
 *
 * Corresponds to /api/applications/reviews route;
 */
export default function handleApplications(req: NextApiRequest, res: NextApiResponse) {
  // Get /applications collection in Cloud Firestore
  // GET: Return applications for reviews based on reviewer
  const { method } = req;
  if (method === 'GET') {
    return handleGetApplicationForReviewFromCommonPool(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
