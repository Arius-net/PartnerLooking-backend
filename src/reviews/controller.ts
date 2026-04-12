import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ReviewsServiceError, createReview } from './service';

interface CreateReviewRequestBody {
  calificacion?: number;
  comentario?: string;
}

const createReviewController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    const evaluatedId = req.params.userId as string;

    if (!evaluatedId) {
      return res.status(400).json({ message: 'El ID del usuario evaluado es obligatorio.' });
    }

    const { calificacion, comentario } = req.body as CreateReviewRequestBody;

    if (typeof calificacion !== 'number') {
      return res.status(400).json({ message: 'La calificacion es obligatoria y debe ser numerica.' });
    }

    const result = await createReview(req.user.id, evaluatedId, calificacion, comentario);

    return res.status(201).json(result);
  } catch (error: unknown) {
    if (error instanceof ReviewsServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error al crear la reseña.' });
  }
};

export { createReviewController };