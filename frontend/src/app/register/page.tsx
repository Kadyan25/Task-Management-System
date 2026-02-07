"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { register, errorMessage, clearError, isInitializing } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setIsSubmitting(true);
    const success = await register(email, password);
    setIsSubmitting(false);
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="app-shell px-4 py-10 md:px-8">
      <main className="mx-auto w-full max-w-md">
        <section className="surface-card p-6 md:p-8">
          <h1 className="text-2xl font-semibold">Register</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Create your task manager account.</p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm">
              <span>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 outline-none focus:border-[var(--brand)]"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm">
              <span>Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 outline-none focus:border-[var(--brand)]"
                placeholder="At least 8 characters"
              />
            </label>
            {errorMessage ? <p className="text-sm text-[#b14033]">{errorMessage}</p> : null}
            <button
              type="submit"
              disabled={isSubmitting || isInitializing}
              className="w-full rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
          </form>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link className="font-medium text-[var(--brand)]" href="/login">
              Login
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
