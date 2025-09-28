import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../../lib/admin/init';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';

initializeApi();
const db = firestore();

const PRE_EVENTS = '/pre-events';

/**
 * API endpoint to get pre-events data from backend
 *
 * @param req HTTP request object
 * @param res HTTP response object
 */
async function getPreEvents(req: NextApiRequest, res: NextApiResponse) {
  const snapshot = await db.collection(PRE_EVENTS).get();
  let data = [];
  snapshot.forEach((doc) => {
    const currentEvent = doc.data();
    data.push({
      ...currentEvent,
      startDate: currentEvent.startDate.toDate(),
      endDate: currentEvent.endDate.toDate(),
    });
  });
  res.json(data);
}

async function updatePreEventDatabase(req: NextApiRequest, res: NextApiResponse) {
  const { startTimestamp, endTimestamp, ...eventData } = JSON.parse(req.body);

  const userToken = req.headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin']);
  if (!isAuthorized) {
    return res.status(403).json({
      statusCode: 403,
      msg: 'Request is not authorized to perform admin functionality',
    });
  }

  const event = await db.collection(PRE_EVENTS).where('Event', '==', eventData.Event).get();
  if (event.empty) {
    await db.collection(PRE_EVENTS).add({
      ...eventData,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
    });
    return res.status(201).json({
      msg: 'Pre-event created',
    });
  }

  event.forEach(async (doc) => {
    await db
      .collection(PRE_EVENTS)
      .doc(doc.id)
      .update({
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
      });
  });

  return res.status(200).json({
    msg: 'Pre-event updated',
  });
}

async function deletePreEvent(req: NextApiRequest, res: NextApiResponse) {
  const userToken = req.headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin']);

  if (!isAuthorized) {
    return res.status(403).json({
      statusCode: 403,
      msg: 'Request is not authorized to perform admin functionality',
    });
  }

  const eventData = JSON.parse(req.body);
  const eventDoc = await db.collection(PRE_EVENTS).where('Event', '==', eventData.Event).get();
  eventDoc.forEach(async (doc) => {
    await db.collection(PRE_EVENTS).doc(doc.id).delete();
  });
  return res.json({
    msg: 'Pre-event deleted',
  });
}

function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  return getPreEvents(req, res);
}

function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  return updatePreEventDatabase(req, res);
}

function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse) {
  return deletePreEvent(req, res);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case 'GET': {
      return handleGetRequest(req, res);
    }
    case 'POST': {
      return handlePostRequest(req, res);
    }
    case 'DELETE': {
      return handleDeleteRequest(req, res);
    }
    default: {
      return res.status(404).json({
        msg: 'Route not found',
      });
    }
  }
}
