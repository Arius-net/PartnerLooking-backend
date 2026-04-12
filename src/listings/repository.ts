import { query, queryOne } from '../config/db';

export interface ListingRecord {
  id: string;
  autor_id: string;
  tipo_publicacion: string;
  tipo_espacio: string | null;
  titulo: string;
  descripcion: string | null;
  direccion: string | null;
  ciudad: string | null;
  colonia: string | null;
  precio: string;
  disponible_desde: string | null;
  numero_roommates: string | null;
  latitud: string;
  longitud: string;
  amenidades: unknown | null;
  permite_mascotas: boolean;
  permite_fumar: boolean;
  permite_visitas: boolean;
  estado: string;
  vistas: number;
  created_at: string;
  updated_at: string;
}

export interface CreateListingInput {
  autorId: string;
  tipoPublicacion: string;
  tipoEspacio?: string;
  titulo: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  colonia?: string;
  precio: number;
  disponibleDesde?: string;
  numeroRoommates?: string;
  latitud: number;
  longitud: number;
  amenidades?: Record<string, unknown>;
  permitemascotas?: boolean;
  permiteFumar?: boolean;
  permiteVisitas?: boolean;
}

const createListing = async (input: CreateListingInput): Promise<ListingRecord> => {
  const sql = `
    INSERT INTO publicaciones (
      autor_id,
      tipo_publicacion,
      tipo_espacio,
      titulo,
      descripcion,
      direccion,
      ciudad,
      colonia,
      precio,
      disponible_desde,
      numero_roommates,
      latitud,
      longitud,
      amenidades,
      permite_mascotas,
      permite_fumar,
      permite_visitas
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING id, autor_id, tipo_publicacion, tipo_espacio, titulo, descripcion, direccion, ciudad, colonia, precio, disponible_desde, numero_roommates, latitud, longitud, amenidades, permite_mascotas, permite_fumar, permite_visitas, estado, vistas, created_at, updated_at
  `;

  const listing = await queryOne<ListingRecord>(sql, [
    input.autorId,
    input.tipoPublicacion,
    input.tipoEspacio ?? null,
    input.titulo,
    input.descripcion ?? null,
    input.direccion ?? null,
    input.ciudad ?? null,
    input.colonia ?? null,
    input.precio,
    input.disponibleDesde ?? null,
    input.numeroRoommates ?? null,
    input.latitud,
    input.longitud,
    input.amenidades ? JSON.stringify(input.amenidades) : null,
    input.permitemascotas ?? false,
    input.permiteFumar ?? false,
    input.permiteVisitas ?? false,
  ]);

  if (!listing) {
    throw new Error('No se pudo crear la publicacion.');
  }

  return listing;
};

interface ListingsFilter {
  tipo?: string;
  ciudad?: string;
  limite?: number;
  offset?: number;
}

export interface NearbyListingsFilter {
  latitud: number;
  longitud: number;
  radio_km: number;
  limite?: number;
  offset?: number;
}

export interface NearbyListingRecord extends ListingRecord {
  distancia_km: string;
}

const getAllListings = async (filter: ListingsFilter = {}): Promise<ListingRecord[]> => {
  const limite = filter.limite ?? 20;
  const offset = filter.offset ?? 0;

  let sql = `
    SELECT 
      id, autor_id, tipo_publicacion, tipo_espacio, titulo, descripcion, direccion, ciudad, 
      colonia, precio, disponible_desde, numero_roommates, latitud, longitud, amenidades, 
      permite_mascotas, permite_fumar, permite_visitas, estado, vistas, created_at, updated_at
    FROM publicaciones
    WHERE estado = 'Activa'
  `;

  const params: unknown[] = [];

  if (filter.tipo) {
    sql += ` AND tipo_publicacion = $${params.length + 1}`;
    params.push(filter.tipo);
  }

  if (filter.ciudad) {
    sql += ` AND LOWER(ciudad) = LOWER($${params.length + 1})`;
    params.push(filter.ciudad);
  }

  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limite, offset);

  return query<ListingRecord>(sql, params);
};

const getNearbyListings = async (filter: NearbyListingsFilter): Promise<NearbyListingRecord[]> => {
  const limite = filter.limite ?? 20;
  const offset = filter.offset ?? 0;

  const sql = `
    SELECT
      id,
      autor_id,
      tipo_publicacion,
      tipo_espacio,
      titulo,
      descripcion,
      direccion,
      ciudad,
      colonia,
      precio,
      disponible_desde,
      numero_roommates,
      latitud,
      longitud,
      amenidades,
      permite_mascotas,
      permite_fumar,
      permite_visitas,
      estado,
      vistas,
      created_at,
      updated_at,
      (
        6371 * acos(
          cos(radians($1)) * cos(radians(latitud)) * cos(radians(longitud) - radians($2))
          + sin(radians($1)) * sin(radians(latitud))
        )
      ) AS distancia_km
    FROM publicaciones
    WHERE estado = 'Activa'
    AND (
      6371 * acos(
        cos(radians($1)) * cos(radians(latitud)) * cos(radians(longitud) - radians($2))
        + sin(radians($1)) * sin(radians(latitud))
      )
    ) <= $3
    ORDER BY distancia_km ASC
    LIMIT $4 OFFSET $5
  `;

  return query<NearbyListingRecord>(sql, [
    filter.latitud,
    filter.longitud,
    filter.radio_km,
    limite,
    offset,
  ]);
};

export { createListing, getAllListings, getNearbyListings };
