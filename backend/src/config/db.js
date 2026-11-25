const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('Avertissement : DATABASE_URL n\'est pas définie dans les variables d\'environnement.');
}

const needsSsl =
  process.env.NODE_ENV === 'production' ||
  (process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.includes('sslmode=require') ||
      process.env.DATABASE_URL.includes('neon.tech')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

/**
 * Exécute une requête SQL paramétrée sur le pool de connexions.
 */
const query = (text, params = []) => pool.query(text, params);

/**
 * Exécute une fonction dans une transaction PostgreSQL (BEGIN / COMMIT / ROLLBACK).
 */
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  withTransaction,
};
