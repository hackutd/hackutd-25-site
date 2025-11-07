import { NextApiRequest, NextApiResponse } from 'next';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';
import initializeApi from '../../../lib/admin/init';
import { firestore } from 'firebase-admin';

initializeApi();
const db = firestore();

async function sendNotificationsToWalkIns(
  lowerBoundCheckInNumber: number,
  upperBoundCheckInNumber: number,
) {
  console.log(
    `[WAITLIST] Looking for waitlist numbers between ${lowerBoundCheckInNumber} and ${upperBoundCheckInNumber}`,
  );

  const snapshot = await db
    .collection('/registrations')
    .where('waitListInfo.waitlistNumber', '>=', lowerBoundCheckInNumber)
    .where('waitListInfo.waitlistNumber', '<=', upperBoundCheckInNumber)
    .get();

  console.log(`[WAITLIST] Found ${snapshot.docs.length} users in range`);

  if (snapshot.docs.length > 0) {
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(
        `[WAITLIST] User ${doc.id}: #${data.waitListInfo?.waitlistNumber}, method: ${data.waitListInfo?.notificationMethod}, contact: ${data.waitListInfo?.contactInfo}`,
      );
    });
  } else {
    console.log('[WAITLIST] No users found in range, skipping notifications');
    return;
  }

  console.log('[WAITLIST] Initializing notification clients...');
  console.log(
    '[WAITLIST] Twilio Account SID:',
    process.env.TWILIO_ACCOUNT_SID
      ? process.env.TWILIO_ACCOUNT_SID.substring(0, 10) + '...'
      : 'NOT SET',
  );
  console.log(
    '[WAITLIST] Twilio Auth Token:',
    process.env.TWILIO_AUTH_TOKEN
      ? 'SET (length: ' + process.env.TWILIO_AUTH_TOKEN.length + ')'
      : 'NOT SET',
  );
  console.log('[WAITLIST] Twilio Phone Number:', process.env.TWILIO_PHONE_NUMBER || 'NOT SET');
  console.log(
    '[WAITLIST] SendGrid API Key:',
    process.env.SENDGRID_APIKEY
      ? 'SET (length: ' + process.env.SENDGRID_APIKEY.length + ')'
      : 'NOT SET',
  );
  console.log('[WAITLIST] HackUTD Email:', process.env.HACKUTD_EMAIL || 'NOT SET');

  const twilioClient = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  const sendgridClient = require('@sendgrid/mail');
  sendgridClient.setApiKey(process.env.SENDGRID_APIKEY!);
  console.log('[WAITLIST] Clients initialized successfully');
  // TODO: change message into something works better
  const messageContent =
    'Hey there, we are ready to check you into HackUTD! Please come to ECSW so that we can kick start the process!!! If you do not come to ECSW within 5 minutes of this text, your waitlist slot will be given to the next person';
  const results = await Promise.allSettled(
    snapshot.docs.map(async (doc) => {
      const docData = doc.data();
      const method = docData.waitListInfo.notificationMethod;
      const contact = docData.waitListInfo.contactInfo;

      try {
        if (method === 'sms') {
          // Clean phone number - remove all non-digit characters except leading +
          let phoneNumber = contact as string;
          const hasPlus = phoneNumber.startsWith('+');
          const digits = phoneNumber.replace(/\D/g, ''); // Remove all non-digits

          // Format as E.164: +[country code][number]
          if (hasPlus) {
            phoneNumber = '+' + digits;
          } else if (digits.length === 11 && digits.startsWith('1')) {
            phoneNumber = '+' + digits; // Already has country code
          } else if (digits.length === 10) {
            phoneNumber = '+1' + digits; // US number, add country code
          } else {
            phoneNumber = '+1' + digits; // Default to US
          }

          console.log(`[WAITLIST] Sending SMS to ${phoneNumber} (original: ${contact})`);

          const message = await twilioClient.messages.create({
            body: messageContent,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
          });

          console.log(`[WAITLIST] SMS sent successfully to ${phoneNumber}, SID: ${message.sid}`);
          return { success: true, method: 'sms', to: phoneNumber };
        } else if (method === 'email') {
          console.log(`[WAITLIST] Sending email to ${contact}`);

          await sendgridClient.send({
            to: contact,
            from: {
              email: process.env.HACKUTD_EMAIL,
              name: 'HackUTD',
            },
            subject: 'Ready for check-in!!!',
            text: messageContent,
          });

          console.log(`[WAITLIST] Email sent successfully to ${contact}`);
          return { success: true, method: 'email', to: contact };
        }
      } catch (error) {
        console.error(`[WAITLIST] Failed to send ${method} to ${contact}:`, error);
        return { success: false, method, to: contact, error };
      }
    }),
  );

  const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.filter(
    (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success),
  ).length;
  console.log(
    `[WAITLIST] Notification summary: ${successful} successful, ${failed} failed out of ${results.length} total`,
  );
}

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
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
    const lowerBound = req.body.lowerBound;
    const upperBound = req.body.upperBound;

    if (lowerBound === undefined || upperBound === undefined) {
      return res.status(400).json({
        statusCode: 400,
        msg: 'Both lowerBound and upperBound are required',
      });
    }

    if (lowerBound > upperBound) {
      return res.status(400).json({
        statusCode: 400,
        msg: 'Lower bound must be less than or equal to upper bound',
      });
    }

    console.log(`[WAITLIST] Request to notify waitlist numbers ${lowerBound} to ${upperBound}`);

    // Send notifications to users in the specified range
    await sendNotificationsToWalkIns(lowerBound, upperBound);

    // Update the upper bound in the database for reference
    const snapshot = await db.collection('/miscellaneous').doc('lateCheckInManager').get();
    if (snapshot && snapshot.exists) {
      await snapshot.ref.update({
        allowedCheckInUpperBound: upperBound,
      });
    } else {
      await snapshot.ref.set({
        allowedCheckInUpperBound: upperBound,
        version: 1,
        nextAvailableNumber: 1,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      msg: `Successfully sent notifications to waitlist numbers ${lowerBound} to ${upperBound}`,
    });
  } catch (error) {
    console.error('[WAITLIST] ERROR:', error);
    return res.status(500).json({
      statusCode: 500,
      msg: 'Unexpected error...',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case 'POST': {
      return handlePostRequest(req, res);
    }
    default: {
      return res.status(404).json({ msg: 'Route not found' });
    }
  }
}
