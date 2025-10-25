import { NextApiRequest, NextApiResponse } from 'next';
import { auth, firestore } from 'firebase-admin';
import initializeApi from '../../lib/admin/init';
import { userIsAuthorized } from '../../lib/authorization/check-authorization';
// Registration type is available globally from lib/types.d.ts

initializeApi();

const db = firestore();

const REGISTRATION_COLLECTION = '/registrations';
const SCANTYPES_COLLECTION = '/scan-types';

// Used to dictate that user attempted to claim swag without checking in
const ILLEGAL_SCAN_NAME = 'Illegal Scan';

const ENABLE_ACCEPT_REJECT_FEATURE = false;

/**
 *
 * Check if a user has checked in into the event
 *
 * @param scans list of scantypes
 * @return true if user has checked in, false otherwise
 */
async function userAlreadyCheckedIn(scans: string[]) {
  if (scans.length === 0) return false;
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('name', 'in', scans).get();
  let ok = false;
  snapshot.forEach((doc) => {
    if (doc.data().isCheckIn) {
      ok = true;
    }
  });
  return ok;
}

async function checkLateCheckInEligible(userData: Registration) {
  const lateCheckInManager = await db.collection('/miscellaneous').doc('lateCheckInManager').get();
  if (lateCheckInManager && lateCheckInManager.exists) {
    return (
      userData.waitListInfo?.waitlistNumber !== undefined &&
      userData.waitListInfo.waitlistNumber <= lateCheckInManager.data().allowedCheckInUpperBound
    );
  }
  // if no late check-in doc, assume that organizers does not want to use this feature.
  return true;
}

async function checkUserIsRejected(userId: string): Promise<boolean> {
  const snapshot = await db.collection('scoring').where('hackerId', '==', userId).get();
  if (snapshot.docs.length === 0) {
    return true;
  }
  const appScore = snapshot.docs.reduce((acc, doc) => {
    const scoreMultiplier = !!doc.data().isSuperVote ? 50 : 1;
    if (doc.data().score === 4) return acc + scoreMultiplier;
    if (doc.data().score === 1) return acc - scoreMultiplier;
    return acc;
  }, 0);
  // if user is not accepted by the time they are being checked in, assume that they will be rejected
  return appScore < 2;
}

/**
 *
 * Check if provided scan name corresponds to a check in scan-type
 *
 * @param scan name of scan
 * @returns true if scan name corresponds to a check-in scan-type, false otherwise
 */
async function checkIfScanIsCheckIn(scan: string) {
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('name', '==', scan).get();
  let ok = false;
  snapshot.forEach((doc) => {
    if (doc.data().isCheckIn) {
      ok = true;
    }
  });
  return ok;
}

/**
 * Handles GET requests to /api/scantypes.
 *
 * This returns all scantypes the user is authorized to see.
 *
 * @param req The HTTP request
 * @param res The HTTP response
 */
