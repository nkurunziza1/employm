import { query, execute } from '../utils/db.js';
import { ApiError } from '../utils/ApiError.js';

function mapEmployeeRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    department: row.department,
    position: row.position,
    hireDate: row.hire_date,
    isActive: !!row.is_active,
    roleId: row.role_id,
    roleName: row.role_name,
  };
}

/**
 * Lists employees with user + role info (admin / HR).
 */
export async function listEmployees() {
  const rows = await query(
    `SELECT e.id, e.user_id, u.email, e.first_name, e.last_name, e.phone, e.department,
            e.position, e.hire_date, u.is_active, u.role_id, r.name AS role_name
     FROM employees e
     INNER JOIN users u ON u.id = e.user_id
     INNER JOIN roles r ON r.id = u.role_id
     ORDER BY e.last_name, e.first_name`
  );
  return rows.map(mapEmployeeRow);
}

export async function getEmployeeById(id) {
  const rows = await query(
    `SELECT e.id, e.user_id, u.email, e.first_name, e.last_name, e.phone, e.department,
            e.position, e.hire_date, u.is_active, u.role_id, r.name AS role_name
     FROM employees e
     INNER JOIN users u ON u.id = e.user_id
     INNER JOIN roles r ON r.id = u.role_id
     WHERE e.id = ?`,
    [id]
  );
  return mapEmployeeRow(rows[0]);
}

export async function updateEmployee(id, data) {
  const existing = await query(`SELECT id, user_id FROM employees WHERE id = ?`, [id]);
  if (!existing.length) {
    throw ApiError.notFound('Employee not found');
  }

  const fields = [];
  const values = [];
  if (data.firstName !== undefined) {
    fields.push('first_name = ?');
    values.push(data.firstName);
  }
  if (data.lastName !== undefined) {
    fields.push('last_name = ?');
    values.push(data.lastName);
  }
  if (data.phone !== undefined) {
    fields.push('phone = ?');
    values.push(data.phone);
  }
  if (data.department !== undefined) {
    fields.push('department = ?');
    values.push(data.department);
  }
  if (data.position !== undefined) {
    fields.push('position = ?');
    values.push(data.position);
  }
  if (data.hireDate !== undefined) {
    fields.push('hire_date = ?');
    values.push(data.hireDate);
  }

  if (fields.length) {
    values.push(id);
    await execute(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  return getEmployeeById(id);
}

export async function setUserActive(userId, isActive) {
  const r = await execute(`UPDATE users SET is_active = ? WHERE id = ?`, [
    isActive ? 1 : 0,
    userId,
  ]);
  return r.affectedRows > 0;
}
