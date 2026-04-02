import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import { sendMail } from '../services/email.service.js';

/**
 * POST /api/auth/register — creates user + employee (requires users:create).
 */
export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  await sendMail({
    to: req.body.email,
    subject: 'Your account was created',
    text: `Hello ${req.body.firstName}, your account has been registered.`,
    html: `<p>Hello ${req.body.firstName},</p><p>Your account has been registered.</p>`,
  }).catch(() => {});
  res.status(201).json({ success: true, data: result });
});

/**
 * POST /api/auth/login — returns JWT + user info.
 */
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
});

/**
 * GET /api/auth/me — current user profile (requires Authorization).
 */
export const me = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  res.json({ success: true, data });
});
