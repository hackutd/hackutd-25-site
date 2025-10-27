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
  applicationsReviewedTwice: number;
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
  // Get total applications count using aggregation (1 read instead of 2,583)
  const applicationsCountSnapshot = await db
    .collection(USERS_COLLECTION)
    .where('user.permissions', 'array-contains', 'hacker')
    .count()
    .get();
  const totalApplications = applicationsCountSnapshot.data().count;

  // Get admin users for names (we still need this for the leaderboard display)
  const adminUsersSnapshot = await db
    .collection(USERS_COLLECTION)
    .where('user.permissions', 'array-contains-any', ['admin', 'organizer', 'judge'])
    .get();

  // Initialize admin stats and names
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
  const adminIds = new Set<string>();

  // Initialize all admin users with zero stats (include super_admins)
  adminUsersSnapshot.forEach((doc) => {
    const data = doc.data();

    // Skip if user data is malformed
    if (!data || !data.user) {
      console.warn('Malformed user data for admin:', doc.id);
      return;
    }

    // Include super admins in leaderboard
    // if (data.user?.permissions?.includes('super_admin')) {
    //   return;
    // }

    const adminId = doc.id;
    const adminName = `${data.user.firstName || 'Unknown'} ${data.user.lastName || ''}`.trim();

    adminStats.set(adminId, {
      totalReviews: 0,
      accepts: 0,
      rejects: 0,
      maybes: 0,
      superVotes: 0,
    });

    adminNames.set(adminId, adminName || 'Unknown Admin');
    adminIds.add(adminId);
  });

  // Get scoring data for each admin individually (more targeted queries)
  const scoringPromises = Array.from(adminIds).map(async (adminId) => {
    const scoringSnapshot = await db
      .collection(SCORING_COLLECTION)
      .where('adminId', '==', adminId)
      .get();

    return { adminId, scoringSnapshot };
  });

  const scoringResults = await Promise.all(scoringPromises);

  console.log('Admin leaderboard debug:');
  console.log('- Total applications:', totalApplications);
  console.log('- Admin users found:', adminUsersSnapshot.docs.length);
  console.log('- Admin IDs:', Array.from(adminIds));
  console.log('- Scoring results:', scoringResults.length);

  // Track unique applications that have been judged at least once
  const judgedApplicationIds = new Set<string>();

  // Track applications that have been reviewed at least twice
  const applicationReviewCounts = new Map<string, number>();

  // Process scoring data for each admin
  scoringResults.forEach(({ adminId, scoringSnapshot }) => {
    console.log(`Processing admin ${adminId}: ${scoringSnapshot.docs.length} reviews`);
    scoringSnapshot.forEach((doc) => {
      const data = doc.data();
      const hackerId = data.hackerId;
      const score = data.score;
      const isSuperVote = data.isSuperVote || false;
      const appIsAssigned = data.appIsAssigned || false;

      // Track applications that have been judged at least once
      if (hackerId) {
        judgedApplicationIds.add(hackerId);

        // Count reviews per application
        const currentCount = applicationReviewCounts.get(hackerId) || 0;
        applicationReviewCounts.set(hackerId, currentCount + 1);
      }

      // Process stats for this admin
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

  // Count applications that have been reviewed at least twice
  const applicationsReviewedTwice = Array.from(applicationReviewCounts.values()).filter(
    (count) => count >= 2,
  ).length;

  console.log('Final leaderboard data:', sortedLeaderboardData);
  console.log('- Judged applications:', judgedApplicationIds.size);
  console.log('- Applications reviewed twice:', applicationsReviewedTwice);

  return {
    adminStats: sortedLeaderboardData,
    totalApplications,
    judgedApplications: judgedApplicationIds.size, // Applications judged at least once
    applicationsReviewedTwice, // Applications reviewed at least twice
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
