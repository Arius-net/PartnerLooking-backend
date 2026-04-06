import { queryOne } from '../config/db';

export interface VerificationRecord {
  id: string;
  usuario_id: string;
  url_documento: string;
  estado: string;
  created_at: string;
}

const createVerification = async (
  usuarioId: string,
  documentUrl: string
): Promise<VerificationRecord> => {
  const sql = `
    INSERT INTO verificaciones (usuario_id, url_documento, estado)
    VALUES ($1, $2, 'PENDING')
    RETURNING id, usuario_id, url_documento, estado, created_at
  `;

  const verification = await queryOne<VerificationRecord>(sql, [usuarioId, documentUrl]);

  if (!verification) {
    throw new Error('No se pudo registrar la validacion.');
  }

  return verification;
};

export { createVerification };