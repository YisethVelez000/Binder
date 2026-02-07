import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id: binderId } = await params;
  const binder = await prisma.binder.findFirst({ where: { id: binderId, userId: session.user.id } });
  if (!binder) return NextResponse.json({ error: "Binder no encontrado" }, { status: 404 });
  const count = await prisma.binderPage.count({ where: { binderId } });
  const page = await prisma.binderPage.create({
    data: {
      binderId,
      pageIndex: count,
      pageType: "normal",
      slots: { create: [0, 1, 2, 3].map((slotIndex) => ({ slotIndex })) },
    },
    include: { slots: true },
  });
  return NextResponse.json(page);
}
