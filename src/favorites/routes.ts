import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { addFavoriteController, removeFavoriteController } from './controller';

const favoritesRouter = Router();

favoritesRouter.post('/:listingId', authMiddleware, addFavoriteController);
favoritesRouter.delete('/:listingId', authMiddleware, removeFavoriteController);

export { favoritesRouter };