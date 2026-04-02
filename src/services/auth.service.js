import { query } from '../utils/db.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken } from '../utils/jwt.js';
import { getPermissionNamesByRoleId } from './permission.service.js';
import { pool } from '../config/database.js';

async function getEmployeeIdForUser(userId) {
  const rows = await query(`SELECT id FROM employees WHERE user_id = ? LIMIT 1`, [
    userId,
  ]);
  return rows.length ? rows[0].id : null;
}

async function getRoleName(roleId) {
  const rows = await query(`SELECT name FROM roles WHERE id = ?`, [roleId]);
  return rows.length ? rows[0].name : null;
}

/**
 * Registers a new user + employee row. Caller must enforce RBAC (e.g. users:create).
 */
export async function registerUser({
  email,
  password,
  firstName,
  lastName,
  phone,
  department,
  position,
  hireDate,
  roleId,
}) {
  const existing = await query(`SELECT id FROM users WHERE email = ?`, [email]);
  if (existing.length) {
    throw ApiError.conflict('Email already registered');
  }

  const roles = await query(`SELECT id FROM roles WHERE id = ?`, [roleId]);
  if (!roles.length) {
    throw ApiError.badRequest('Invalid roleId');
  }

  const passwordHash = await hashPassword(password);
  const conn = await pool.getConnection();
  let userId;
  try {
    await conn.beginTransaction();
    const [userResult] = await conn.execute(
      `INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)`,
      [email, passwordHash, roleId]
    );
    userId = userResult.insertId;
    await conn.execute(
      `INSERT INTO employees (user_id, first_name, last_name, phone, department, position, hire_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        firstName,
        lastName,
        phone ?? null,
        department ?? null,
        position ?? null,
        hireDate || null,
      ]
    );
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  const permissions = await getPermissionNamesByRoleId(roleId);
  const roleName = await getRoleName(roleId);
  const employeeId = await getEmployeeIdForUser(userId);

  const token = signAccessToken({
    sub: userId,
    roleId,
    roleName,
    permissions,
    employeeId,
  });

  return {
    user: { id: userId, email, roleId, employeeId },
    accessToken: token,
  };
}

export async function login({ email, password }) {
  const users = await query(
    `SELECT u.id, u.email, u.password_hash, u.role_id, u.is_active, r.name AS role_name
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE u.email = ?`,
    [email]
  );

  if (!users.length) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const user = users[0];
  if (!user.is_active) {
    throw ApiError.forbidden('Account is disabled');
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const permissions = await getPermissionNamesByRoleId(user.role_id);
  const employeeId = await getEmployeeIdForUser(user.id);

  const accessToken = signAccessToken({
    sub: user.id,
    roleId: user.role_id,
    roleName: user.role_name,
    permissions,
    employeeId,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      permissions,
      employeeId,
    },
  };
}

export async function getProfile(userId) {
  const users = await query(
    `SELECT u.id, u.email, u.role_id, u.is_active, r.name AS role_name
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?`,
    [userId]
  );
  if (!users.length) {
    throw ApiError.notFound('User not found');
  }
  const u = users[0];
  const empRows = await query(
    `SELECT id, first_name, last_name, phone, department, position, hire_date
     FROM employees WHERE user_id = ?`,
    [userId]
  );
  const permissions = await getPermissionNamesByRoleId(u.role_id);
  const emp = empRows[0] ?? null;
  return {
    user: {
      id: u.id,
      email: u.email,
      roleId: u.role_id,
      roleName: u.role_name,
      isActive: !!u.is_active,
      permissions,
      employeeId: emp?.id ?? null,
      employee: emp,
    },
  };
}
