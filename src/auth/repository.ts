import { queryOne } from '../config/db';

export interface UserRecord {
  id: string;
  nombre_completo: string;
  email: string;
  password_hash: string;
  is_verified: boolean;
}

export interface CreateUserInput {
  nombreCompleto: string;
  email: string;
  passwordHash: string;
}

const createUser = async (input: CreateUserInput): Promise<UserRecord> => {
  const sql = `
    INSERT INTO usuarios (nombre_completo, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, nombre_completo, email, password_hash, is_verified
  `;

  const user = await queryOne<UserRecord>(sql, [
    input.nombreCompleto,
    input.email,
    input.passwordHash,
  ]);

  if (!user) {
    throw new Error('No se pudo crear el usuario.');
  }

  return user;
};

const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const sql = `
    SELECT id, nombre_completo, email, password_hash, is_verified
    FROM usuarios
    WHERE email = $1
    LIMIT 1
  `;

  return queryOne<UserRecord>(sql, [email]);
};

export { createUser, findUserByEmail };
