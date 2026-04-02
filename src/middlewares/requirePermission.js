import { ApiError } from '../utils/ApiError.js';

/**
 * RBAC: requires one of the given permission names on the JWT payload.
 * Admin role (name === 'admin') bypasses checks if you include that in token.
 */
export function requirePermission(...permissionNames) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return next(ApiError.unauthorized());
    }

    if (user.roleName === 'admin') {
      return next();
    }

    const set = new Set(user.permissions);
    const ok = permissionNames.some((p) => set.has(p));
    if (!ok) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}
