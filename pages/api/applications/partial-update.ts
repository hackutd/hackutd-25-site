import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../../lib/admin/init';
import {
  extractUserDataFromToken,
  userIsAuthorized,
} from '../../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();

const APPLICATIONS_COLLECTION = '/registrations';

async function checkRegistrationAllowed() {
  const preferenceDoc = await db.collection('miscellaneous').doc('preferences').get();
  return preferenceDoc.data().allowRegistrations ?? false;
}

/**
 * Handles PATCH requests to /api/applications/partial-update.
 *
 * This updates only specific fields of an existing application (teammates and essays).
 * Only allows updates to: teammate1, teammate2, teammate3, whyAttend, hackathonNumber, hackathonFirstTimer, lookingForward
 *
 * @param req The HTTP request
 * @param res The HTTP response
 */
async function handlePartialUpdate(req: NextApiRequest, res: NextApiResponse) {
  const registrationAllowed = await checkRegistrationAllowed();
  if (!registrationAllowed) {
    return res.status(403).json({
      msg: 'Registration updates are no longer allowed',
    });
  }

  const { headers } = req;
  const userToken = headers['authorization'] as string | undefined;

  if (!userToken) {
    return res.status(401).json({
      msg: 'Authorization token required',
    });
  }

  let body: any;
  try {
    console.log('Raw request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Body type:', typeof req.body);

    // Handle both cases: body already parsed or needs parsing
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else if (typeof req.body === 'object' && req.body !== null) {
      body = req.body;
    } else {
      throw new Error('Invalid body type');
    }

    console.log('Parsed request body:', body);
  } catch (error) {
    console.error('Could not parse request JSON body:', error);
    console.error('Raw request body:', req.body);
    return res.status(400).json({
      type: 'invalid',
      message: 'Invalid JSON body',
    });
  }

  // Extract user data from token
  let userData;
  try {
    userData = await extractUserDataFromToken(userToken);
    if (!userData) {
      console.error('Invalid or expired token');
      return res.status(401).json({
        msg: 'Invalid or expired token',
      });
    }
    console.log('User data extracted:', userData);
  } catch (error) {
    console.error('Error extracting user data from token:', error);
    return res.status(401).json({
      msg: 'Invalid or expired token',
    });
  }

  // Get the existing application
  const snapshot = await db
    .collection(APPLICATIONS_COLLECTION)
    .where('user.id', '==', userData.user.id)
    .get();

  console.log('Found applications:', snapshot.size);

  if (snapshot.empty) {
    console.error('No application found for user:', userData.user.id);
    return res.status(404).json({
      msg: 'Application does not exist',
    });
  }

  const existingApp = snapshot.docs[0].data();
  const appDocId = snapshot.docs[0].id;

  // Define allowed fields for partial update
  const allowedFields = [
    'teammate1',
    'teammate2',
    'teammate3',
    'whyAttend',
    'hackathonNumber',
    'hackathonFirstTimer',
    'lookingForward',
  ];

  // Create update object with only allowed fields
  const updateData: any = {
    updatedAt: new Date().toISOString(),
  };

  // Only include fields that are in the request and are allowed
  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  });

  console.log('Update data to be saved:', updateData);

  // Validate teammate emails if provided
  const teammateFields = ['teammate1', 'teammate2', 'teammate3'];
  for (const field of teammateFields) {
    if (updateData[field] && updateData[field].trim() !== '') {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData[field].trim())) {
        return res.status(400).json({
          msg: `Invalid email format for ${field}`,
        });
      }
    }
  }

  // Update the application
  try {
    await db.collection(APPLICATIONS_COLLECTION).doc(appDocId).update(updateData);

    // Get the updated application
    const updatedSnapshot = await db.collection(APPLICATIONS_COLLECTION).doc(appDocId).get();
    const updatedData = updatedSnapshot.data();

    res.status(200).json({
      msg: 'Application updated successfully',
      updatedFields: Object.keys(updateData).filter((key) => key !== 'updatedAt'),
      updatedData: updatedData,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      msg: 'Internal server error',
    });
  }
}

export default async function handlePartialUpdateRequest(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  if (method === 'PATCH') {
    return handlePartialUpdate(req, res);
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
