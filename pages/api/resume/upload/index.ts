import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import nc from 'next-connect';
import multer from 'multer';
import initializeApi from '../../../../lib/admin/init';

interface NCNextApiRequest extends NextApiRequest {
  file: Express.Multer.File;
}

const handler = nc<NCNextApiRequest, NextApiResponse>({
  onError: (err, req, res, next) => {
    console.log(err);
    res.status(500).json({
      msg: 'Server error',
    });
  },
  onNoMatch: (req, res, next) => {
    res.status(404).json({
      msg: 'Route not found',
    });
  },
});

handler.use(multer().single('resume'));
handler.post(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Initialize Firebase Admin
    initializeApi();
    const bucketName =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'hackutd-2025-prod.firebasestorage.app';

    const bucket = admin.storage().bucket(bucketName);

    // NOTE: This case will happen if user wants to save resume as part of partially completed profile
    if (req.body.isPartialProfile === 'true') {
      const fileName = `resumes/pending/${req.body.fileName}`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      const [fileUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // Far future date
      });

      return res.status(200).json({
        url: fileUrl,
      });
    }

    // NOTE: This section will be reached only if user manages to retain resume file in react object state
    const fileName = `resumes/${req.body.studyLevel}/${req.body.major}/${req.body.fileName}`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    const [fileUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Far future date
    });

    res.status(200).json({
      url: fileUrl,
    });

    // NOTE: In case user saved resume as part of partial profile but failed to retain file in react state, /api/resume/move will be used instead
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      msg: 'Failed to upload resume',
      error: error.message,
    });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default handler;
