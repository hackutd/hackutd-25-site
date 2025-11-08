import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../lib/admin/init';
import { normalizeGroupName } from '@/lib/stats/group';

const SCANTYPES_COLLECTION = '/scan-types';

async function getCheckInEventName() {
  const db = firestore();
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('isCheckIn', '==', true).get();
  let checkInEventName = '';
  snapshot.forEach((doc) => {
    checkInEventName = doc.data().name;
  });
  return checkInEventName;
}

export interface GroupLeaderboardData {
  group: 'Raven' | 'Cat' | 'Deer' | 'Fox';
  totalPoints: number;
  memberCount: number;
  averagePoints: number;
  topMembers: Array<{
    name: string;
    email: string;
    points: number;
  }>;
}

interface ResponseData {
  leaderboard: GroupLeaderboardData[];
  totalUsers: number;
  topHackersOverall: Array<{
    name: string;
    email: string;
    points: number;
    group: string;
  }>;
  lastUpdated: string;
  cached?: boolean;
}

// Cache to store results for 2 minutes
let cachedData: ResponseData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Allow forcing a refresh with ?refresh=true
  const forceRefresh = req.query.refresh === 'true';

  // Check if we have cached data that's still fresh
  const now = Date.now();
  if (!forceRefresh && cachedData && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
    console.log('Returning cached leaderboard data');
    return res.status(200).json({ ...cachedData, cached: true });
  }

  try {
    console.log('Fetching fresh leaderboard data...');
    initializeApi();
    const db = firestore();

    // Get the check-in event name
    const checkInEventName = await getCheckInEventName();
    const snapshot = await db.collection('/registrations').get();
    console.log(`Processing ${snapshot.size} registrations...`);

    // Calculate points per group
    type GroupName = GroupLeaderboardData['group'];
    const groupData: Record<
      GroupName,
      {
        totalPoints: number;
        members: Array<{ name: string; email: string; points: number }>;
      }
    > = {
      Raven: { totalPoints: 0, members: [] },
      Cat: { totalPoints: 0, members: [] },
      Deer: { totalPoints: 0, members: [] },
      Fox: { totalPoints: 0, members: [] },
    };

    // Track all checked-in users for overall top 5
    const allCheckedInUsers: Array<{
      name: string;
      email: string;
      points: number;
      group: GroupName;
    }> = [];

    let processedCount = 0;
    snapshot.docs.forEach((doc) => {
      const userData = doc.data();
      const group = normalizeGroupName(userData.user?.group) as GroupName | undefined;

      // Skip early if no group or group not in our list
      if (!group || !groupData[group]) return;

      const scans = userData['scans'];
      if (!scans || !Array.isArray(scans) || scans.length === 0) return;

      // Check if user has the check-in scan first (faster to bail early)
      const hasCheckIn = scans.some((scan: any) => {
        const scanName = typeof scan === 'string' ? scan : scan.name;
        return scanName === checkInEventName;
      });

      if (!hasCheckIn) return;

      // Calculate TOTAL POINTS EARNED (only positive points, not net)
      let totalPointsEarned = 0;
      for (const scan of scans) {
        // Handle both old (string) and new (object) formats
        if (typeof scan === 'object' && scan.netPoints) {
          const points = scan.netPoints;
          if (points > 0) {
            totalPointsEarned += points;
          }
        }
      }

      // Fallback: if no netPoints data, calculate as currentPoints + pointsSpent
      if (totalPointsEarned === 0 && scans.length > 0) {
        const currentPoints = userData.points || 0;
        const pointsSpent = Math.abs(
          scans
            .filter((scan: any) => typeof scan === 'object' && (scan.netPoints || 0) < 0)
            .reduce((sum: number, scan: any) => sum + (scan.netPoints || 0), 0),
        );
        totalPointsEarned = currentPoints + pointsSpent;
      }

      const firstName = userData.user?.firstName || '';
      const lastName = userData.user?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const email = userData.user?.preferredEmail || '';

      groupData[group].totalPoints += totalPointsEarned;
      groupData[group].members.push({
        name: fullName,
        email,
        points: totalPointsEarned,
      });

      // Add to overall list
      allCheckedInUsers.push({
        name: fullName,
        email,
        points: totalPointsEarned,
        group,
      });

      processedCount++;
    });

    console.log(`Processed ${processedCount} checked-in users`);

    // Build leaderboard
    const leaderboard: GroupLeaderboardData[] = (Object.keys(groupData) as GroupName[]).map(
      (group) => {
        const data = groupData[group];
        const sortedMembers = data.members.sort((a, b) => b.points - a.points);
        const topMembers = sortedMembers.slice(0, 5);

        return {
          group,
          totalPoints: data.totalPoints,
          memberCount: data.members.length,
          averagePoints:
            data.members.length > 0 ? Math.round(data.totalPoints / data.members.length) : 0,
          topMembers,
        };
      },
    );

    // Sort by average points (as used in the modal)
    leaderboard.sort((a, b) => b.averagePoints - a.averagePoints);

    // Get top 5 hackers overall
    const topHackersOverall = allCheckedInUsers.sort((a, b) => b.points - a.points).slice(0, 5);

    const responseData: ResponseData = {
      leaderboard,
      totalUsers: allCheckedInUsers.length, // Only count checked-in users
      topHackersOverall,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the results
    cachedData = responseData;
    cacheTimestamp = Date.now();
    console.log('Leaderboard data cached successfully');

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching group leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
}
