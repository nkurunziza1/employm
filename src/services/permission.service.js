import { query } from '../utils/db.js';

/**
 * Loads permission names for a role (used at login and for admin UI).
 */
export async function getPermissionNamesByRoleId(roleId) {
  const rows = await query(
    `SELECT p.name
     FROM permissions p
     INNER JOIN role_permissions rp ON rp.permission_id = p.id
     WHERE rp.role_id = ?`,
    [roleId]
  );
  return rows.map((r) => r.name);
}

export async function listAllPermissions() {
  return query(`SELECT id, name, description FROM permissions ORDER BY name`);
}
