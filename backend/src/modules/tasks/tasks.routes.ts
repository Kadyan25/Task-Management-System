import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  toggleTask,
  updateTask,
} from "./tasks.controller";

const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.post("/", createTask);
tasksRouter.get("/", listTasks);
tasksRouter.get("/:id", getTaskById);
tasksRouter.patch("/:id", updateTask);
tasksRouter.delete("/:id", deleteTask);
tasksRouter.patch("/:id/toggle", toggleTask);

export default tasksRouter;
