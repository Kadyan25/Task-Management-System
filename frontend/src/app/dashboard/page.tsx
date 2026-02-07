"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiError } from "@/lib/api";
import type { Task, TaskListResponse, TaskResponse, TaskStatus } from "@/types/tasks";

const PAGE_SIZE = 6;
const STATUS_OPTIONS: Array<{ label: string; value: "" | TaskStatus }> = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

type Toast = { id: number; message: string };

const getStatusBadgeClass = (status: TaskStatus): string => {
  if (status === "COMPLETED") {
    return "bg-[#dff3df] text-[#1f6d2a]";
  }
  if (status === "IN_PROGRESS") {
    return "bg-[#dde9f9] text-[#1e4f8a]";
  }
  return "bg-[#f3f0dc] text-[#735800]";
};

export default function DashboardPage() {
  const router = useRouter();
  const { isInitializing, isAuthenticated, user, logout, authorizedRequest } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | TaskStatus>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<TaskStatus>("PENDING");
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((previous) => [...previous, { id, message }]);
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const closeEditor = useCallback(() => {
    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormStatus("PENDING");
    setRequestError(null);
  }, []);

  const openCreate = () => {
    setEditingTask({ id: "", title: "", description: null, status: "PENDING", userId: "", createdAt: "", updatedAt: "" });
    setFormTitle("");
    setFormDescription("");
    setFormStatus("PENDING");
    setRequestError(null);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description ?? "");
    setFormStatus(task.status);
    setRequestError(null);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitializing, router]);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setRequestError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (statusFilter) {
        params.set("status", statusFilter);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const response = await authorizedRequest<TaskListResponse>(`/tasks?${params.toString()}`, {
        method: "GET",
      });

      setTasks(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      if (error instanceof ApiError) {
        setRequestError(error.message);
      } else {
        setRequestError("Unable to load tasks");
      }
    } finally {
      setIsLoading(false);
    }
  }, [authorizedRequest, isAuthenticated, page, searchQuery, statusFilter]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const saveTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTask) {
      return;
    }

    setIsSaving(true);
    setRequestError(null);

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim() ? formDescription.trim() : undefined,
      status: formStatus,
    };

    try {
      if (editingTask.id) {
        await authorizedRequest<TaskResponse>(`/tasks/${editingTask.id}`, {
          method: "PATCH",
          body: payload,
        });
        addToast("Task updated");
      } else {
        await authorizedRequest<TaskResponse>("/tasks", {
          method: "POST",
          body: payload,
        });
        addToast("Task created");
      }

      closeEditor();
      await fetchTasks();
    } catch (error) {
      if (error instanceof ApiError) {
        setRequestError(error.message);
      } else {
        setRequestError("Unable to save task");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    const confirmDelete = window.confirm("Delete this task?");
    if (!confirmDelete) {
      return;
    }

    try {
      await authorizedRequest<{ message: string }>(`/tasks/${taskId}`, { method: "DELETE" });
      addToast("Task deleted");
      await fetchTasks();
    } catch (error) {
      if (error instanceof ApiError) {
        setRequestError(error.message);
      } else {
        setRequestError("Unable to delete task");
      }
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      await authorizedRequest<TaskResponse>(`/tasks/${taskId}/toggle`, { method: "PATCH" });
      addToast("Task status updated");
      await fetchTasks();
    } catch (error) {
      if (error instanceof ApiError) {
        setRequestError(error.message);
      } else {
        setRequestError("Unable to toggle task");
      }
    }
  };

  const paginationLabel = useMemo(() => `Page ${page} of ${totalPages}`, [page, totalPages]);

  if (isInitializing) {
    return (
      <div className="app-shell px-4 py-10 md:px-8">
        <main className="mx-auto w-full max-w-6xl">
          <section className="surface-card p-6">
            <p className="text-sm text-[var(--muted)]">Checking session...</p>
          </section>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="app-shell px-4 py-10 md:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="surface-card flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">Task Dashboard</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Signed in as {user?.email ?? "user"}.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white"
              onClick={openCreate}
            >
              Add Task
            </button>
            <button
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
              onClick={() => logout()}
            >
              Logout
            </button>
          </div>
        </section>

        {editingTask ? (
          <section className="surface-card p-5 md:p-6">
            <h2 className="text-xl font-semibold">{editingTask.id ? "Edit Task" : "Create Task"}</h2>
            <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={saveTask}>
              <label className="block text-sm md:col-span-2">
                <span>Title</span>
                <input
                  required
                  minLength={1}
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--brand)]"
                />
              </label>
              <label className="block text-sm">
                <span>Status</span>
                <select
                  value={formStatus}
                  onChange={(event) => setFormStatus(event.target.value as TaskStatus)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--brand)]"
                >
                  {STATUS_OPTIONS.filter((item) => item.value).map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm md:col-span-3">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--brand)]"
                />
              </label>
              <div className="md:col-span-3 flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="surface-card p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Search</p>
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Find by title"
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div className="surface-card p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Status</p>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as "" | TaskStatus);
                setPage(1);
              }}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="surface-card p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Pagination</p>
            <p className="mt-2 text-sm">{paginationLabel}</p>
            <div className="mt-2 flex gap-2">
              <button
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              >
                Prev
              </button>
              <button
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {requestError ? (
          <section className="surface-card border-[#e5b7b0] p-4 text-sm text-[#b14033]">{requestError}</section>
        ) : null}

        <section className="grid gap-3">
          {isLoading ? (
            <article className="surface-card p-5 text-sm text-[var(--muted)]">Loading tasks...</article>
          ) : null}
          {!isLoading && tasks.length === 0 ? (
            <article className="surface-card p-5 text-sm text-[var(--muted)]">
              No tasks found. Create one to get started.
            </article>
          ) : null}
          {!isLoading
            ? tasks.map((task) => (
                <article
                  key={task.id}
                  className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="text-lg font-medium">{task.title}</h2>
                    {task.description ? (
                      <p className="mt-1 text-sm text-[var(--muted)]">{task.description}</p>
                    ) : null}
                    <p className={`mt-2 inline-block rounded px-2 py-1 font-mono text-xs ${getStatusBadgeClass(task.status)}`}>
                      {task.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm"
                      onClick={() => openEdit(task)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm"
                      onClick={() => toggleTask(task.id)}
                    >
                      Toggle
                    </button>
                    <button
                      className="rounded-lg border border-[#e5b7b0] px-3 py-1.5 text-sm text-[#b14033]"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            : null}
        </section>
      </main>

      <aside className="fixed right-4 bottom-4 z-50 flex w-[min(90vw,320px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="surface-card border-[var(--brand)] px-4 py-3 text-sm">
            {toast.message}
          </div>
        ))}
      </aside>
    </div>
  );
}
