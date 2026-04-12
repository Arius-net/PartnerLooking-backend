import { queryOne } from '../config/db';
import {
  createListing,
  getAllListings,
  getNearbyListings,
  type CreateListingInput,
  type ListingRecord,
  type NearbyListingRecord,
  type NearbyListingsFilter,
} from './repository';

export class ListingsServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ListingsServiceError';
    this.statusCode = statusCode;
  }
}

const verifyUserIsVerified = async (userId: string): Promise<boolean> => {
  const sql = 'SELECT is_verified FROM usuarios WHERE id = $1';
  const user = await queryOne<{ is_verified: boolean }>(sql, [userId]);
  return user?.is_verified ?? false;
};

const createNewListing = async (
  userId: string,
  input: Omit<CreateListingInput, 'autorId'>
): Promise<ListingRecord> => {
  const isVerified = await verifyUserIsVerified(userId);

  if (!isVerified) {
    throw new ListingsServiceError(
      'Debes estar verificado para crear una publicacion.',
      403
    );
  }

  return createListing({
    ...input,
    autorId: userId,
  });
};

const fetchAllListings = async (filters?: {
  tipo?: string;
  ciudad?: string;
  limite?: number;
  offset?: number;
}): Promise<ListingRecord[]> => {
  return getAllListings(filters);
};

const fetchNearbyListings = async (
  filters: NearbyListingsFilter
): Promise<NearbyListingRecord[]> => {
  if (filters.radio_km <= 0) {
    throw new ListingsServiceError('radio_km debe ser mayor a 0.', 400);
  }

  return getNearbyListings(filters);
};

export { createNewListing, fetchAllListings, fetchNearbyListings };
