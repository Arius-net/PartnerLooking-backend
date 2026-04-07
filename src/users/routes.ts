import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getPublicProfileController,
  updateProfileController,
  changePasswordController,
  deleteAccountController,
} from './controller';

const usersRouter = Router();

// Rutas más específicas primero (para evitar conflictos con :id)
// PUT /api/v1/users/config/password - Cambiar contraseña (requiere autenticación)
usersRouter.put('/config/password', authMiddleware, changePasswordController);

// DELETE /api/v1/users/config/account - Eliminar cuenta (requiere autenticación)
usersRouter.delete('/config/account', authMiddleware, deleteAccountController);

// PUT /api/v1/users/profile - Actualizar perfil (requiere autenticación)
usersRouter.put('/profile', authMiddleware, updateProfileController);

// GET /api/v1/users/:id - Obtener perfil público (sin autenticación requerida)
usersRouter.get('/:id', getPublicProfileController);

export { usersRouter };
