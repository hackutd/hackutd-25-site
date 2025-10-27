import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../../lib/admin/init';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';

initializeApi();
const db = firestore();
const SCANTYPES_COLLECTION = '/scan-types';

async function checkIfNameAlreadyExists(name: string) {
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('name', '==', name).get();
  return !snapshot.empty;
}

async function checkIfCheckInAlreadyExists() {
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('isCheckIn', '==', true).get();
  return !snapshot.empty;
}

async function createScan(req: NextApiRequest, res: NextApiResponse) {
  try {
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
    if (await checkIfNameAlreadyExists(scanData.name)) {
      return res.status(400).json({
        msg: 'Scantype already exists',
      });
    }

    if (scanData.isCheckIn) {
      const hasCheckIn = await checkIfCheckInAlreadyExists();
      if (hasCheckIn) {
        return res.status(400).json({
          msg: 'Check-in scantype already exists',
        });
      }
    }

    await db.collection(SCANTYPES_COLLECTION).add({
      ...scanData,
      startTime: new Date(scanData.startTime),
      endTime: new Date(scanData.endTime),
      netPoints: scanData.netPoints || 0,
      isSwag: scanData.isSwag || false,
      isReclaimable: scanData.isReclaimable || false,
    });
    return res.status(201).json({
      msg: 'ScanType created',
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
      statusCode: 403,
      msg: 'Request is not authorized to perform admin functionality',
    });
  }

  return createScan(req, res);
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
