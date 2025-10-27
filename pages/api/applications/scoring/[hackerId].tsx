import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../../../lib/admin/init';
import {
  extractUserDataFromToken,
  userIsAuthorized,
} from '../../../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();
const SCORING_COLLECTION = '/scoring';
const USERS_COLLECTION = '/registrations';

/**
 * Get all scoring data for a specific application
 */
async function handleGetScoringData(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;
  const userToken = headers['authorization'];

  const userData = await extractUserDataFromToken(userToken);
  if (!userData) {
    return res.status(401).json({
      msg: 'Invalid or missing authentication token.',
    });
  }

  const isAuthorized = await userIsAuthorized(userToken);
  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform admin functionality.',
    });
  }

  const { hackerId } = req.query;
  if (!hackerId || typeof hackerId !== 'string') {
    return res.status(400).json({
      msg: 'Invalid hacker ID provided.',
    });
  }

  try {
    // Get all scoring data for this application
    const scoringSnapshot = await db
      .collection(SCORING_COLLECTION)
      .where('hackerId', '==', hackerId)
      .get();

    if (scoringSnapshot.empty) {
      return res.status(200).json([]);
    }

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

    // Return complete scoring data with reviewer names
    const scoringData = scoringSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        score: data.score,
        note: data.note,
        adminId: data.adminId,
        reviewer: reviewerMapping.get(data.adminId) || 'Unknown Reviewer',
        isSuperVote: data.isSuperVote || false,
      };
    });

    return res.status(200).json(scoringData);
  } catch (error) {
    console.error('Error fetching scoring data:', error);
    return res.status(500).json({
      msg: 'Internal server error',
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case 'GET': {
      return handleGetScoringData(req, res);
    }
    default: {
      return res.status(404).json({
        msg: 'Route not found',
      });
    }
  }
}
