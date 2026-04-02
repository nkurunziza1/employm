import { pool } from '../config/database.js';

/**
 * Runs a prepared SELECT (or any statement where you only need the row array).
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Runs INSERT/UPDATE/DELETE and returns the driver result (affectedRows, insertId, etc.).
 */
export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}
