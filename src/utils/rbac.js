/**
 * Small helpers for permission checks outside middleware (e.g. list scoping).
 */
export function canReadAll(user, resourcePrefix) {
  if (!user) return false;
  if (user.roleName === 'admin') return true;
  return user.permissions.includes(`${resourcePrefix}:read_all`);
}
