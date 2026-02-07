const sampleTasks = [
  { id: "1", title: "Prepare API contract", status: "IN_PROGRESS" },
  { id: "2", title: "Design task dashboard layout", status: "PENDING" },
  { id: "3", title: "Set up auth refresh flow", status: "COMPLETED" },
];

export default function DashboardPage() {
  return (
    <div className="app-shell px-4 py-10 md:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="surface-card flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">Task Dashboard</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Responsive shell ready. Next step: wire search, filters, and CRUD to the API.
            </p>
          </div>
          <button className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white md:w-auto">
            Add Task
          </button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="surface-card p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              Search
            </p>
            <input
              type="text"
              placeholder="Find by title"
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div className="surface-card p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              Status
            </p>
            <select className="mt-2 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]">
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="surface-card p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              Pagination
            </p>
            <p className="mt-2 text-sm">Page 1 of 1</p>
          </div>
        </section>

        <section className="grid gap-3">
          {sampleTasks.map((task) => (
            <article
              key={task.id}
              className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="text-lg font-medium">{task.title}</h2>
                <p className="mt-1 font-mono text-xs tracking-widest text-[var(--muted)]">
                  {task.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm">
                  Edit
                </button>
                <button className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm">
                  Toggle
                </button>
                <button className="rounded-lg border border-[#e5b7b0] px-3 py-1.5 text-sm text-[#b14033]">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
