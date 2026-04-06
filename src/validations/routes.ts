import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadValidationController } from './controller';

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

export { validationsRouter };