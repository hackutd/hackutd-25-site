import { NextApiRequest, NextApiResponse } from 'next';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';
import initializeApi from '../../../lib/admin/init';
import { firestore } from 'firebase-admin';

initializeApi();
const db = firestore();

async function removeAllWaitlistEntries() {
  // Get all registrations with waitlist info
  const snapshot = await db.collection('/registrations').where('waitListInfo', '!=', null).get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      waitListInfo: firestore.FieldValue.delete(),
    });
  });

  await batch.commit();
  console.log(`[WAITLIST CLEAR] Removed ${snapshot.docs.length} people from the waitlist`);
  return snapshot.docs.length;
}

async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;
  const userToken = headers['authorization'];
  const isAuthorized = await userIsAuthorized(userToken, ['admin', 'super_admin']);
  if (!isAuthorized) {
    return res.status(403).json({
      statusCode: 403,
      msg: 'Request is not authorized to perform admin functionality',
    });
  }
  try {
    const removedCount = await removeAllWaitlistEntries();

    // Reset the waitlist counter to 1
    const managerDoc = await db.collection('/miscellaneous').doc('lateCheckInManager').get();
    if (managerDoc && managerDoc.exists) {
      await managerDoc.ref.update({
        nextAvailableNumber: 1,
        allowedCheckInUpperBound: 0,
      });
      console.log(
        '[WAITLIST CLEAR] Reset nextAvailableNumber to 1 and allowedCheckInUpperBound to 0',
      );
    }

    return res.status(200).json({
      statusCode: 200,
      msg: `Successfully removed ${removedCount} people from the waitlist and reset counter`,
      removedFromWaitlist: removedCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      msg: 'Unexpected error...',
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case 'DELETE': {
      return handleDeleteRequest(req, res);
    }
    default: {
      return res.status(404).json({ msg: 'Route not found' });
    }
  }
}
