import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { fieldNames, statRecordTypes } from '../../hackportal.config';
import initializeApi from '../../lib/admin/init';
import { userIsAuthorized } from '../../lib/authorization/check-authorization';
import { arrayFields, singleFields } from '../../lib/stats/field';

initializeApi();
const db = firestore();

const USERS_COLLECTION = '/registrations';
const SCANTYPES_COLLECTION = '/scan-types';

async function getCheckInEventName() {
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('isCheckIn', '==', true).get();
  let checkInEventName = '';
  snapshot.forEach((doc) => {
    checkInEventName = doc.data().name;
  });
  return checkInEventName;
}

async function getStatsData() {
  const checkInEventName = await getCheckInEventName();
  // const swagData: Record<string, number> = {};
  const statRecords: any = {};
  for (const field in fieldNames) {
    statRecords[field] = {};
  }

  // Ensure all array fields are initialized
  arrayFields.forEach((field) => {
    if (!statRecords[field]) {
      statRecords[field] = {};
    }
  });

  const generalStats: GeneralStats & statRecordTypes = {
    superAdminCount: 0,
    checkedInCount: 0,
    hackerCount: 0,
    adminCount: 0,
    scans: {},
    timestamp: {},
    codeOfConduct: {},
    disclaimer: {},
    ...statRecords,
  };
  const scoreData = await db.collection('/scoring').get();
  const userScoreMapping = new Map<string, number>();
  scoreData.forEach((doc) => {
    const currentUserScore = userScoreMapping.has(doc.data().hackerId)
      ? userScoreMapping.get(doc.data().hackerId)
      : 0;
    const currentDelta =
      (doc.data().score === 4 ? 1 : doc.data().score === 1 ? -1 : 0) *
      (!!doc.data().isSuperVote ? 50 : 1);
    userScoreMapping.set(doc.data().hackerId, currentUserScore + currentDelta);
  });
  const snapshot = await db.collection(USERS_COLLECTION).get();
  snapshot.forEach((doc) => {
    const userData = doc.data();

    // Handle malformed users more carefully
    if (!userData) {
      console.warn('Completely missing user data:', doc.id);
      return; // Skip only if completely missing
    }

    // Skip users without proper user structure - don't auto-assign permissions
    if (!userData.user) {
      console.warn('Missing user object, skipping:', doc.id);
      return;
    }

    const date = doc.createTime.toDate();
    const stringDate = `${date.getMonth() + 1}-${date.getDate()}`;
    if (userData['scans'] && Array.isArray(userData['scans'])) {
      // Handle both string and object formats for scans
      const hasCheckIn = userData['scans'].some((scan: any) => {
        const scanName = typeof scan === 'string' ? scan : scan.name;
        return scanName === checkInEventName;
      });
      if (hasCheckIn) {
        generalStats.checkedInCount++;
      }
    }
    if (!userScoreMapping.has(userData.id) || userScoreMapping.get(userData.id) < 0) {
      return;
    }

    if (!generalStats.timestamp.hasOwnProperty(stringDate)) {
      generalStats.timestamp[stringDate] = 0;
    }
    generalStats.timestamp[stringDate]++;

    for (let arrayField of arrayFields) {
      if (!userData[arrayField] || !Array.isArray(userData[arrayField])) continue;

      userData[arrayField].forEach((data: any) => {
        // Handle scans specially since they can be strings or objects
        if (arrayField === 'scans') {
          const scanName = typeof data === 'string' ? data : data.name;
          if (scanName && scanName !== checkInEventName) {
            // Don't double-count check-ins, but count other scans
            // Ensure the field object exists
            if (!generalStats[arrayField]) {
              generalStats[arrayField] = {};
            }
            if (!generalStats[arrayField].hasOwnProperty(scanName)) {
              generalStats[arrayField][scanName] = 0;
            }
            generalStats[arrayField][scanName]++;
          }
        } else {
          // Handle other array fields normally (strings)
          const fieldValue = typeof data === 'string' ? data : data.toString();
          // Ensure the field object exists
          if (!generalStats[arrayField]) {
            generalStats[arrayField] = {};
          }
          if (!generalStats[arrayField].hasOwnProperty(fieldValue)) {
            generalStats[arrayField][fieldValue] = 0;
          }
          generalStats[arrayField][fieldValue]++;
        }
      });
    }

    for (let singleField of singleFields) {
      if (!userData[singleField] || userData[singleField] === '') continue;
      if (!generalStats[singleField].hasOwnProperty(userData[singleField])) {
        generalStats[singleField][userData[singleField]] = 0;
      }
      generalStats[singleField][userData[singleField]]++;
    }

    // Handle user permissions - only count users with valid permissions
    const userPermissions = userData.user?.permissions;

    if (!userPermissions || !Array.isArray(userPermissions) || userPermissions.length === 0) {
      console.warn('User has no valid permissions, skipping:', doc.id);
      return;
    }

    const userPermission = userPermissions[0];

    switch (userPermission) {
      case 'super_admin': {
        generalStats.superAdminCount++;
        break;
      }
      case 'admin':
      case 'organizer':
      case 'judge': {
        generalStats.adminCount++;
        break;
      }
      case 'hacker': {
        generalStats.hackerCount++;
        break;
      }
      default: {
        console.warn('Unknown permission type:', userPermission, 'for user:', doc.id);
        // Don't count unknown permission types
        break;
      }
    }
  });

  return generalStats;
}

async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;
  const userToken = headers['authorization'];
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin']);

  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform super admin functionality',
    });
  }

  // Start getting data here
  const statsData = await getStatsData();
  return res.json(statsData);
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
