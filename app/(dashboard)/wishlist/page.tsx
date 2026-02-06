import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddWishlistForm } from "./AddWishlistForm";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">
          Wishlist
        </h1>
        <AddWishlistForm />
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Tu lista de photocards que quieres conseguir 💫
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] p-4 flex gap-4"
          >
            <div className="w-20 h-28 rounded-xl bg-[var(--bg)] flex-shrink-0 overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-[var(--text-muted)]">❤️</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--text)] truncate">{item.groupName ?? item.groupSlug}</p>
              <p className="text-sm text-[var(--text-muted)] truncate">{item.memberName ?? item.memberSlug}</p>
              {item.albumName && (
                <p className="text-xs text-[var(--text-muted)] truncate">{item.albumName}</p>
              )}
              {item.notes && (
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--accent-secondary)]/40 bg-[var(--bg-secondary)] p-8 text-center">
          <p className="text-4xl mb-2">✨</p>
          <p className="text-[var(--text-muted)]">Tu lista de sueños está vacía.</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Añade photocards que quieras conseguir.</p>
        </div>
      )}
    </div>
  );
}
