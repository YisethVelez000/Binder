import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkBinder(userId: string, binderId: string) {
  const binder = await prisma.binder.findFirst({
    where: { id: binderId, userId },
    include: { pages: { include: { slots: { include: { photocard: true } } }, orderBy: { pageIndex: "asc" } } },
  });
  return binder;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const binder = await checkBinder(session.user.id, id);
  if (!binder) return NextResponse.json({ error: "Binder no encontrado" }, { status: 404 });
  return NextResponse.json(binder);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const binder = await prisma.binder.findFirst({ where: { id, userId: session.user.id } });
  if (!binder) return NextResponse.json({ error: "Binder no encontrado" }, { status: 404 });
  const body = await request.json();
  const updated = await prisma.binder.update({
    where: { id },
    data: {
      ...(body.name != null && { name: body.name }),
      ...(body.isPublic != null && { isPublic: body.isPublic }),
      ...(body.theme != null && { theme: body.theme }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const binder = await prisma.binder.findFirst({ where: { id, userId: session.user.id } });
  if (!binder) return NextResponse.json({ error: "Binder no encontrado" }, { status: 404 });
  await prisma.binder.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
