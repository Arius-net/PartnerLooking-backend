import 'dotenv/config';
import { app } from './app';
import { closeDatabase, initializeDatabase } from './config/db';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);

const startServer = async (): Promise<void> => {
	initializeDatabase();

	app.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});
};

startServer().catch((error: unknown) => {
	console.error('Failed to start server:', error);
	process.exit(1);
});

const shutdown = async (): Promise<void> => {
	await closeDatabase();
	process.exit(0);
};

process.on('SIGINT', () => {
	void shutdown();
});

process.on('SIGTERM', () => {
	void shutdown();
});
