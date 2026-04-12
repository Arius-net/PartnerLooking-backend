import type { Response } from 'express';
import {
  getPublicProfile,
  updateMyProfile,
  changePassword,
  deleteMyAccount,
  getVerifiedContact,
  UserServiceError,
} from './service';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import type { UpdateProfileInput } from './repository';

interface UpdateProfileRequestBody {
  telefono?: string;
  universidad?: string;
  sobre_mi?: string;
}

interface ChangePasswordRequestBody {
  currentPassword?: string;
  newPassword?: string;
}

// GET /api/v1/users/:id - Obtener perfil público
const getPublicProfileController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        message: 'El ID del usuario es obligatorio.',
      });
    }

    const profile = await getPublicProfile(id);

    return res.status(200).json({
      message: 'Perfil obtenido exitosamente.',
      data: profile,
    });
  } catch (error: unknown) {
    if (error instanceof UserServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error al obtener el perfil.' });
  }
};

// PUT /api/v1/users/profile - Actualizar perfil (requiere autenticación)
const updateProfileController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Usuario no autenticado.',
      });
    }

    const { telefono, universidad, sobre_mi } = req.body as UpdateProfileRequestBody;

    // Crear objeto de actualización solo con campos definidos
    const updates: UpdateProfileInput = {};
    if (telefono !== undefined) updates.telefono = telefono;
    if (universidad !== undefined) updates.universidad = universidad;
    if (sobre_mi !== undefined) updates.sobre_mi = sobre_mi;

    const updatedProfile = await updateMyProfile(req.user.id, updates);

    return res.status(200).json({
      message: 'Perfil actualizado exitosamente.',
      data: updatedProfile,
    });
  } catch (error: unknown) {
    if (error instanceof UserServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error al actualizar el perfil.' });
  }
};

// PUT /api/v1/users/config/password - Cambiar contraseña
const changePasswordController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Usuario no autenticado.',
      });
    }

    const { currentPassword, newPassword } = req.body as ChangePasswordRequestBody;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'La contraseña actual y la nueva son obligatorias.',
      });
    }

    const result = await changePassword(req.user.id, currentPassword, newPassword);

    return res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof UserServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error al cambiar la contraseña.' });
  }
};

// DELETE /api/v1/users/config/account - Eliminar cuenta
const deleteAccountController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Usuario no autenticado.',
      });
    }

    const result = await deleteMyAccount(req.user.id);

    return res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof UserServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error al eliminar la cuenta.' });
  }
};

// GET /api/v1/users/:id/contact - Obtener telefono del anunciante si el solicitante esta verificado
const getContactController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Usuario no autenticado.',
      });
    }

    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        message: 'El ID del usuario es obligatorio.',
      });
    }

    const contact = await getVerifiedContact(id, req.user.is_verified);

    return res.status(200).json({
      message: 'Contacto obtenido exitosamente.',
      data: contact,
    });
  } catch (error: unknown) {
    if (error instanceof UserServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error al obtener el contacto.' });
  }
};

export {
  getPublicProfileController,
  updateProfileController,
  changePasswordController,
  deleteAccountController,
  getContactController,
};
