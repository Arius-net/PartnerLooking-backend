import { pool, queryOne } from '../config/db';

export interface ReviewRecord {
  id: string;
  autor_id: string;
  evaluado_id: string;
  calificacion: number;
  comentario: string | null;
  created_at: string;
}

export interface ReviewedUserStats {
  id: string;
  calificacion_promedio: string;
  total_resenas: number;
}

const findUserById = async (userId: string): Promise<{ id: string } | null> => {
  return queryOne<{ id: string }>(
    `
      SELECT id
      FROM usuarios
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );
};

const createReviewAndUpdateAverage = async (
  authorId: string,
  evaluatedId: string,
  calificacion: number,
  comentario?: string
): Promise<{ review: ReviewRecord; user: ReviewedUserStats }> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reviewResult = await client.query<ReviewRecord>(
      `
        INSERT INTO resenas (autor_id, evaluado_id, calificacion, comentario)
        VALUES ($1, $2, $3, $4)
        RETURNING id, autor_id, evaluado_id, calificacion, comentario, created_at
      `,
      [authorId, evaluatedId, calificacion, comentario ?? null]
    );

    const updatedUserResult = await client.query<ReviewedUserStats>(
      `
        UPDATE usuarios
        SET
          calificacion_promedio = ROUND(
            (
              (calificacion_promedio * total_resenas) + $1
            ) / (total_resenas + 1),
            2
          ),
          total_resenas = total_resenas + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, calificacion_promedio, total_resenas
      `,
      [calificacion, evaluatedId]
    );

    const review = reviewResult.rows[0];
    const updatedUser = updatedUserResult.rows[0];

    if (reviewResult.rowCount === 0 || updatedUserResult.rowCount === 0 || !review || !updatedUser) {
      throw new Error('No se pudo registrar la reseña.');
    }

    await client.query('COMMIT');

    return {
      review,
      user: updatedUser,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export { findUserById, createReviewAndUpdateAverage };