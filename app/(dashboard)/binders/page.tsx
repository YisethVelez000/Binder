import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BindersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const binders = await prisma.binder.findMany({
    where: { userId: session.user.id },
    include: {
      pages: {
        include: {
          slots: { where: { photocardId: { not: null } }, select: { id: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">
          Mis binders
        </h1>
        <CreateBinderButton />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {binders.map((b) => {
          const cardCount = b.pages.reduce((acc, p) => acc + p.slots.length, 0);
          return (
            <Link
              key={b.id}
              href={`/binders/${b.id}`}
              className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] p-6 transition hover:border-[var(--accent)]/50"
            >
              <div className="aspect-video rounded-xl bg-[var(--accent)]/20 mb-3 flex items-center justify-center text-[var(--text-muted)]">
                {b.coverImageUrl ? (
                  <img src={b.coverImageUrl} alt="" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <span className="text-4xl">📀</span>
                )}
              </div>
              <h2 className="font-display font-medium text-[var(--text)]">{b.name}</h2>
              <p className="text-sm text-[var(--text-muted)]">
                {b.pages.length} página(s) · {cardCount} photocards
              </p>
            </Link>
          );
        })}
      </div>
      {binders.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[var(--accent-secondary)]/40 bg-[var(--bg-secondary)] p-8 text-center text-[var(--text-muted)]">
          Aún no tienes binders. Crea uno para empezar.
        </p>
      )}
    </div>
  );
}

function CreateBinderButton() {
  return (
    <Link
      href="/binders/new"
      className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:opacity-90"
    >
      + Nuevo binder
    </Link>
  );
}
