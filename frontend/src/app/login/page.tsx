import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="app-shell px-4 py-10 md:px-8">
      <main className="mx-auto w-full max-w-md">
        <section className="surface-card p-6 md:p-8">
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Sign in to manage your tasks.</p>
          <form className="mt-6 space-y-4">
            <label className="block text-sm">
              <span>Email</span>
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 outline-none focus:border-[var(--brand)]"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm">
              <span>Password</span>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 outline-none focus:border-[var(--brand)]"
                placeholder="••••••••"
              />
            </label>
            <button
              type="button"
              className="w-full rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white"
            >
              Continue
            </button>
          </form>
          <p className="mt-4 text-sm text-[var(--muted)]">
            New here?{" "}
            <Link className="font-medium text-[var(--brand)]" href="/register">
              Create an account
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
