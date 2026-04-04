import { Request, Response } from 'express';
import { AuthServiceError, login, register } from './service';

interface RegisterRequestBody {
  nombreCompleto?: string;
  email?: string;
  password?: string;
}

interface LoginRequestBody {
  email?: string;
  password?: string;
}

const registerController = async (
  req: Request<unknown, unknown, RegisterRequestBody>,
  res: Response
): Promise<Response> => {
  try {
    const { nombreCompleto, email, password } = req.body;

    if (!nombreCompleto || !email || !password) {
      return res.status(400).json({
        message: 'nombreCompleto, email y password son obligatorios.',
      });
    }

    const user = await register({ nombreCompleto, email, password });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user,
    });
  } catch (error: unknown) {
    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(400).json({ message: 'No se pudo completar el registro.' });
  }
};

const loginController = async (
  req: Request<unknown, unknown, LoginRequestBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'email y password son obligatorios.',
      });
    }

    const result = await login({ email, password });

    return res.status(200).json({
      message: 'Login exitoso.',
      token: result.token,
      user: result.user,
    });
  } catch (error: unknown) {
    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(400).json({ message: 'No se pudo completar el login.' });
  }
};

export { registerController, loginController };
