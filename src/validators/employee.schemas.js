import { z } from 'zod';

const idParam = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const employeeUpdateSchema = z.object({
  ...idParam.shape,
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().nullable().optional(),
    department: z.string().nullable().optional(),
    position: z.string().nullable().optional(),
    hireDate: z.string().nullable().optional(),
  }),
});

export const employeeIdParamSchema = idParam;
