import { TaskStatus } from "@prisma/client";
import { z } from "zod";

const taskTitleSchema = z.string().trim().min(1).max(120);
const taskDescriptionSchema = z.string().trim().max(2000);

export const taskIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema.optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const updateTaskSchema = z
  .object({
    title: taskTitleSchema.optional(),
    description: taskDescriptionSchema.optional(),
    status: z.nativeEnum(TaskStatus).optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one field is required",
  });

export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.nativeEnum(TaskStatus).optional(),
  search: z.string().trim().max(120).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQueryInput = z.infer<typeof listTasksQuerySchema>;
