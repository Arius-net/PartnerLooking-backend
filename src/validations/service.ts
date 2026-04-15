import { uploadBufferToCloudinary } from '../config/cloudinary';
import { createVerification, updateVerificationStatus, type VerificationRecord } from './repository';

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

const updateVerificationStatusService = async (
  verificationId: string,
  newStatus: 'PENDING' | 'VALID' | 'REJECTED'
): Promise<VerificationRecord> => {
  if (!['PENDING', 'VALID', 'REJECTED'].includes(newStatus)) {
    throw new ValidationServiceError(
      'Estado invalido. Debe ser: PENDING, VALID o REJECTED.',
      400
    );
  }

  return updateVerificationStatus(verificationId, newStatus);
};

export { uploadValidationDocument, updateVerificationStatusService };