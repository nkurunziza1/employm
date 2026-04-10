import { asyncHandler } from '../utils/asyncHandler.js';
import * as taskService from '../services/task.service.js';
import { canReadAll } from '../utils/rbac.js';
import { ApiError } from '../utils/ApiError.js';

export const list = asyncHandler(async (req, res) => {
  const all = canReadAll(req.user, 'tasks');
  const employeeId = req.user.employeeId;
  const data = await taskService.listTasks({ all, employeeId });
  res.json({ success: true, data });
});

export const getOne = asyncHandler(async (req, res) => {
  const row = await taskService.getTaskById(req.params.id);
  if (!row) {
    throw ApiError.notFound('Task not found');
  }
  const all = canReadAll(req.user, 'tasks');
  if (!all && req.user.employeeId) {
    const eid = req.user.employeeId;
    if (row.assignedTo !== eid && row.createdBy !== eid) {
      throw ApiError.forbidden('You cannot view this task');
    }
  }
  res.json({ success: true, data: row });
});

export const create = asyncHandler(async (req, res) => {
  const data = await taskService.createTask(req.body, req.user.employeeId);
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const existing = await taskService.getTaskById(req.params.id);
  if (!existing) {
    throw ApiError.notFound('Task not found');
  }
  const all = canReadAll(req.user, 'tasks');
  if (!all && req.user.employeeId) {
    const eid = req.user.employeeId;
    if (existing.assignedTo !== eid && existing.createdBy !== eid) {
      throw ApiError.forbidden('You cannot edit this task');
    }
  }
  const data = await taskService.updateTask(req.params.id, req.body);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  const existing = await taskService.getTaskById(req.params.id);
  if (!existing) {
    throw ApiError.notFound('Task not found');
  }
  const all = canReadAll(req.user, 'tasks');
  if (!all && req.user.employeeId) {
    const eid = req.user.employeeId;
    if (existing.assignedTo !== eid && existing.createdBy !== eid) {
      throw ApiError.forbidden('You cannot delete this task');
    }
  }
  await taskService.deleteTask(req.params.id);
  res.json({ success: true, data: { deleted: true } });
});
