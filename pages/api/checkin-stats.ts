import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../lib/admin/init';
import { userIsAuthorized } from '../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();
const SCANTYPES_COLLECTION = '/scan-types';

async function getCheckInEventName() {
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('isCheckIn', '==', true).get();
  let checkInEventName = '';
  snapshot.forEach((doc) => {
    checkInEventName = doc.data().name;
  });
  return checkInEventName;
}

async function handleCheckInStats(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;
  const userToken = headers['authorization'] as string;

  // Allow admin, super_admin, and organizer
  const isAuthorized = await userIsAuthorized(userToken, ['admin', 'super_admin', 'organizer']);
  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform this action.',
    });
  }

  try {
    const checkInEventName = await getCheckInEventName();
    const snapshot = await db.collection('/registrations').get();

    let checkedInCount = 0;

    snapshot.forEach((doc) => {
      const userData = doc.data();

      if (userData.scans && Array.isArray(userData.scans)) {
        // Handle both string and object formats for scans
        const hasCheckIn = userData.scans.some((scan: any) => {
          const scanName = typeof scan === 'string' ? scan : scan.name;
          return (
            scanName === checkInEventName ||
            scanName?.toLowerCase().includes('check-in') ||
            scanName?.toLowerCase().includes('checkin')
          );
        });

        if (hasCheckIn) {
          checkedInCount++;
        }
      }
    });

    const percentageCheckedIn = snapshot.size > 0 ? (checkedInCount / snapshot.size) * 100 : 0;

    res.status(200).json({
      totalRegistrations: snapshot.size,
      checkedInCount,
      percentageCheckedIn: parseFloat(percentageCheckedIn.toFixed(2)),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching check-in stats:', error);
    res.status(500).json({
      msg: 'Error fetching check-in stats',
      error: error.message,
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    return handleCheckInStats(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
