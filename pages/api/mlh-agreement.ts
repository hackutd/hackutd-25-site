import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../lib/admin/init';
import { userIsAuthorized } from '../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();
const REGISTRATION_COLLECTION = '/registrations';

/**
 * Handles POST requests to /api/mlh-agreement
 *
 * Records MLH Privacy Policy agreement during check-in
 * Similar to emergency seat agreement on airplanes
 *
 * @param req The HTTP request
 * @param res The HTTP response
 */
async function handleMLHAgreement(req: NextApiRequest, res: NextApiResponse) {
  const { headers, body } = req;

  // Check admin authorization
  const userToken = headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['admin', 'super_admin']);

  if (!isAuthorized) {
    return res.status(401).json({
      code: 'unauthorized',
      message: 'Request is not authorized to perform this action.',
    });
  }

  // Parse body
  let bodyData;
  try {
    if (typeof body === 'string') {
      bodyData = JSON.parse(body);
    } else if (typeof body === 'object' && body !== null) {
      bodyData = body;
    } else {
      throw new Error('Invalid body type');
    }
  } catch (error) {
    console.error('Could not parse request JSON body:', error);
    return res.status(400).json({
      code: 'invalid-json',
      message: 'Invalid JSON in request body',
    });
  }

  const { userId } = bodyData;

  if (!userId) {
    return res.status(400).json({
      code: 'missing-user-id',
      message: 'User ID is required',
    });
  }

  try {
    // Get user registration
    const userDoc = await db.collection(REGISTRATION_COLLECTION).doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        code: 'user-not-found',
        message: 'User registration not found',
      });
    }

    // Update MLH agreement with timestamp
    const agreementTimestamp = new Date().toISOString();
    await db
      .collection(REGISTRATION_COLLECTION)
      .doc(userId)
      .update({
        mlhPrivacyPolicy: ['agreed'],
        mlhAgreementDate: agreementTimestamp,
        mlhAgreementMethod: 'check-in-scan',
      });

    return res.status(200).json({
      code: 'success',
      message: 'MLH agreement recorded successfully',
      timestamp: agreementTimestamp,
    });
  } catch (error) {
    console.error('Error recording MLH agreement:', error);
    return res.status(500).json({
      code: 'internal-error',
      message: 'Failed to record MLH agreement',
    });
  }
}

/**
 * API route handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    return handleMLHAgreement(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
