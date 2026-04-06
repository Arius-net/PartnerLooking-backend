import cors from 'cors';
import express, { type Application } from 'express';
import { authRouter } from './auth/routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { validationsRouter } from './validations/routes';
import { listingsRouter } from './listings/routes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
	return res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/validations', validationsRouter);
app.use('/api/v1/listings', listingsRouter);
app.use(errorMiddleware);

export { app };
