import Link from "next/link";

export default function Home() {
  return (
    <div className="app-shell px-4 py-10 md:px-8">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="surface-card p-6 md:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
            Track A: Full Stack
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">Task Management System</h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--muted)] md:text-base">
            Responsive web app foundation is ready. Next we wire these pages to live API auth and
            task endpoints.
          </p>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          <Link
            href="/login"
            className="surface-card p-5 transition-transform hover:-translate-y-0.5"
          >
            <h2 className="text-xl font-semibold">Login</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Access existing account.</p>
          </Link>
          <Link
            href="/register"
            className="surface-card p-5 transition-transform hover:-translate-y-0.5"
          >
            <h2 className="text-xl font-semibold">Register</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Create a new account.</p>
          </Link>
          <Link
            href="/dashboard"
            className="surface-card p-5 transition-transform hover:-translate-y-0.5"
          >
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">View and manage tasks.</p>
          </Link>
        </section>
      </main>
    </div>
  );
}
