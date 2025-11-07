import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../lib/admin/init';
import { userIsAuthorized } from '../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();

async function handleClearCheckIns(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;
  const userToken = headers['authorization'] as string;

  // Only super admins can clear check-ins
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin']);
  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform this action.',
    });
  }

  try {
    console.log('Starting to clear check-in scans...');

    const snapshot = await db.collection('/registrations').get();
    console.log(`Found ${snapshot.size} users to process`);

    let updatedCount = 0;
    let totalScansRemoved = 0;

    const batch = db.batch();
    let batchCount = 0;
    const batches: FirebaseFirestore.WriteBatch[] = [batch];

    for (const doc of snapshot.docs) {
      const userData = doc.data();

      if (userData.scans && Array.isArray(userData.scans) && userData.scans.length > 0) {
        // Filter out any scans that have "check-in" or "checkin" in the name (case insensitive)
        const originalScansCount = userData.scans.length;
        const filteredScans = userData.scans.filter((scan: any) => {
          const scanName = typeof scan === 'string' ? scan : scan.name;
          const isCheckIn =
            scanName.toLowerCase().includes('check-in') ||
            scanName.toLowerCase().includes('checkin');
          return !isCheckIn;
        });

        const scansRemoved = originalScansCount - filteredScans.length;

        if (scansRemoved > 0) {
          // Calculate points to deduct
          const pointsToDeduct = userData.scans
            .filter((scan: any) => {
              const scanName = typeof scan === 'string' ? scan : scan.name;
              return (
                scanName.toLowerCase().includes('check-in') ||
                scanName.toLowerCase().includes('checkin')
              );
            })
            .reduce((total: number, scan: any) => {
              const points = typeof scan === 'object' && scan.netPoints ? scan.netPoints : 0;
              return total + points;
            }, 0);

          const newPoints = (userData.points || 0) - pointsToDeduct;

          const currentBatch = batches[batches.length - 1];
          currentBatch.update(doc.ref, {
            scans: filteredScans,
            points: newPoints >= 0 ? newPoints : 0,
          });

          updatedCount++;
          totalScansRemoved += scansRemoved;
          batchCount++;

          console.log(
            `User ${doc.id}: Removed ${scansRemoved} check-in scan(s), deducted ${pointsToDeduct} points`,
          );

          // Create new batch every 500 operations (Firestore limit)
          if (batchCount >= 500) {
            batches.push(db.batch());
            batchCount = 0;
          }
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
    console.log(`Total check-in scans removed: ${totalScansRemoved}`);

    res.status(200).json({
      msg: 'Check-in scans cleared successfully!',
      usersUpdated: updatedCount,
      scansRemoved: totalScansRemoved,
    });
  } catch (error) {
    console.error('Error clearing check-in scans:', error);
    res.status(500).json({
      msg: 'Error clearing check-in scans',
      error: error.message,
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    return handleClearCheckIns(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
