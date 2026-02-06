import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--accent-secondary)]/20 bg-[var(--bg-secondary)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="font-display text-xl font-semibold text-[var(--text)]">
            Binder
          </Link>
          <nav className="flex gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Inicio
            </Link>
            <Link
              href="/binders"
              className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Binders
            </Link>
            <Link
              href="/photocards"
              className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Photocards
            </Link>
            <Link
              href="/wishlist"
              className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Wishlist
            </Link>
            <Link
              href="/catalog"
              className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Catálogo
            </Link>
            <Link
              href="/groups"
              className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Grupos
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-muted)]">{session.user?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
