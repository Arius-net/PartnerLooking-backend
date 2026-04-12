import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import {
  ListingsServiceError,
  createNewListing,
  fetchAllListings,
  fetchNearbyListings,
} from './service';
import type { CreateListingInput } from './repository';

interface CreateListingRequestBody {
  tipoPublicacion?: string;
  tipoEspacio?: string;
  titulo?: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  colonia?: string;
  precio?: number;
  disponibleDesde?: string;
  numeroRoommates?: string;
  latitud?: number;
  longitud?: number;
  amenidades?: Record<string, unknown>;
  permitemascotas?: boolean;
  permiteFumar?: boolean;
  permiteVisitas?: boolean;
}

interface ListingsQuery {
  tipo?: string;
  ciudad?: string;
  limite?: string;
  offset?: string;
}

interface NearbyListingsQuery {
  latitud?: string;
  longitud?: string;
  radio_km?: string;
  limite?: string;
  offset?: string;
}

const getAllListingsController = async (
  req: Request<unknown, unknown, unknown, ListingsQuery>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const limite = req.query.limite ? Number.parseInt(req.query.limite, 10) : 20;
    const offset = req.query.offset ? Number.parseInt(req.query.offset, 10) : 0;

    const filters: {
      tipo?: string;
      ciudad?: string;
      limite?: number;
      offset?: number;
    } = { limite, offset };

    if (req.query.tipo) {
      filters.tipo = req.query.tipo;
    }

    if (req.query.ciudad) {
      filters.ciudad = req.query.ciudad;
    }

    const listings = await fetchAllListings(filters);

    return res.status(200).json({
      message: 'Publicaciones obtenidas correctamente.',
      listings,
      pagination: {
        limite,
        offset,
        total: listings.length,
      },
    });
  } catch (error: unknown) {
    return next(error);
  }
};

const createListingController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'No autorizado.',
      });
    }

    const {
      tipoPublicacion,
      tipoEspacio,
      titulo,
      descripcion,
      direccion,
      ciudad,
      colonia,
      precio,
      disponibleDesde,
      numeroRoommates,
      latitud,
      longitud,
      amenidades,
      permitemascotas,
      permiteFumar,
      permiteVisitas,
    } = req.body as CreateListingRequestBody;

    if (!tipoPublicacion || !titulo || typeof precio !== 'number' || typeof latitud !== 'number' || typeof longitud !== 'number') {
      return res.status(400).json({
        message: 'tipoPublicacion, titulo, precio, latitud y longitud son obligatorios.',
      });
    }

    const listingInput: Omit<CreateListingInput, 'autorId'> = {
      tipoPublicacion,
      titulo,
      precio,
      latitud,
      longitud,
    };

    if (tipoEspacio) {
      listingInput.tipoEspacio = tipoEspacio;
    }
    if (descripcion) {
      listingInput.descripcion = descripcion;
    }
    if (direccion) {
      listingInput.direccion = direccion;
    }
    if (ciudad) {
      listingInput.ciudad = ciudad;
    }
    if (colonia) {
      listingInput.colonia = colonia;
    }
    if (disponibleDesde) {
      listingInput.disponibleDesde = disponibleDesde;
    }
    if (numeroRoommates) {
      listingInput.numeroRoommates = numeroRoommates;
    }
    if (amenidades) {
      listingInput.amenidades = amenidades;
    }
    if (typeof permitemascotas === 'boolean') {
      listingInput.permitemascotas = permitemascotas;
    }
    if (typeof permiteFumar === 'boolean') {
      listingInput.permiteFumar = permiteFumar;
    }
    if (typeof permiteVisitas === 'boolean') {
      listingInput.permiteVisitas = permiteVisitas;
    }

    const listing = await createNewListing(userId, listingInput);

    return res.status(201).json({
      message: 'Publicacion creada exitosamente.',
      listing,
    });
  } catch (error: unknown) {
    if (error instanceof ListingsServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
};

const getNearbyListingsController = async (
  req: Request<unknown, unknown, unknown, NearbyListingsQuery>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const latitud = req.query.latitud ? Number.parseFloat(req.query.latitud) : NaN;
    const longitud = req.query.longitud ? Number.parseFloat(req.query.longitud) : NaN;
    const radio_km = req.query.radio_km ? Number.parseFloat(req.query.radio_km) : NaN;
    const limite = req.query.limite ? Number.parseInt(req.query.limite, 10) : 20;
    const offset = req.query.offset ? Number.parseInt(req.query.offset, 10) : 0;

    if (
      Number.isNaN(latitud)
      || Number.isNaN(longitud)
      || Number.isNaN(radio_km)
    ) {
      return res.status(400).json({
        message: 'latitud, longitud y radio_km son obligatorios y deben ser numéricos.',
      });
    }

    const listings = await fetchNearbyListings({
      latitud,
      longitud,
      radio_km,
      limite,
      offset,
    });

    return res.status(200).json({
      message: 'Publicaciones cercanas obtenidas correctamente.',
      listings,
      pagination: {
        limite,
        offset,
        total: listings.length,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ListingsServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
};

export { getAllListingsController, createListingController, getNearbyListingsController };
