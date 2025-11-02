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
  confirmedAccepted: number;
  confirmedRejected: number;
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

  // Get super admin users separately (for stats only, not leaderboard)
  const superAdminUsersSnapshot = await db
    .collection(USERS_COLLECTION)
    .where('user.permissions', 'array-contains', 'super_admin')
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
  const superAdminIds = new Set<string>();

  // Initialize all admin users with zero stats (for leaderboard display)
  adminUsersSnapshot.forEach((doc) => {
    const data = doc.data();

    // Skip if user data is malformed
    if (!data || !data.user) {
      return;
    }

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

  // Track super admin IDs (for stats calculation only, not for leaderboard)
  superAdminUsersSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data && data.user) {
      superAdminIds.add(doc.id);
    }
  });

  // Get scoring data for each admin individually (more targeted queries)
  const scoringPromises = Array.from(adminIds).map(async (adminId) => {
    const scoringSnapshot = await db
      .collection(SCORING_COLLECTION)
      .where('adminId', '==', adminId)
      .get();

    return { adminId, scoringSnapshot, isSuperAdmin: false };
  });

  // Get scoring data for super admins (for stats calculation only)
  const superAdminScoringPromises = Array.from(superAdminIds).map(async (adminId) => {
    const scoringSnapshot = await db
      .collection(SCORING_COLLECTION)
      .where('adminId', '==', adminId)
      .get();

    return { adminId, scoringSnapshot, isSuperAdmin: true };
  });

  // Get scoring data for auto-reject-system (for converted incomplete registrations)
  // These should count toward confirmed rejected stats but not appear on leaderboard
  const autoRejectScoring = await db
    .collection(SCORING_COLLECTION)
    .where('adminId', '==', 'auto-reject-system')
    .get();

  const scoringResults = await Promise.all([...scoringPromises, ...superAdminScoringPromises]);

  // Add auto-reject scores to results (treated like super admin - counts for stats but not leaderboard)
  if (!autoRejectScoring.empty) {
    scoringResults.push({
      adminId: 'auto-reject-system',
      scoringSnapshot: autoRejectScoring,
      isSuperAdmin: true, // Treat like super admin so it doesn't appear on leaderboard
    });
  }

  // Track unique applications that have been judged at least once
  const judgedApplicationIds = new Set<string>();

  // Track applications that have been reviewed at least twice
  const applicationReviewCounts = new Map<string, number>();

  // Track application scores for final decision calculation
  const applicationScores = new Map<string, number>();

  // Process scoring data for each admin and super admin
  scoringResults.forEach(({ adminId, scoringSnapshot, isSuperAdmin }) => {
    scoringSnapshot.forEach((doc) => {
      const data = doc.data();
      const hackerId = data.hackerId;
      const score = data.score;
      const isSuperVote = data.isSuperVote || false;
      const appIsAssigned = data.appIsAssigned || false;

      // Track applications that have been judged at least once (including by super admins)
      if (hackerId) {
        judgedApplicationIds.add(hackerId);

        // Count reviews per application (including super admin reviews)
        const currentCount = applicationReviewCounts.get(hackerId) || 0;
        applicationReviewCounts.set(hackerId, currentCount + 1);

        // Calculate application scores for final decisions (including super admin scores)
        const currentScore = applicationScores.get(hackerId) || 0;
        const scoreMultiplier = isSuperVote ? 50 : 1;

        if (score === 4) {
          // Accept scores add to total
          applicationScores.set(hackerId, currentScore + scoreMultiplier);
        } else if (score === 1) {
          // Reject scores subtract from total
          applicationScores.set(hackerId, currentScore - scoreMultiplier);
        }
        // Maybe scores (2 and 3) don't change the total (neutral)
      }

      // Process stats for this admin ONLY if they're not a super admin
      // Super admins should not appear on the leaderboard itself
      if (!isSuperAdmin && adminStats.has(adminId)) {
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

  // Calculate confirmed accepted and rejected applications
  const APPLICATION_POINT_THRESHOLD = 2;
  let confirmedAccepted = 0;
  let confirmedRejected = 0;

  applicationScores.forEach((score) => {
    if (score >= APPLICATION_POINT_THRESHOLD) {
      confirmedAccepted++;
    } else {
      confirmedRejected++;
    }
  });

  return {
    adminStats: sortedLeaderboardData,
    totalApplications,
    judgedApplications: judgedApplicationIds.size, // Applications judged at least once
    applicationsReviewedTwice, // Applications reviewed at least twice
    confirmedAccepted, // Applications with score >= 2 (confirmed accepted)
    confirmedRejected, // Applications with score < 2 (confirmed rejected)
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
