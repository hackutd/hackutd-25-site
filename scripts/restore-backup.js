const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

async function restoreCollection(collectionName, backupData) {
  console.log(`\nRestoring collection: ${collectionName}...`);
  console.log(`  Documents to restore: ${backupData.documents.length}`);

  if (backupData.documents.length === 0) {
    console.log('  Skipping - no documents to restore');
    return 0;
  }

  let restoredCount = 0;
  const batch = db.batch();
  let batchCount = 0;

  for (const doc of backupData.documents) {
    const docRef = db.collection(collectionName).doc(doc.id);
    batch.set(docRef, doc.data, { merge: false }); // Use merge: false to overwrite
    batchCount++;

    // Commit batch every 500 operations (Firestore limit)
    if (batchCount >= 500) {
      await batch.commit();
      restoredCount += batchCount;
      console.log(`  Committed ${restoredCount} documents...`);
      batchCount = 0;
    }
  }

  // Commit remaining
  if (batchCount > 0) {
    await batch.commit();
    restoredCount += batchCount;
  }

  console.log(`  ✓ Restored ${restoredCount} documents`);
  return restoredCount;
}

async function runRestore() {
  const backupPath = process.argv[2];

  if (!backupPath) {
    console.error('Usage: node scripts/restore-backup.js <backup-directory>');
    console.error('Example: node scripts/restore-backup.js backups/latest');
    process.exit(1);
  }

  const fullPath = path.join(__dirname, '..', backupPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`Error: Backup directory not found: ${fullPath}`);
    process.exit(1);
  }

  console.log('==============================================');
  console.log('Starting Firebase Restore');
  console.log(`Source: ${fullPath}`);
  console.log('==============================================');

  // Read summary to see what collections are available
  const summaryPath = path.join(fullPath, 'BACKUP_SUMMARY.json');
  let summary;
  if (fs.existsSync(summaryPath)) {
    summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    console.log(`\nBackup created: ${summary.backupTime}`);
    console.log(`Total documents: ${summary.totalDocuments}`);
  }

  // Ask for confirmation
  console.log('\n⚠️  WARNING: This will OVERWRITE existing data in Firebase!');
  console.log('Press Ctrl+C now to cancel, or wait 5 seconds to continue...\n');

  await new Promise((resolve) => setTimeout(resolve, 5000));

  let totalRestored = 0;
  const files = fs
    .readdirSync(fullPath)
    .filter((f) => f.endsWith('.json') && f !== 'BACKUP_SUMMARY.json');

  for (const file of files) {
    const collectionName = file.replace('.json', '');
    const backupData = JSON.parse(fs.readFileSync(path.join(fullPath, file), 'utf8'));

    const count = await restoreCollection(collectionName, backupData);
    totalRestored += count;
  }

  console.log('\n==============================================');
  console.log('Restore Complete!');
  console.log(`Total Collections Restored: ${files.length}`);
  console.log(`Total Documents Restored: ${totalRestored}`);
  console.log('==============================================\n');

  process.exit(0);
}

runRestore().catch((error) => {
  console.error('Restore failed:', error);
  process.exit(1);
});
