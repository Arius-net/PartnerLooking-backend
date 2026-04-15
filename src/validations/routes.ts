import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadValidationController, updateVerificationStatusController } from './controller';

const validationsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

validationsRouter.post(
  '/upload',
  authMiddleware,
  upload.single('documento'),
  uploadValidationController
);

validationsRouter.put(
  '/:verificationId/status',
  authMiddleware,
  updateVerificationStatusController
);

export { validationsRouter };