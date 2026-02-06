import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const [totalPhotocards, totalWishlist, byGroup] = await Promise.all([
    prisma.photocard.count({ where: { userId: session.user.id } }),
    prisma.wishlistItem.count({ where: { userId: session.user.id } }),
    prisma.photocard.groupBy({
      by: ["groupSlug", "groupName"],
      where: { userId: session.user.id },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);
  const stats = {
    totalPhotocards,
    totalWishlist,
    byGroup: byGroup.map((g) => ({ groupName: g.groupName, groupSlug: g.groupSlug, count: g._count.id })),
  };
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-[var(--text)] mb-6">
        Tu colección
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link
          href="/photocards"
          className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] p-6 transition hover:border-[var(--accent)]/50"
        >
          <p className="text-3xl font-semibold text-[var(--accent)]">
            {stats?.totalPhotocards ?? 0}
          </p>
          <p className="text-sm text-[var(--text-muted)]">Photocards</p>
        </Link>
        <Link
          href="/wishlist"
          className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] p-6 transition hover:border-[var(--accent)]/50"
        >
          <p className="text-3xl font-semibold text-[var(--accent)]">
            {stats?.totalWishlist ?? 0}
          </p>
          <p className="text-sm text-[var(--text-muted)]">En wishlist</p>
        </Link>
        <Link
          href="/binders"
          className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] p-6 transition hover:border-[var(--accent)]/50 sm:col-span-2 lg:col-span-1"
        >
          <p className="text-sm text-[var(--text-muted)]">Ver binders</p>
        </Link>
      </div>
      {stats?.byGroup?.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-medium text-[var(--text)] mb-3">
            Por grupo
          </h2>
          <ul className="space-y-2">
            {stats.byGroup.slice(0, 5).map((g: { groupName: string; count: number }) => (
              <li
                key={g.groupName}
                className="flex justify-between rounded-xl bg-[var(--bg-secondary)] px-4 py-2 text-[var(--text)]"
              >
                <span>{g.groupName}</span>
                <span className="text-[var(--text-muted)]">{g.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
