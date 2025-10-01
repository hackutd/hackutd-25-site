# Email Extraction Script

This script extracts all registered users' email addresses from the Firebase database.

## Prerequisites

1. **Environment Variables**: The script automatically loads environment variables from `.env.local`. Ensure the following variables are set in your `.env.local` file:
   - `SERVICE_ACCOUNT_PROJECT_ID`
   - `SERVICE_ACCOUNT_CLIENT_EMAIL` 
   - `SERVICE_ACCOUNT_PRIVATE_KEY`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

2. **Node.js**: Make sure Node.js is installed on your system.

3. **Dependencies**: The script uses:
   - Firebase Admin SDK (already included in the project dependencies)
   - dotenv (for loading .env.local file)

## Usage

### Basic Usage (Console Output)
```bash
node scripts/extract-emails.js
```

This will display all emails in the console with user details.

### Save to File
```bash
node scripts/extract-emails.js output/emails.txt
```

This will:
- Save a simple list of emails to `output/emails.txt`
- Save detailed CSV data to `output/emails_detailed.csv`

### Example Output Files

**emails.txt** (simple list):
```
user1@example.com
user2@example.com
user3@example.com
```

**emails_detailed.csv** (detailed data):
```csv
Email,First Name,Last Name,User ID,Registration Timestamp
"user1@example.com","John","Doe","user123","1640995200"
"user2@example.com","Jane","Smith","user456","1640995300"
```

## Features

- ✅ Extracts emails from all registered users
- ✅ Validates email format
- ✅ Includes user details (name, ID, timestamp)
- ✅ Handles errors gracefully
- ✅ Supports both console and file output
- ✅ Creates detailed CSV export
- ✅ Provides progress feedback

## Error Handling

The script will:
- Report any users with missing or invalid emails
- Continue processing even if some records fail
- Provide a summary of successful extractions vs errors
- Exit gracefully with appropriate error codes

## Security Notes

- The script requires Firebase Admin credentials
- Make sure to keep your service account credentials secure
- The script only reads data - it does not modify anything
- Consider running this in a secure environment

## Troubleshooting

**"Required Firebase environment variables are not set"**
- Check that all required environment variables are properly configured in your `.env.local` file
- Verify the `.env.local` file exists in the project root directory
- Ensure the service account has read access to the registrations collection

**"No registrations found"**
- Verify the Firebase project ID is correct
- Check that the registrations collection exists and has data

**"Error extracting emails"**
- Check your internet connection
- Verify Firebase credentials are valid
- Ensure the service account has proper permissions
