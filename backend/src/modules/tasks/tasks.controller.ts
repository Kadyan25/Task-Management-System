import { asyncHandler } from "../../common/async-handler";
import { HttpError } from "../../common/http-error";
import { tasksService } from "./tasks.service";
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from "./tasks.schema";

const getUserId = (requestUser?: Express.Request["user"]) => {
  if (!requestUser?.id) {
    throw new HttpError(401, "Unauthorized");
  }

  return requestUser.id;
};

export const createTask = asyncHandler(async (req, res) => {
  const userId = getUserId(req.user);
  const input = createTaskSchema.parse(req.body);
  const task = await tasksService.createTask(userId, input);

  res.status(201).json({
    message: "Task created",
    task,
  });
});

export const listTasks = asyncHandler(async (req, res) => {
  const userId = getUserId(req.user);
  const query = listTasksQuerySchema.parse(req.query);
  const result = await tasksService.listTasks(userId, query);

  res.status(200).json(result);
});

export const getTaskById = asyncHandler(async (req, res) => {
  const userId = getUserId(req.user);
  const { id } = taskIdParamsSchema.parse(req.params);
  const task = await tasksService.getTaskById(userId, id);

  res.status(200).json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const userId = getUserId(req.user);
  const { id } = taskIdParamsSchema.parse(req.params);
  const input = updateTaskSchema.parse(req.body);
  const task = await tasksService.updateTask(userId, id, input);

  res.status(200).json({
    message: "Task updated",
    task,
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const userId = getUserId(req.user);
  const { id } = taskIdParamsSchema.parse(req.params);
  await tasksService.deleteTask(userId, id);

  res.status(200).json({ message: "Task deleted" });
});

export const toggleTask = asyncHandler(async (req, res) => {
  const userId = getUserId(req.user);
  const { id } = taskIdParamsSchema.parse(req.params);
  const task = await tasksService.toggleTaskStatus(userId, id);

  res.status(200).json({
    message: "Task status toggled",
    task,
  });
});
