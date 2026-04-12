import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createReviewController } from './controller';

const reviewsRouter = Router();

reviewsRouter.post('/:userId', authMiddleware, createReviewController);

export { reviewsRouter };