import { createReviewAndUpdateAverage, findUserById } from './repository';

export class ReviewsServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ReviewsServiceError';
    this.statusCode = statusCode;
  }
}

const createReview = async (
  authorId: string,
  evaluatedId: string,
  calificacion: number,
  comentario?: string
): Promise<{ message: string; reviewId: string }> => {
  if (authorId === evaluatedId) {
    throw new ReviewsServiceError('No puedes reseñarte a ti mismo.', 400);
  }

  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    throw new ReviewsServiceError('La calificacion debe estar entre 1 y 5.', 400);
  }

  const evaluatedUser = await findUserById(evaluatedId);

  if (!evaluatedUser) {
    throw new ReviewsServiceError('El usuario a evaluar no existe.', 404);
  }

  const result = await createReviewAndUpdateAverage(
    authorId,
    evaluatedId,
    calificacion,
    comentario
  );

  return {
    message: 'Reseña creada exitosamente.',
    reviewId: result.review.id,
  };
};

export { createReview };