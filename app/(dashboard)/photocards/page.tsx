import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddPhotocardForm } from "./AddPhotocardForm";
import { PhotocardCard } from "./PhotocardCard";

export default async function PhotocardsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const [photocards, groups] = await Promise.all([
    prisma.photocard.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.group.findMany({
      include: { members: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">
          Mis photocards
        </h1>
        <AddPhotocardForm groups={JSON.parse(JSON.stringify(groups))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {photocards.map((card) => (
          <PhotocardCard key={card.id} photocard={card} groups={JSON.parse(JSON.stringify(groups))} />
        ))}
      </div>
      {photocards.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[var(--accent-secondary)]/40 bg-[var(--bg-secondary)] p-8 text-center text-[var(--text-muted)]">
          Aún no tienes photocards. Añade una con el botón de arriba.
        </p>
      )}
    </div>
  );
}
