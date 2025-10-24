import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../../lib/admin/init';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';

initializeApi();
const db = firestore();
const SCANTYPES_COLLECTION = '/scan-types';
const REGISTRATION_COLLECTION = '/registrations';

async function checkIfNameAlreadyExists(name: string) {
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('name', '==', name).get();
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

  if (!scanData || !scanData.name) {
    return res.status(400).json({
      msg: 'Scan data and name are required',
    });
  }

  scanData.name = scanData.name.trim();
  try {
    const snapshot = await db
      .collection(SCANTYPES_COLLECTION)
      .where('precedence', '==', scanData.precedence)
      .get();
    if (snapshot.empty) {
      return res.status(404).json({
        msg: 'ScanTypes not found',
      });
    }

    if (await checkIfNameAlreadyExists(scanData.name)) {
      return res.status(400).json({
        msg: 'Scantype already exists',
      });
    }

    snapshot.forEach(async (doc) => {
      await updateUserDoc(doc.data().name, scanData.name);
      await db
        .collection(SCANTYPES_COLLECTION)
        .doc(doc.id)
        .update({
          ...scanData,
          startTime: new Date(scanData.startTime),
          endTime: new Date(scanData.endTime),
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
