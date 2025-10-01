#!/usr/bin/env node

/**
 * Simple script to extract all registered users' emails from Firebase
 * Usage: node scripts/extract-emails.js [output-file]
 */

// Load environment variables from .env.local if it exists
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not available, continue without it
}

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
function initializeFirebase() {
  if (admin.apps.length < 1) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.SERVICE_ACCOUNT_PROJECT_ID,
        clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
        privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
}

/**
 * Extract emails from all registered users
 */
async function extractEmails() {
  try {
    console.log('Initializing Firebase...');
    initializeFirebase();

    const db = admin.firestore();
    const registrationsCollection = '/registrations';

    console.log('Fetching all registrations...');
    const snapshot = await db.collection(registrationsCollection).get();

    if (snapshot.empty) {
      console.log('No registrations found.');
      return [];
    }

    const emails = [];
    const errors = [];

    snapshot.forEach((doc) => {
      try {
        const data = doc.data();

        // Check if user data exists and has preferredEmail
        if (data.user && data.user.preferredEmail) {
          const email = data.user.preferredEmail.trim();

          // Basic email validation
          if (email && email.includes('@')) {
            emails.push({
              email: email,
              firstName: data.user.firstName || 'N/A',
              lastName: data.user.lastName || 'N/A',
              id: data.user.id || doc.id,
              timestamp: data.timestamp || 'N/A',
            });
          } else {
            errors.push(`Invalid email format for user ${data.user.id || doc.id}: ${email}`);
          }
        } else {
          errors.push(`No email found for user ${data.user?.id || doc.id}`);
        }
      } catch (error) {
        errors.push(`Error processing document ${doc.id}: ${error.message}`);
      }
    });

    console.log(`\nExtraction complete!`);
    console.log(`Total registrations processed: ${snapshot.size}`);
    console.log(`Valid emails found: ${emails.length}`);
    console.log(`Errors encountered: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach((error) => console.log(`  - ${error}`));
    }

    return emails;
  } catch (error) {
    console.error('Error extracting emails:', error);
    throw error;
  }
}

/**
 * Output emails to console or file
 */
function outputEmails(emails, outputFile = null) {
  if (outputFile) {
    try {
      // Create output directory if it doesn't exist
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write emails to file
      const emailList = emails.map((user) => user.email).join('\n');
      fs.writeFileSync(outputFile, emailList);
      console.log(`\nEmails written to: ${outputFile}`);

      // Also create a detailed CSV file
      const csvFile = outputFile.replace(/\.[^/.]+$/, '_detailed.csv');
      const csvHeader = 'Email\n';
      const csvContent = emails.map((user) => `"${user.email}"`).join('\n');
      fs.writeFileSync(csvFile, csvHeader + csvContent);
      console.log(`Detailed data written to: ${csvFile}`);
    } catch (error) {
      console.error('Error writing to file:', error);
      console.log('Falling back to console output...');
      outputEmails(emails);
    }
  } else {
    console.log('\n=== EMAIL LIST ===');
    emails.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.firstName} ${user.lastName})`);
    });
    console.log('\n=== EMAIL LIST (CSV FORMAT) ===');
    console.log('Email,First Name,Last Name,User ID,Registration Timestamp');
    emails.forEach((user) => {
      console.log(
        `"${user.email}","${user.firstName}","${user.lastName}","${user.id}","${user.timestamp}"`,
      );
    });
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Check if environment variables are set
    if (
      !process.env.SERVICE_ACCOUNT_PROJECT_ID ||
      !process.env.SERVICE_ACCOUNT_CLIENT_EMAIL ||
      !process.env.SERVICE_ACCOUNT_PRIVATE_KEY
    ) {
      console.error('Error: Required Firebase environment variables are not set.');
      console.error('Please ensure the following environment variables are set:');
      console.error('  - SERVICE_ACCOUNT_PROJECT_ID');
      console.error('  - SERVICE_ACCOUNT_CLIENT_EMAIL');
      console.error('  - SERVICE_ACCOUNT_PRIVATE_KEY');
      console.error('  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
      process.exit(1);
    }

    const outputFile = process.argv[2];

    console.log('Starting email extraction...');
    if (outputFile) {
      console.log(`Output will be written to: ${outputFile}`);
    } else {
      console.log('Output will be displayed in console');
    }

    const emails = await extractEmails();

    if (emails.length === 0) {
      console.log('No emails found to output.');
      return;
    }

    outputEmails(emails, outputFile);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    // Clean up Firebase connection
    if (admin.apps.length > 0) {
      await admin.app().delete();
    }
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { extractEmails, outputEmails };