async function handleScan(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Handle user authorization
  const {
    query: { token },
    body,
    headers,
  } = req;

  let bodyData;
  try {
    // Handle both cases: body already parsed or needs parsing
    if (typeof body === 'string') {
      bodyData = JSON.parse(body);
    } else if (typeof body === 'object' && body !== null) {
      bodyData = body;
    } else {
      throw new Error('Invalid body type');
    }
  } catch (error) {
    console.error('Could not parse request JSON body:', error);
    return res.status(400).json({
      code: 'invalid-json',
      message: 'Invalid JSON in request body',
    });
  }

  //
  // Check if request header contains token
  // TODO: Figure out how to handle the string | string[] mess.
  const userToken = (token as string) || (headers['authorization'] as string);
  // TODO: Extract from bearer token
  // Probably not safe
  const isAuthorized = await userIsAuthorized(userToken, ['admin', 'super_admin']);
  if (!isAuthorized) {
    return res.status(401).send({
      type: 'request-unauthorized',
      message: 'Request is not authorized to perform admin functionality.',
    });
  }

  try {
    const snapshot = await db.collection(REGISTRATION_COLLECTION).doc(bodyData.id).get();
    if (!snapshot.exists)
      return res.status(404).json({ code: 'not found', message: "User doesn't exist..." });

    const userData = snapshot.data();
    if (!userData) {
      return res.status(404).json({ code: 'not found', message: 'User data not found...' });
    }

    let scans = (userData.scans ?? []).map((obj: any) =>
      typeof obj === 'string' ? obj : obj.name,
    );

    const userCheckedIn = await userAlreadyCheckedIn(scans);
    const scanIsCheckInEvent = await checkIfScanIsCheckIn(bodyData.scan);

    if (!userCheckedIn && scanIsCheckInEvent && ENABLE_ACCEPT_REJECT_FEATURE) {
      // if user is reject and not eligible for late check-in yet, throw error
      const userIsRejected = await checkUserIsRejected(snapshot.id);
      const lateCheckInEligible = await checkLateCheckInEligible(userData as Registration);
      if (userIsRejected && !lateCheckInEligible) {
        return res
          .status(400)
          .json({ code: 'non eligible', message: 'User is not eligible for late check-in yet...' });
      }
    }

    if (!userCheckedIn && !scanIsCheckInEvent) {
      scans.push({
        name: ILLEGAL_SCAN_NAME,
        timestamp: new Date().toISOString(),
      });
      await db.collection(REGISTRATION_COLLECTION).doc(bodyData.id).update({ scans });
      return res.status(403).json({
        code: 'not-checked-in',
        message: 'User has not checked in',
      });
    }

    // Check for duplicate scans (unless reclaimable)
    const scanTypeSnapshot = await db
      .collection(SCANTYPES_COLLECTION)
      .where('name', '==', bodyData.scan)
      .get();
    let scanType = null;
    if (!scanTypeSnapshot.empty) {
      scanType = scanTypeSnapshot.docs[0].data();
      console.log('Scan type found:', scanType);
    } else {
      console.log('No scan type found for:', bodyData.scan);
    }

    // Check if scan is reclaimable
    const isReclaimable = scanType?.isReclaimable || false;

    if (!isReclaimable && scans.includes(bodyData.scan)) {
      return res.status(201).json({ code: 'duplicate' });
    }

    // Calculate points to award
    const pointsToAward = scanType?.netPoints || 0;
    console.log('Points to award:', pointsToAward);
    const currentPoints = userData.points || 0;

    // Check if user has enough points for negative point scans (spending)
    if (pointsToAward < 0 && currentPoints < Math.abs(pointsToAward)) {
      return res.status(400).json({
        code: 'insufficient-points',
        message: `Insufficient points! You need ${Math.abs(
          pointsToAward,
        )} points but only have ${currentPoints}.`,
        required: Math.abs(pointsToAward),
        current: currentPoints,
      });
    }

    const newPoints = currentPoints + pointsToAward;

    // Add scan record
    const scanRecord = {
      name: bodyData.scan,
      timestamp: new Date().toISOString(),
      netPoints: pointsToAward,
    };
    scans.push(scanRecord);

    // Update user document with new points and scan record
    try {
      await db.collection(REGISTRATION_COLLECTION).doc(bodyData.id).update({
        scans,
        points: newPoints,
      });
      console.log('Successfully updated user points:', newPoints);
    } catch (updateError) {
      console.error('Error updating user points:', updateError);
      throw updateError;
    }

    res.status(200).json({
      pointsAwarded: pointsToAward,
      newTotalPoints: newPoints,
      message:
        pointsToAward > 0
          ? `+${pointsToAward} points awarded!`
          : pointsToAward < 0
          ? `${pointsToAward} points deducted!`
          : 'Scan recorded!',
    });
  } catch (error) {
    console.error('Error when fetching applications', error);
    res.status(500).json({
      code: 'internal-error',
      message: 'Something went wrong when processing this request. Try again later.',
    });
  }
}

type ApplicationsResponse = {};

/**
 * Fetches scantype data.
 *
 * Corresponds to /api/scantypes route.
 */
export default async function handleScanTypes(
  req: NextApiRequest,
  res: NextApiResponse<ApplicationsResponse>,
) {
  const { method } = req;

  if (method === 'POST') {
    return handleScan(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
