import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const binders = await prisma.binder.findMany({
    where: { userId: session.user.id },
    include: { pages: { include: { slots: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(binders);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const name = (body.name as string) || "Mi Binder";
  const binder = await prisma.binder.create({
    data: {
      userId: session.user.id,
      name,
    },
  });
  // Primera página con 4 slots (2x2)
  await prisma.binderPage.create({
    data: {
      binderId: binder.id,
      pageIndex: 0,
      slots: {
        create: [0, 1, 2, 3].map((slotIndex) => ({ slotIndex })),
      },
    },
  });
  const withPages = await prisma.binder.findUnique({
    where: { id: binder.id },
    include: { pages: { include: { slots: true } } },
  });
  return NextResponse.json(withPages);
}
