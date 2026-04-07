import { queryOne, query } from '../config/db';
import { pool } from '../config/db';

export interface UserProfile {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  universidad: string | null;
  sobre_mi: string | null;
  calificacion_promedio: number;
  total_resenas: number;
  is_verified: boolean;
  rol: string;
  created_at: string;
}

export interface UserWithPassword extends UserProfile {
  password_hash: string;
}

export interface UpdateProfileInput {
  telefono?: string;
  universidad?: string;
  sobre_mi?: string;
}

// Obtener perfil público de un usuario
const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const sql = `
    SELECT 
      id, nombre_completo, email, telefono, universidad, sobre_mi,
      calificacion_promedio, total_resenas, is_verified, rol, created_at
    FROM usuarios
    WHERE id = $1
  `;

  return queryOne<UserProfile>(sql, [userId]);
};

// Obtener usuario con contraseña (para validación)
const getUserByIdWithPassword = async (userId: string): Promise<UserWithPassword | null> => {
  const sql = `
    SELECT 
      id, nombre_completo, email, password_hash, telefono, universidad, sobre_mi,
      calificacion_promedio, total_resenas, is_verified, rol, created_at
    FROM usuarios
    WHERE id = $1
  `;

  return queryOne<UserWithPassword>(sql, [userId]);
};

// Actualizar perfil del usuario
const updateUserProfile = async (userId: string, updates: UpdateProfileInput): Promise<UserProfile | null> => {
  const { telefono, universidad, sobre_mi } = updates;

  const sql = `
    UPDATE usuarios
    SET 
      telefono = COALESCE($1, telefono),
      universidad = COALESCE($2, universidad),
      sobre_mi = COALESCE($3, sobre_mi),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id, nombre_completo, email, telefono, universidad, sobre_mi,
              calificacion_promedio, total_resenas, is_verified, rol, created_at
  `;

  return queryOne<UserProfile>(sql, [telefono || null, universidad || null, sobre_mi || null, userId]);
};

// Actualizar contraseña
const updatePassword = async (userId: string, passwordHash: string): Promise<boolean> => {
  const sql = `
    UPDATE usuarios
    SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;

  const result = await pool.query(sql, [passwordHash, userId]);
  return result.rowCount ? result.rowCount > 0 : false;
};

// Eliminar usuario
const deleteUser = async (userId: string): Promise<boolean> => {
  const sql = `
    DELETE FROM usuarios
    WHERE id = $1
  `;

  const result = await pool.query(sql, [userId]);
  return result.rowCount ? result.rowCount > 0 : false;
};

export { getUserById, getUserByIdWithPassword, updateUserProfile, updatePassword, deleteUser };
