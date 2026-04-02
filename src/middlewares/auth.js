import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Reads Bearer JWT and attaches decoded payload to req.user.
 */
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or invalid Authorization header'));
  }

  const token = header.slice(7);
  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: Number(decoded.sub),
      roleId: Number(decoded.roleId),
      roleName: decoded.roleName,
      permissions: decoded.permissions ?? [],
      employeeId:
        decoded.employeeId != null && decoded.employeeId !== ''
          ? Number(decoded.employeeId)
          : null,
    };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}
