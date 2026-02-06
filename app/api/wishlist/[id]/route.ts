import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const item = await prisma.wishlistItem.findFirst({ where: { id, userId: session.user.id } });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const body = await request.json();
  const updated = await prisma.wishlistItem.update({
    where: { id },
    data: {
      ...(body.notes != null && { notes: body.notes }),
      ...(body.priority != null && { priority: body.priority }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const item = await prisma.wishlistItem.findFirst({ where: { id, userId: session.user.id } });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  await prisma.wishlistItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
