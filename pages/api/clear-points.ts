import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../lib/admin/init';
import { userIsAuthorized } from '../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();

async function handleClearPoints(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;
  const userToken = headers['authorization'] as string;

  // Only super admins can clear points
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin']);
  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform this action.',
    });
  }

  try {
    console.log('Starting to clear all points...');

    const snapshot = await db.collection('/registrations').get();
    console.log(`Found ${snapshot.size} users to process`);

    let updatedCount = 0;
    let totalPointsCleared = 0;

    const batch = db.batch();
    let batchCount = 0;
    const batches: FirebaseFirestore.WriteBatch[] = [batch];

    for (const doc of snapshot.docs) {
      const userData = doc.data();

      const hasPoints = userData.points && userData.points > 0;
      const hasScans = userData.scans && Array.isArray(userData.scans) && userData.scans.length > 0;

      if (hasPoints || hasScans) {
        if (hasPoints) {
          totalPointsCleared += userData.points;
        }

        const currentBatch = batches[batches.length - 1];
        currentBatch.update(doc.ref, {
          points: 0,
          scans: [], // Remove all scans completely
        });

        updatedCount++;
        batchCount++;

        console.log(
          `User ${doc.id}: Cleared ${userData.points || 0} points and removed ${
            userData.scans?.length || 0
          } scans`,
        );

        // Create new batch every 500 operations (Firestore limit)
        if (batchCount >= 500) {
          batches.push(db.batch());
          batchCount = 0;
        }
      }
    }

    // Commit all batches
    console.log(`Committing ${batches.length} batch(es)...`);
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`Committed batch ${i + 1}/${batches.length}`);
    }

    console.log('\n=== Summary ===');
    console.log(`Total users updated: ${updatedCount}`);
    console.log(`Total points cleared: ${totalPointsCleared}`);

    res.status(200).json({
      msg: 'Points cleared successfully!',
      usersUpdated: updatedCount,
      pointsCleared: totalPointsCleared,
    });
  } catch (error) {
    console.error('Error clearing points:', error);
    res.status(500).json({
      msg: 'Error clearing points',
      error: error.message,
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    return handleClearPoints(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
