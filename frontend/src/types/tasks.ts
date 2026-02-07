export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskListResponse = {
  items: Task[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export type TaskResponse = {
  message: string;
  task: Task;
};
