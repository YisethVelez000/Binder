import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BinderView } from "./BinderView";
import { BinderNameEditor } from "./BinderNameEditor";

export default async function BinderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const { id } = await params;
  const binder = await prisma.binder.findFirst({
    where: { id, userId: session.user.id },
    include: {
      pages: {
        orderBy: { pageIndex: "asc" },
        include: {
          slots: { include: { photocard: true }, orderBy: { slotIndex: "asc" } },
        },
      },
    },
  });
  if (!binder) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center gap-4">
        <Link
          href="/binders"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          ← Binders
        </Link>
      </div>
      <BinderNameEditor binderId={binder.id} initialName={binder.name} />
      <BinderView binder={JSON.parse(JSON.stringify(binder))} />
    </div>
  );
}
