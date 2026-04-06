import { uploadBufferToCloudinary } from '../config/cloudinary';
import { createVerification, type VerificationRecord } from './repository';

export class ValidationServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ValidationServiceError';
    this.statusCode = statusCode;
  }
}

const uploadValidationDocument = async (
  usuarioId: string,
  file?: Express.Multer.File
): Promise<VerificationRecord> => {
  if (!file) {
    throw new ValidationServiceError('Debes adjuntar un archivo.', 400);
  }

  if (!file.buffer || file.buffer.length === 0) {
    throw new ValidationServiceError('El archivo recibido esta vacio.', 400);
  }

  const documentUrl = await uploadBufferToCloudinary(
    file.buffer,
    'partnerlooking/validations'
  );

  return createVerification(usuarioId, documentUrl);
};

export { uploadValidationDocument };