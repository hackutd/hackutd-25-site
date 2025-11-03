import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../lib/admin/init';

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
  group: 'Bird' | 'Cat' | 'Deer' | 'Fox';
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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initializeApi();
    const db = firestore();

    // Get the check-in event name
    const checkInEventName = await getCheckInEventName();
    const snapshot = await db.collection('/registrations').get();

    // Calculate points per group
    const groupData: Record<
      string,
      {
        totalPoints: number;
        members: Array<{ name: string; email: string; points: number }>;
      }
    > = {
      Bird: { totalPoints: 0, members: [] },
      Cat: { totalPoints: 0, members: [] },
      Deer: { totalPoints: 0, members: [] },
      Fox: { totalPoints: 0, members: [] },
    };

    // Track all checked-in users for overall top 5
    const allCheckedInUsers: Array<{
      name: string;
      email: string;
      points: number;
      group: string;
    }> = [];

    snapshot.docs.forEach((doc) => {
      const userData = doc.data();
      const group = userData.user?.group;
      const firstName = userData.user?.firstName || '';
      const lastName = userData.user?.lastName || '';
      const email = userData.user?.preferredEmail || '';

      // Calculate total points gained (sum of all positive netPoints from scans)
      let totalPointsGained = 0;
      if (userData['scans'] && Array.isArray(userData['scans'])) {
        totalPointsGained = userData['scans'].reduce((sum: number, scan: any) => {
          const netPoints = scan.netPoints || 0;
          // Only count positive points (points gained, not spent)
          return sum + (netPoints > 0 ? netPoints : 0);
        }, 0);
      }

      // Check if user has the check-in scan
      const hasCheckIn =
        userData['scans'] && Array.isArray(userData['scans'])
          ? userData['scans'].some((scan: any) => {
              const scanName = typeof scan === 'string' ? scan : scan.name;
              return scanName === checkInEventName;
            })
          : false;

      // Only count checked-in users
      if (group && groupData[group] && hasCheckIn) {
        groupData[group].totalPoints += totalPointsGained;
        groupData[group].members.push({
          name: `${firstName} ${lastName}`.trim(),
          email,
          points: totalPointsGained,
        });

        // Add to overall list
        allCheckedInUsers.push({
          name: `${firstName} ${lastName}`.trim(),
          email,
          points: totalPointsGained,
          group,
        });
      }
    });

    // Build leaderboard
    const leaderboard: GroupLeaderboardData[] = Object.entries(groupData).map(([group, data]) => {
      const sortedMembers = data.members.sort((a, b) => b.points - a.points);
      const topMembers = sortedMembers.slice(0, 5);

      return {
        group: group as 'Bird' | 'Cat' | 'Deer' | 'Fox',
        totalPoints: data.totalPoints,
        memberCount: data.members.length,
        averagePoints:
          data.members.length > 0 ? Math.round(data.totalPoints / data.members.length) : 0,
        topMembers,
      };
    });

    // Sort by average points (as used in the modal)
    leaderboard.sort((a, b) => b.averagePoints - a.averagePoints);

    // Get top 5 hackers overall
    const topHackersOverall = allCheckedInUsers.sort((a, b) => b.points - a.points).slice(0, 5);

    res.status(200).json({
      leaderboard,
      totalUsers: allCheckedInUsers.length, // Only count checked-in users
      topHackersOverall,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching group leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
}
