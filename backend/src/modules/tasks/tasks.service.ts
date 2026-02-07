import { TaskStatus, Prisma } from "@prisma/client";
import { HttpError } from "../../common/http-error";
import { prisma } from "../../lib/prisma";
import type { CreateTaskInput, ListTasksQueryInput, UpdateTaskInput } from "./tasks.schema";

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskSelect;

type UserTask = Prisma.TaskGetPayload<{ select: typeof taskSelect }>;

const findTaskById = async (userId: string, taskId: string): Promise<UserTask> => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    select: taskSelect,
  });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  return task;
};

export const tasksService = {
  async createTask(userId: string, input: CreateTaskInput): Promise<UserTask> {
    return prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status ?? TaskStatus.PENDING,
        userId,
      },
      select: taskSelect,
    });
  },

  async listTasks(userId: string, query: ListTasksQueryInput) {
    const where: Prisma.TaskWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            title: {
              contains: query.search,
              mode: "insensitive",
            },
          }
        : {}),
    };

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit,
        select: taskSelect,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems: total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async getTaskById(userId: string, taskId: string): Promise<UserTask> {
    return findTaskById(userId, taskId);
  },

  async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<UserTask> {
    await findTaskById(userId, taskId);

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
      select: taskSelect,
    });
  },

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await findTaskById(userId, taskId);
    await prisma.task.delete({ where: { id: taskId } });
  },

  async toggleTaskStatus(userId: string, taskId: string): Promise<UserTask> {
    const existingTask = await findTaskById(userId, taskId);

    const nextStatus =
      existingTask.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;

    return prisma.task.update({
      where: { id: taskId },
      data: { status: nextStatus },
      select: taskSelect,
    });
  },
};
