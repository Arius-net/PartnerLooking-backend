import { Pool, type QueryResultRow } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no esta definida en variables de entorno.');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

pool.on('error', (error: Error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

const query = async <T extends QueryResultRow>(
  queryText: string,
  params: unknown[] = []
): Promise<T[]> => {
  const result = await pool.query<T>(queryText, params);
  return result.rows;
};

const queryOne = async <T extends QueryResultRow>(
  queryText: string,
  params: unknown[] = []
): Promise<T | null> => {
  const rows = await query<T>(queryText, params);
  return rows[0] ?? null;
};

const closeDatabase = async (): Promise<void> => {
  await pool.end();
};

export { pool, query, queryOne, closeDatabase };
