import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { createUser, findUserByEmail } from './repository';

export interface RegisterInput {
  nombreCompleto: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  nombreCompleto: string;
  email: string;
  isVerified: boolean;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

interface JwtPayload {
  id: string;
  is_verified: boolean;
}

export class AuthServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'AuthServiceError';
    this.statusCode = statusCode;
  }
}

const getJwtSecret = (): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new AuthServiceError('JWT_SECRET no esta configurado.', 500);
  }

  return jwtSecret;
};

const getSaltRounds = (): number => {
  const rawValue = process.env.BCRYPT_SALT_ROUNDS ?? '10';
  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AuthServiceError('BCRYPT_SALT_ROUNDS debe ser un entero positivo.', 500);
  }

  return parsed;
};

const toAuthUser = (user: {
  id: string;
  nombre_completo: string;
  email: string;
  is_verified: boolean;
}): AuthUser => ({
  id: user.id,
  nombreCompleto: user.nombre_completo,
  email: user.email,
  isVerified: user.is_verified,
});

const register = async (input: RegisterInput): Promise<AuthUser> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AuthServiceError('El email ya esta registrado.', 400);
  }

  const passwordHash = await hash(input.password, getSaltRounds());

  const createdUser = await createUser({
    nombreCompleto: input.nombreCompleto.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  return toAuthUser(createdUser);
};

const login = async (input: LoginInput): Promise<LoginResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AuthServiceError('Credenciales invalidas.', 401);
  }

  const passwordMatches = await compare(input.password, user.password_hash);
  if (!passwordMatches) {
    throw new AuthServiceError('Credenciales invalidas.', 401);
  }

  const payload: JwtPayload = {
    id: user.id,
    is_verified: user.is_verified,
  };

  const token = sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  });

  return {
    token,
    user: toAuthUser(user),
  };
};

export { register, login };
