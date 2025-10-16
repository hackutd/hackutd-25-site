import initializeApi from '@/lib/admin/init';
import { extractUserDataFromToken } from '@/lib/authorization/check-authorization';
import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';

initializeApi();
const db = firestore();
const SCORING_COLLECTION = '/scoring';
const USERS_COLLECTION = '/registrations';

interface AdminReviewStats {
  adminId: string;
  adminName: string;
  totalReviews: number;
  accepts: number;
  rejects: number;
  maybes: number;
  superVotes: number;
  acceptanceRate: number;
  rejectionRate: number;
  maybeRate: number;
}

interface LeaderboardResponse {
  adminStats: AdminReviewStats[];
  totalApplications: number;
  judgedApplications: number;
}

async function userIsAuthorized(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const userData = await extractUserDataFromToken(token);
    return (
      userData?.user?.permissions?.includes('super_admin') ||
      userData?.user?.permissions?.includes('admin') ||
      false
    );
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function getAdminLeaderboardData(): Promise<LeaderboardResponse> {
  // Get all scoring data
  const scoringSnapshot = await db.collection(SCORING_COLLECTION).get();

  // Get total applications count (only hackers, not admins)
  const applicationsSnapshot = await db
    .collection(USERS_COLLECTION)
    .where('user.permissions', 'array-contains', 'hacker')
    .get();
  const totalApplications = applicationsSnapshot.size;

  // Track unique applications that have been judged at least once
  const judgedApplicationIds = new Set<string>();

  // First, get all admin users (only admins, not super_admins)
  const adminUsersSnapshot = await db
    .collection(USERS_COLLECTION)
    .where('user.permissions', 'array-contains', 'admin')
    .get();

  // Initialize all admin stats with zeros
  const adminStats = new Map<
    string,
    {
      totalReviews: number;
      accepts: number;
      rejects: number;
      maybes: number;
      superVotes: number;
    }
  >();

  const adminNames = new Map<string, string>();

  // Initialize all admin users with zero stats
  adminUsersSnapshot.forEach((doc) => {
    const data = doc.data();
    const adminId = doc.id;
    const adminName = `${data.user.firstName} ${data.user.lastName}`;

    adminStats.set(adminId, {
      totalReviews: 0,
      accepts: 0,
      rejects: 0,
      maybes: 0,
      superVotes: 0,
    });

    adminNames.set(adminId, adminName);
  });

  // Now process actual scoring data
  scoringSnapshot.forEach((doc) => {
    const data = doc.data();
    const adminId = data.adminId;
    const hackerId = data.hackerId;
    const score = data.score;
    const isSuperVote = data.isSuperVote || false;

    // Track applications that have been judged at least once
    if (hackerId) {
      judgedApplicationIds.add(hackerId);
    }

    // Only process if this admin is in our admin list
    if (adminStats.has(adminId)) {
      const stats = adminStats.get(adminId)!;
      stats.totalReviews++;

      if (isSuperVote) {
        stats.superVotes++;
      }

      switch (score) {
        case 1: // Reject
          stats.rejects++;
          break;
        case 2: // Maybe No
        case 3: // Maybe Yes
          stats.maybes++;
          break;
        case 4: // Accept
          stats.accepts++;
          break;
      }
    }
  });

  // Convert to array and calculate rates
  const leaderboardData: AdminReviewStats[] = Array.from(adminStats.entries()).map(
    ([adminId, stats]) => {
      const adminName = adminNames.get(adminId) || 'Unknown Admin';
      const totalReviews = stats.totalReviews;

      return {
        adminId,
        adminName,
        totalReviews,
        accepts: stats.accepts,
        rejects: stats.rejects,
        maybes: stats.maybes,
        superVotes: stats.superVotes,
        acceptanceRate: totalReviews > 0 ? Math.round((stats.accepts / totalReviews) * 100) : 0,
        rejectionRate: totalReviews > 0 ? Math.round((stats.rejects / totalReviews) * 100) : 0,
        maybeRate: totalReviews > 0 ? Math.round((stats.maybes / totalReviews) * 100) : 0,
      };
    },
  );

  // Sort by total reviews (descending)
  const sortedLeaderboardData = leaderboardData.sort((a, b) => b.totalReviews - a.totalReviews);

  return {
    adminStats: sortedLeaderboardData,
    totalApplications,
    judgedApplications: judgedApplicationIds.size, // Applications judged at least once
  };
}

async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;
  const userToken = headers['authorization'];
  const isAuthorized = await userIsAuthorized(userToken);

  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform admin functionality',
    });
  }

  try {
    const leaderboardData = await getAdminLeaderboardData();
    return res.status(200).json(leaderboardData);
  } catch (error) {
    console.error('Error fetching admin leaderboard data:', error);
    return res.status(500).json({
      msg: 'Internal server error',
    });
  }
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
