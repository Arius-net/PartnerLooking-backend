import { compare, hash } from 'bcryptjs';
import { getUserById, getUserByIdWithPassword, updateUserProfile, updatePassword, deleteUser } from './repository';
import type { UpdateProfileInput, UserProfile } from './repository';

export class UserServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'UserServiceError';
    this.statusCode = statusCode;
  }
}

const getSaltRounds = (): number => {
  const rawValue = process.env.BCRYPT_SALT_ROUNDS ?? '10';
  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new UserServiceError('BCRYPT_SALT_ROUNDS debe ser un entero positivo.', 500);
  }

  return parsed;
};

// Obtener perfil público de un usuario
const getPublicProfile = async (userId: string): Promise<UserProfile> => {
  const user = await getUserById(userId);

  if (!user) {
    throw new UserServiceError('Usuario no encontrado.', 404);
  }

  return user;
};

// Actualizar perfil del usuario autenticado
const updateMyProfile = async (userId: string, updates: UpdateProfileInput): Promise<UserProfile> => {
  const updatedUser = await updateUserProfile(userId, updates);

  if (!updatedUser) {
    throw new UserServiceError('No se pudo actualizar el perfil.', 500);
  }

  return updatedUser;
};

// Cambiar contraseña
const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  // Validar que las contraseñas no sean iguales
  if (currentPassword === newPassword) {
    throw new UserServiceError('La nueva contraseña no puede ser igual a la actual.', 400);
  }

  // Validar longitud mínima
  if (newPassword.length < 6) {
    throw new UserServiceError('La nueva contraseña debe tener al menos 6 caracteres.', 400);
  }

  // Obtener usuario con contraseña
  const user = await getUserByIdWithPassword(userId);

  if (!user) {
    throw new UserServiceError('Usuario no encontrado.', 404);
  }

  // Verificar que la contraseña actual sea correcta
  const isPasswordValid = await compare(currentPassword, user.password_hash);

  if (!isPasswordValid) {
    throw new UserServiceError('La contraseña actual es incorrecta.', 401);
  }

  // Hashear la nueva contraseña
  const newPasswordHash = await hash(newPassword, getSaltRounds());

  // Actualizar en la BD
  const success = await updatePassword(userId, newPasswordHash);

  if (!success) {
    throw new UserServiceError('No se pudo actualizar la contraseña.', 500);
  }

  return { message: 'Contraseña actualizada exitosamente.' };
};

// Eliminar cuenta del usuario
const deleteMyAccount = async (userId: string): Promise<{ message: string }> => {
  const success = await deleteUser(userId);

  if (!success) {
    throw new UserServiceError('No se pudo eliminar la cuenta.', 500);
  }

  return { message: 'Cuenta eliminada exitosamente.' };
};

// Obtener telefono de contacto solo para usuarios verificados
const getVerifiedContact = async (
  targetUserId: string,
  requesterIsVerified: boolean
): Promise<{ telefono: string | null }> => {
  if (requesterIsVerified !== true) {
    throw new UserServiceError('Debes estar verificado para ver el contacto.', 403);
  }

  const user = await getUserById(targetUserId);

  if (!user) {
    throw new UserServiceError('Usuario no encontrado.', 404);
  }

  return { telefono: user.telefono };
};

export { getPublicProfile, updateMyProfile, changePassword, deleteMyAccount, getVerifiedContact };
