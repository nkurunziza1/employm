import { z } from 'zod';

const status = z.enum(['present', 'absent', 'leave', 'half_day']);

export const attendanceCreateSchema = z.object({
  body: z.object({
    employeeId: z.coerce.number().int().positive(),
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    status: status.optional(),
    notes: z.string().optional(),
  }),
});

export const attendanceUpdateSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    workDate: z.string().optional(),
    checkIn: z.string().nullable().optional(),
    checkOut: z.string().nullable().optional(),
    status: status.optional(),
    notes: z.string().nullable().optional(),
  }),
});

export const attendanceQuerySchema = z.object({
  query: z.object({
    employeeId: z.coerce.number().int().positive().optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
  }),
});

export const attendanceIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
