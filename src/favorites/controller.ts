import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { FavoritesServiceError, addListingToFavorites, removeListingFromFavorites } from './service';

const addFavoriteController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    const listingId = req.params.listingId as string;

    if (!listingId) {
      return res.status(400).json({ message: 'El ID de la publicacion es obligatorio.' });
    }

    const result = await addListingToFavorites(req.user.id, listingId);

    return res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof FavoritesServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error al guardar la publicacion en favoritos.' });
  }
};

const removeFavoriteController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    const listingId = req.params.listingId as string;

    if (!listingId) {
      return res.status(400).json({ message: 'El ID de la publicacion es obligatorio.' });
    }

    const result = await removeListingFromFavorites(req.user.id, listingId);

    return res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof FavoritesServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error al eliminar la publicacion de favoritos.' });
  }
};

export { addFavoriteController, removeFavoriteController };