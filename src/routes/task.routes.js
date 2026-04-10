import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { validate } from '../middlewares/validate.js';
import {
  taskCreateSchema,
  taskUpdateSchema,
  taskIdParamSchema,
} from '../validators/task.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('tasks:read'), taskController.list);
router.get(
  '/:id',
  requirePermission('tasks:read'),
  validate(taskIdParamSchema),
  taskController.getOne
);
router.post(
  '/',
  requirePermission('tasks:create'),
  validate(taskCreateSchema),
  taskController.create
);
router.patch(
  '/:id',
  requirePermission('tasks:update'),
  validate(taskUpdateSchema),
  taskController.update
);
router.delete(
  '/:id',
  requirePermission('tasks:delete'),
  validate(taskIdParamSchema),
  taskController.remove
);

export default router;
