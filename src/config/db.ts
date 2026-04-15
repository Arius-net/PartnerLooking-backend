import { Pool, type QueryResultRow } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no esta definida en variables de entorno.');
}

if (databaseUrl.includes('[YOUR-PASSWORD]')) {
  throw new Error('DATABASE_URL contiene [YOUR-PASSWORD]. Reemplazalo por la password real de Supabase.');
}

const shouldUseSsl = (): boolean => {
  const explicitSsl = process.env.DATABASE_SSL?.trim().toLowerCase();

  if (explicitSsl === 'true' || explicitSsl === '1' || explicitSsl === 'require') {
    return true;
  }

  if (explicitSsl === 'false' || explicitSsl === '0' || explicitSsl === 'disable') {
    return false;
  }

  try {
    const connectionUrl = new URL(databaseUrl);
    return connectionUrl.hostname.includes('supabase.com')
      || connectionUrl.hostname.includes('supabase.co');
  } catch {
    return false;
  }
};

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: shouldUseSsl() ? { rejectUnauthorized: false } : false,
  max: Number.parseInt(process.env.PG_POOL_MAX ?? '10', 10),
  connectionTimeoutMillis: Number.parseInt(process.env.PG_CONNECTION_TIMEOUT_MS ?? '10000', 10),
  idleTimeoutMillis: Number.parseInt(process.env.PG_IDLE_TIMEOUT_MS ?? '30000', 10),
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
