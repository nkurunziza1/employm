import { asyncHandler } from '../utils/asyncHandler.js';
import * as employeeService from '../services/employee.service.js';
import { ApiError } from '../utils/ApiError.js';

export const list = asyncHandler(async (req, res) => {
  const data = await employeeService.listEmployees();
  res.json({ success: true, data });
});

export const getOne = asyncHandler(async (req, res) => {
  const row = await employeeService.getEmployeeById(req.params.id);
  if (!row) {
    throw ApiError.notFound('Employee not found');
  }
  res.json({ success: true, data: row });
});

export const update = asyncHandler(async (req, res) => {
  const data = await employeeService.updateEmployee(req.params.id, req.body);
  res.json({ success: true, data });
});
