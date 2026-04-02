/**
 * Seeds roles, permissions, role_permissions, and a default admin user.
 * Run: npm run db:seed  (requires schema applied and .env configured)
 */
import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';

const PERMISSIONS = [
  { name: 'users:create', description: 'Register new users' },
  { name: 'employees:read', description: 'List/view employees' },
  { name: 'employees:update', description: 'Update employee profiles' },
  { name: 'tasks:read', description: 'View tasks (scoped if not read_all)' },
  { name: 'tasks:read_all', description: 'View all tasks' },
  { name: 'tasks:create', description: 'Create tasks' },
  { name: 'tasks:update', description: 'Update tasks' },
  { name: 'tasks:delete', description: 'Delete tasks' },
  { name: 'attendance:read', description: 'View attendance' },
  { name: 'attendance:read_all', description: 'View all attendance' },
  { name: 'attendance:create', description: 'Create attendance' },
  { name: 'attendance:update', description: 'Update attendance' },
  { name: 'attendance:delete', description: 'Delete attendance' },
  { name: 'payroll:read', description: 'View payroll' },
  { name: 'payroll:read_all', description: 'View all payroll' },
  { name: 'payroll:create', description: 'Create payroll' },
  { name: 'payroll:update', description: 'Update payroll' },
  { name: 'payroll:delete', description: 'Delete payroll' },
  { name: 'reports:read', description: 'Monthly dashboard / reports' },
  { name: 'roles:manage', description: 'Manage roles and permissions' },
];

const ROLES = [
  { name: 'admin', description: 'Full access' },
  { name: 'hr_manager', description: 'HR — manage people and payroll' },
  { name: 'employee', description: 'Standard employee' },
];

async function main() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const p of PERMISSIONS) {
      await conn.execute(
        `INSERT IGNORE INTO permissions (name, description) VALUES (?, ?)`,
        [p.name, p.description]
      );
    }

    const [permRows] = await conn.query(`SELECT id, name FROM permissions`);
    const permByName = Object.fromEntries(permRows.map((r) => [r.name, r.id]));

    for (const r of ROLES) {
      await conn.execute(
        `INSERT IGNORE INTO roles (name, description) VALUES (?, ?)`,
        [r.name, r.description]
      );
    }

    const [roleRows] = await conn.query(`SELECT id, name FROM roles`);
    const roleByName = Object.fromEntries(roleRows.map((r) => [r.name, r.id]));

    const allPermIds = PERMISSIONS.map((p) => permByName[p.name]);

    async function grant(roleName, names) {
      const rid = roleByName[roleName];
      for (const n of names) {
        const pid = permByName[n];
        if (!pid) continue;
        await conn.execute(
          `INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
          [rid, pid]
        );
      }
    }

    await conn.query(`DELETE FROM role_permissions`);

    await grant(
      'admin',
      PERMISSIONS.map((p) => p.name)
    );

    await grant('hr_manager', [
      'users:create',
      'employees:read',
      'employees:update',
      'tasks:read',
      'tasks:read_all',
      'tasks:create',
      'tasks:update',
      'tasks:delete',
      'attendance:read',
      'attendance:read_all',
      'attendance:create',
      'attendance:update',
      'attendance:delete',
      'payroll:read',
      'payroll:read_all',
      'payroll:create',
      'payroll:update',
      'payroll:delete',
      'reports:read',
    ]);

    await grant('employee', [
      'tasks:read',
      'tasks:update',
      'tasks:delete',
      'attendance:read',
      'payroll:read',
      'reports:read',
    ]);

    const adminRoleId = roleByName['admin'];
    const email = 'admin@xander.com';
    const password = 'Admin123!';

    const [existing] = await conn.query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length) {
      console.log('Admin user already exists, skipping user insert.');
    } else {
      const hash = await bcrypt.hash(password, 10);
      const [ur] = await conn.execute(
        `INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)`,
        [email, hash, adminRoleId]
      );
      const userId = ur.insertId;
      await conn.execute(
        `INSERT INTO employees (user_id, first_name, last_name, department, position, hire_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, 'System', 'Administrator', 'IT', 'Admin', new Date().toISOString().slice(0, 10)]
      );
      console.log('Created admin user:', email, '/', password);
    }

    await conn.commit();
    console.log('Seed completed.');
  } catch (e) {
    await conn.rollback();
    console.error(e);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

main();
