import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { registerSchema, loginSchema } from '../validators/auth.schemas.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post(
  '/register',
  authenticate,
  requirePermission('users:create'),
  validate(registerSchema),
  authController.register
);
router.get('/me', authenticate, authController.me);

export default router;
