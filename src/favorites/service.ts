import { addFavorite, findListingById, removeFavorite } from './repository';

export class FavoritesServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'FavoritesServiceError';
    this.statusCode = statusCode;
  }
}

const addListingToFavorites = async (userId: string, listingId: string): Promise<{ message: string }> => {
  const listing = await findListingById(listingId);

  if (!listing) {
    throw new FavoritesServiceError('La publicacion no existe.', 404);
  }

  const favorite = await addFavorite(userId, listingId);

  if (!favorite) {
    return { message: 'La publicacion ya estaba guardada en favoritos.' };
  }

  return { message: 'Publicacion guardada en favoritos.' };
};

const removeListingFromFavorites = async (userId: string, listingId: string): Promise<{ message: string }> => {
  const removed = await removeFavorite(userId, listingId);

  if (!removed) {
    throw new FavoritesServiceError('La publicacion no estaba guardada en favoritos.', 404);
  }

  return { message: 'Publicacion eliminada de favoritos.' };
};

export { addListingToFavorites, removeListingFromFavorites };