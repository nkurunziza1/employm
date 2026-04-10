import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { validate } from '../middlewares/validate.js';
import {
  attendanceCreateSchema,
  attendanceUpdateSchema,
  attendanceQuerySchema,
  attendanceIdParamSchema,
} from '../validators/attendance.schemas.js';
import { z } from 'zod';

const exportQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2000).max(2100),
  }),
});

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('attendance:read'),
  validate(attendanceQuerySchema),
  attendanceController.list
);
router.get(
  '/:id',
  requirePermission('attendance:read'),
  validate(attendanceIdParamSchema),
  attendanceController.getOne
);
router.post(
  '/',
  requirePermission('attendance:create'),
  validate(attendanceCreateSchema),
  attendanceController.create
);
router.patch(
  '/:id',
  requirePermission('attendance:update'),
  validate(attendanceUpdateSchema),
  attendanceController.update
);
router.delete(
  '/:id',
  requirePermission('attendance:delete'),
  validate(attendanceIdParamSchema),
  attendanceController.remove
);

export default router;
