import type { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

interface AuthTokenPayload {
  id: string;
  rol: string;
  is_verified: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Token no proporcionado o formato invalido.',
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      message: 'Token no proporcionado o formato invalido.',
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      message: 'JWT_SECRET no esta configurado.',
    });
  }

  try {
    const decoded = verify(token, jwtSecret);

    if (
      typeof decoded === 'string' ||
      !decoded ||
      typeof decoded !== 'object' ||
      !('id' in decoded) ||
      !('rol' in decoded) ||
      !('is_verified' in decoded)
    ) {
      return res.status(401).json({
        message: 'Token invalido o expirado.',
      });
    }

    const payload: AuthTokenPayload = {
      id: String(decoded.id),
      rol: String(decoded.rol),
      is_verified: Boolean(decoded.is_verified),
    };

    if (typeof decoded.iat === 'number') {
      payload.iat = decoded.iat;
    }

    if (typeof decoded.exp === 'number') {
      payload.exp = decoded.exp;
    }

    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({
      message: 'Token invalido o expirado.',
    });
  }
};

export { authMiddleware };