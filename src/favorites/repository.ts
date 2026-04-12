import { query, queryOne } from '../config/db';

export interface FavoriteRecord {
  usuario_id: string;
  publicacion_id: string;
  guardado_el: string;
}

const findListingById = async (listingId: string): Promise<{ id: string } | null> => {
  return queryOne<{ id: string }>(
    `
      SELECT id
      FROM publicaciones
      WHERE id = $1
      LIMIT 1
    `,
    [listingId]
  );
};

const addFavorite = async (userId: string, listingId: string): Promise<FavoriteRecord | null> => {
  const favorite = await queryOne<FavoriteRecord>(
    `
      INSERT INTO favoritos (usuario_id, publicacion_id)
      VALUES ($1, $2)
      ON CONFLICT (usuario_id, publicacion_id) DO NOTHING
      RETURNING usuario_id, publicacion_id, guardado_el
    `,
    [userId, listingId]
  );

  return favorite;
};

const removeFavorite = async (userId: string, listingId: string): Promise<boolean> => {
  const rows = await query<FavoriteRecord>(
    `
      DELETE FROM favoritos
      WHERE usuario_id = $1 AND publicacion_id = $2
      RETURNING usuario_id, publicacion_id, guardado_el
    `,
    [userId, listingId]
  );

  return rows.length > 0;
};

export { findListingById, addFavorite, removeFavorite };