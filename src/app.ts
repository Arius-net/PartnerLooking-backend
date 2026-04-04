import cors from 'cors';
import express, { type Application } from 'express';
import { authRouter } from './auth/routes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
	return res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

export { app };
