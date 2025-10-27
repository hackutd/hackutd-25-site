import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../../lib/admin/init';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';
import { computeHash, determineColorByTeamIdx } from '@/lib/stats/group';

initializeApi();

const db = firestore();
const REGISTRATION_COLLECTION = '/registrations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  // Check authorization
  const userToken = req.headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['admin', 'super_admin']);
  if (!isAuthorized) {
    return res.status(401).json({
      code: 'request-unauthorized',
      message: 'Request is not authorized to perform admin functionality.',
    });
  }

  try {
    // Get all users
    const snapshot = await db.collection(REGISTRATION_COLLECTION).get();

    // Count each group animal
    const groupCounts: Record<string, number> = {};
    const groupDetails: Record<string, any[]> = {};

    snapshot.docs.forEach((doc) => {
      const userData = doc.data();
      if (userData && userData.id) {
        const group = determineColorByTeamIdx(computeHash(userData.id));

        // Count
        groupCounts[group] = (groupCounts[group] || 0) + 1;

        // Store details
        if (!groupDetails[group]) {
          groupDetails[group] = [];
        }
        groupDetails[group].push({
          id: userData.id,
          name: `${userData.user?.firstName || ''} ${userData.user?.lastName || ''}`.trim(),
          email: userData.user?.preferredEmail || '',
          points: userData.points || 0,
        });
      }
    });

    // Sort groups by count (descending)
    const sortedGroups = Object.entries(groupCounts)
      .map(([group, count]) => ({
        group,
        count,
        members: groupDetails[group] || [],
      }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json({
      totalUsers: snapshot.size,
      groups: sortedGroups,
    });
  } catch (error) {
    console.error('Error fetching group stats:', error);
    return res.status(500).json({
      code: 'internal-error',
      message: 'Something went wrong when processing this request.',
    });
  }
}
