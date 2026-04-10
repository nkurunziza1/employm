import { z } from 'zod';

const status = z.enum(['pending', 'in_progress', 'done', 'cancelled']);
const priority = z.enum(['low', 'medium', 'high']);

export const taskCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: status.optional(),
    priority: priority.optional(),
    dueDate: z.string().optional(),
    assignedTo: z.coerce.number().int().positive().nullable().optional(),
  }),
});

export const taskUpdateSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    status: status.optional(),
    priority: priority.optional(),
    dueDate: z.string().nullable().optional(),
    assignedTo: z.coerce.number().int().positive().nullable().optional(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
