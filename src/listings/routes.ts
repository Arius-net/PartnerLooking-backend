import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
	createListingController,
	getAllListingsController,
	getNearbyListingsController,
} from './controller';

const listingsRouter = Router();

listingsRouter.get('/nearby', getNearbyListingsController);
listingsRouter.get('/', getAllListingsController);
listingsRouter.post('/', authMiddleware, createListingController);

export { listingsRouter };
