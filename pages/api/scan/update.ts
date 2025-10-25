import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../../lib/admin/init';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';

initializeApi();
const db = firestore();
const SCANTYPES_COLLECTION = '/scan-types';
const REGISTRATION_COLLECTION = '/registrations';

async function checkIfNameAlreadyExists(name: string, excludePrecedence?: number) {
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('name', '==', name).get();

  if (excludePrecedence !== undefined) {
    // Filter out the current scan being updated
    const filteredDocs = snapshot.docs.filter((doc) => doc.data().precedence !== excludePrecedence);
    return filteredDocs.length > 0;
  }

  return !snapshot.empty;
}

async function checkIfCheckInAlreadyExists() {
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('isCheckIn', '==', true).get();
  return !snapshot.empty;
}

async function updateUserDoc(oldScanName: string, newScanName: string) {
  try {
    const snapshot = await db.collection(REGISTRATION_COLLECTION).get();
    snapshot.forEach(async (doc) => {
      if (doc.data().scans) {
        const newScans = doc
          .data()
          .scans.map((scan) => (scan === oldScanName ? newScanName : scan));
        await db
          .collection(REGISTRATION_COLLECTION)
          .doc(doc.id)
          .update({
            ...doc.data(),
            scans: newScans,
          });
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function updateScanType(req: NextApiRequest, res: NextApiResponse) {
  let scanData;
  try {
    // Handle both cases: body already parsed or needs parsing
    if (typeof req.body === 'string') {
      scanData = JSON.parse(req.body);
    } else if (typeof req.body === 'object' && req.body !== null) {
      scanData = req.body;
    } else {
      throw new Error('Invalid body type');
    }
  } catch (error) {
    console.error('Could not parse request JSON body:', error);
    return res.status(400).json({
      msg: 'Invalid JSON in request body',
    });
  }

  console.log('Received scan data:', scanData);

  // Extract the actual scan data from the wrapper
  const actualScanData = scanData.scanData || scanData;
  console.log('Actual scan data:', actualScanData);
  console.log('Scan name:', actualScanData?.name);

  if (!actualScanData) {
    console.log('Validation failed: missing scan data');
    return res.status(400).json({
      msg: 'Scan data is required',
    });
  }

  // Only require name if we're updating the name
  if (actualScanData.name !== undefined && !actualScanData.name) {
    console.log('Validation failed: name is empty');
    return res.status(400).json({
      msg: 'Scan name cannot be empty',
    });
  }

  actualScanData.name = actualScanData.name.trim();
  try {
    const snapshot = await db
      .collection(SCANTYPES_COLLECTION)
      .where('precedence', '==', actualScanData.precedence)
      .get();
    if (snapshot.empty) {
      return res.status(404).json({
        msg: 'ScanTypes not found',
      });
    }

    if (await checkIfNameAlreadyExists(actualScanData.name, actualScanData.precedence)) {
      return res.status(400).json({
        msg: 'Scantype already exists',
      });
    }

    snapshot.forEach(async (doc) => {
      await updateUserDoc(doc.data().name, actualScanData.name);
      await db
        .collection(SCANTYPES_COLLECTION)
        .doc(doc.id)
        .update({
          ...actualScanData,
          startTime: new Date(actualScanData.startTime),
          endTime: new Date(actualScanData.endTime),
          netPoints: actualScanData.netPoints || 0,
          isSwag: actualScanData.isSwag || false,
          isReclaimable: actualScanData.isReclaimable || false,
        });
    });
    return res.status(200).json({
      msg: 'update completed',
    });
  } catch (error) {
    return res.status(500).json({
      msg: 'Unexpected error. Please try again later',
    });
  }
}

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  const userToken = req.headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin']);
  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not allowed to perform super admin functionality',
    });
  }

  return updateScanType(req, res);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case 'POST': {
      return handlePostRequest(req, res);
    }
    default: {
      return res.status(404).json({
        msg: 'Route not found',
      });
    }
  }
}
