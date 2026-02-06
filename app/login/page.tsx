"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password: "demo",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Error al conectar con la base de datos. Comprueba que .env tenga la DATABASE_URL correcta y ejecuta: npx prisma db push" : res.error);
      return;
    }
    if (res?.ok) window.location.href = callbackUrl;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] p-8 shadow-lg">
        <h1 className="font-display text-2xl font-semibold text-[var(--text)] mb-6">
          Iniciar sesión
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          MVP: escribe tu email y pulsa Entrar (no se comprueba contraseña).
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-sm font-medium text-[var(--text)]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="tu@email.com"
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[var(--accent)] py-3 font-medium text-[var(--text)] transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
          <Link href="/" className="underline hover:text-[var(--accent)]">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
