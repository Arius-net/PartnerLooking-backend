import type { ErrorRequestHandler } from 'express';

interface HttpError extends Error {
  statusCode?: number;
}

const errorMiddleware: ErrorRequestHandler = (
  error: HttpError,
  _req,
  res,
  _next
) => {
  const statusCode = error.statusCode ?? 500;
  const message =
    statusCode === 500 ? 'Error interno del servidor.' : error.message;

  return res.status(statusCode).json({
    message,
  });
};

export { errorMiddleware };