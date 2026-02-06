import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const [totalCards, totalWishlist, byGroup] = await Promise.all([
    prisma.photocard.count({ where: { userId: session.user.id } }),
    prisma.wishlistItem.count({ where: { userId: session.user.id } }),
    prisma.photocard.groupBy({
      by: ["groupSlug", "groupName"],
      where: { userId: session.user.id },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);
  return NextResponse.json({
    totalPhotocards: totalCards,
    totalWishlist: totalWishlist,
    byGroup: byGroup.map((g) => ({ groupSlug: g.groupSlug, groupName: g.groupName, count: g._count.id })),
  });
}
