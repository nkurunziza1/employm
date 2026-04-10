import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { validate } from '../middlewares/validate.js';
import {
  employeeUpdateSchema,
  employeeIdParamSchema,
} from '../validators/employee.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('employees:read'), employeeController.list);
router.get(
  '/:id',
  requirePermission('employees:read'),
  validate(employeeIdParamSchema),
  employeeController.getOne
);
router.patch(
  '/:id',
  requirePermission('employees:update'),
  validate(employeeUpdateSchema),
  employeeController.update
);

export default router;
