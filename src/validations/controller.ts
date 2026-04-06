import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ValidationServiceError, uploadValidationDocument } from './service';

const uploadValidationController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        message: 'No autorizado.',
      });
    }

    const verification = await uploadValidationDocument(usuarioId, req.file);

    return res.status(201).json({
      message: 'Documento subido correctamente. Estado en revision.',
      verification,
    });
  } catch (error: unknown) {
    if (error instanceof ValidationServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
};

export { uploadValidationController };