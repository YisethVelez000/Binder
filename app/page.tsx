import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <h1 className="font-display text-3xl font-semibold text-[var(--text)]">
          Hola, {session.user?.name ?? "coleccionista"}
        </h1>
        <Link
          href="/dashboard"
          className="rounded-2xl bg-[var(--accent)] px-6 py-3 font-medium text-[var(--text)] transition hover:opacity-90"
        >
          Ir al dashboard
        </Link>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <h1 className="font-display text-4xl font-semibold text-[var(--text)]">
        Binder
      </h1>
      <p className="max-w-md text-center text-[var(--text-muted)]">
        Tu colección de photocards K-pop en un solo lugar. Crea binders, añade
        photocards y mantén tu wishlist.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-2xl bg-[var(--accent)] px-6 py-3 font-medium text-[var(--text)] transition hover:opacity-90"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
