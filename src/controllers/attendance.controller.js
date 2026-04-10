import { asyncHandler } from '../utils/asyncHandler.js';
import * as attendanceService from '../services/attendance.service.js';
import { canReadAll } from '../utils/rbac.js';
import { ApiError } from '../utils/ApiError.js';

export const list = asyncHandler(async (req, res) => {
  const all = canReadAll(req.user, 'attendance');
  const scopeEmployeeId = all ? null : req.user.employeeId;
  const { employeeId, month, year } = req.query;
  const data = await attendanceService.listAttendance({
    employeeId: employeeId ? Number(employeeId) : undefined,
    month: month ? Number(month) : undefined,
    year: year ? Number(year) : undefined,
    all,
    scopeEmployeeId,
  });
  res.json({ success: true, data });
});

export const getOne = asyncHandler(async (req, res) => {
  const row = await attendanceService.getAttendanceById(req.params.id);
  if (!row) {
    throw ApiError.notFound('Attendance not found');
  }
  const all = canReadAll(req.user, 'attendance');
  if (!all && req.user.employeeId && row.employeeId !== req.user.employeeId) {
    throw ApiError.forbidden('You cannot view this record');
  }
  res.json({ success: true, data: row });
});

export const create = asyncHandler(async (req, res) => {
  const data = await attendanceService.createAttendance(req.body);
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const existing = await attendanceService.getAttendanceById(req.params.id);
  if (!existing) {
    throw ApiError.notFound('Attendance not found');
  }
  const all = canReadAll(req.user, 'attendance');
  if (!all && req.user.employeeId && existing.employeeId !== req.user.employeeId) {
    throw ApiError.forbidden('You cannot edit this record');
  }
  const data = await attendanceService.updateAttendance(req.params.id, req.body);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  const existing = await attendanceService.getAttendanceById(req.params.id);
  if (!existing) {
    throw ApiError.notFound('Attendance not found');
  }
  const all = canReadAll(req.user, 'attendance');
  if (!all && req.user.employeeId && existing.employeeId !== req.user.employeeId) {
    throw ApiError.forbidden('You cannot delete this record');
  }
  await attendanceService.deleteAttendance(req.params.id);
  res.json({ success: true, data: { deleted: true } });
});
