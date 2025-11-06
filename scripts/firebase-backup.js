const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Try using individual env vars (from .env.local)
  if (process.env.SERVICE_ACCOUNT_PRIVATE_KEY && process.env.SERVICE_ACCOUNT_CLIENT_EMAIL) {
    console.log('Using Firebase credentials from environment variables...');

    // Try multiple ways to get project ID
    let projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.PROJECT_ID;

    if (!projectId && process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
      // Try to extract from app ID (format: 1:123456789:web:abc123)
      const appIdParts = process.env.NEXT_PUBLIC_FIREBASE_APP_ID.split(':');
      if (appIdParts.length > 1) {
        projectId = appIdParts[1];
      }
    }

    if (!projectId && process.env.SERVICE_ACCOUNT_CLIENT_EMAIL) {
      // Extract from client email (format: firebase-adminsdk-xxx@PROJECT_ID.iam.gserviceaccount.com)
      const emailParts = process.env.SERVICE_ACCOUNT_CLIENT_EMAIL.split('@');
      if (emailParts.length > 1) {
        projectId = emailParts[1].split('.')[0];
      }
    }

    if (!projectId) {
      console.error('Error: Could not determine Firebase project ID');
      console.error('Please add FIREBASE_PROJECT_ID to your .env.local file');
      console.error('Or run: export FIREBASE_PROJECT_ID=hackutd-2025-prod');
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
      }),
    });
    console.log(`✓ Connected to project: ${projectId}`);
  }
  // Fallback to application default credentials
  else {
    console.log('Missing credentials. Please check .env.local has:');
    console.log('  - SERVICE_ACCOUNT_PRIVATE_KEY');
    console.log('  - SERVICE_ACCOUNT_CLIENT_EMAIL');
    console.log('  - FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID)');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

const db = admin.firestore();

// Collections to backup
const COLLECTIONS = [
  'challenges',
  'dates',
  'faqs',
  'keynotespeakers',
  'miscellaneous',
  'partial-registrations',
  'registrations',
  'scan-types',
  'schedule-events',
  'scoring',
  'sponsors',
  'tokens',
];

async function backupCollection(collectionName) {
  console.log(`\nBacking up collection: ${collectionName}...`);

  try {
    const snapshot = await db.collection(collectionName).get();
    console.log(`  Found ${snapshot.size} documents`);

    const data = [];
    snapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        data: doc.data(),
        createTime: doc.createTime?.toDate().toISOString(),
        updateTime: doc.updateTime?.toDate().toISOString(),
      });
    });

    return {
      collection: collectionName,
      count: data.length,
      documents: data,
      backupTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`  Error backing up ${collectionName}:`, error.message);
    return {
      collection: collectionName,
      count: 0,
      documents: [],
      error: error.message,
      backupTime: new Date().toISOString(),
    };
  }
}

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', timestamp);

  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('==============================================');
  console.log('Starting Firebase Backup');
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Output Directory: ${backupDir}`);
  console.log('==============================================');

  const backupResults = [];

  for (const collection of COLLECTIONS) {
    const result = await backupCollection(collection);
    backupResults.push(result);

    // Save collection data to file
    const filename = path.join(backupDir, `${collection}.json`);
    fs.writeFileSync(filename, JSON.stringify(result, null, 2));
    console.log(`  ✓ Saved to ${collection}.json`);
  }

  // Create summary file
  const summary = {
    backupTime: new Date().toISOString(),
    collections: backupResults.map((r) => ({
      name: r.collection,
      documentCount: r.count,
      status: r.error ? 'error' : 'success',
      error: r.error,
    })),
    totalDocuments: backupResults.reduce((sum, r) => sum + r.count, 0),
  };

  fs.writeFileSync(path.join(backupDir, 'BACKUP_SUMMARY.json'), JSON.stringify(summary, null, 2));

  console.log('\n==============================================');
  console.log('Backup Complete!');
  console.log(`Total Collections: ${COLLECTIONS.length}`);
  console.log(`Total Documents: ${summary.totalDocuments}`);
  console.log(`Location: ${backupDir}`);
  console.log('==============================================\n');

  // Also create a "latest" symlink/copy for easy access
  const latestDir = path.join(__dirname, '..', 'backups', 'latest');
  if (fs.existsSync(latestDir)) {
    fs.rmSync(latestDir, { recursive: true });
  }
  fs.cpSync(backupDir, latestDir, { recursive: true });
  console.log('✓ Created latest backup snapshot\n');

  process.exit(0);
}

runBackup().catch((error) => {
  console.error('Backup failed:', error);
  process.exit(1);
});
