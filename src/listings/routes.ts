import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createListingController, getAllListingsController } from './controller';

const listingsRouter = Router();

listingsRouter.get('/', getAllListingsController);
listingsRouter.post('/', authMiddleware, createListingController);

export { listingsRouter };
