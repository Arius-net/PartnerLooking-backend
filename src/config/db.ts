import { Pool, PoolConfig } from 'pg';

/**
 * Configuración del pool de conexiones para PostgreSQL
 * Usa la variable de entorno DATABASE_URL
 */

let pool: Pool;

const initializeDatabase = (): Pool => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL no definida. Configure la variable de entorno con el formato: postgresql://usuario:password@host:puerto/base_datos'
    );
  }

  const poolConfig: PoolConfig = {
    connectionString: databaseUrl,
    max: 20, // Máximo de conexiones simultáneas
    idleTimeoutMillis: 30000, // Timeout de inactividad
    connectionTimeoutMillis: 5000, // Timeout de conexión
  };

  pool = new Pool(poolConfig);

  // Manejo de errores del pool
  pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
  });

  return pool;
};

const getPool = (): Pool => {
  if (!pool) {
    throw new Error(
      'El pool de base de datos no ha sido inicializado. Llama a initializeDatabase() primero.'
    );
  }
  return pool;
};

/**
 * Ejecuta una consulta en la base de datos
 * @param query - Consulta SQL
 * @param params - Parámetros de la consulta (para prevenir SQL injection)
 */
const query = async <T = any>(queryText: string, params?: any[]): Promise<T[]> => {
  const pool = getPool();
  try {
    const result = await pool.query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('Error en consulta SQL:', queryText, error);
    throw error;
  }
};

/**
 * Ejecuta una consulta que devuelve una sola fila
 */
const queryOne = async <T = any>(queryText: string, params?: any[]): Promise<T | null> => {
  const results = await query<T>(queryText, params);
  return results.length > 0 ? results[0] : null;
};

/**
 * Cierra la conexión del pool
 */
const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    console.log('Conexión a PostgreSQL cerrada.');
  }
};

export { initializeDatabase, getPool, query, queryOne, closeDatabase };
