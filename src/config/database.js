import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});


export async function pingDatabase() {
  try {
    await pool.query("SELECT 1 AS ping");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      code: err.code,
      message: err.message,
    };
  }
}

export async function closePool() {
  await pool.end();
}
