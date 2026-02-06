import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Asignar o quitar una photocard de un slot
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const { slotId, photocardId } = body as { slotId: string; photocardId: string | null };
  if (!slotId) return NextResponse.json({ error: "slotId requerido" }, { status: 400 });
  const slot = await prisma.binderSlot.findUnique({
    where: { id: slotId },
    include: { page: { include: { binder: true } } },
  });
  if (!slot || slot.page.binder.userId !== session.user.id) {
    return NextResponse.json({ error: "Slot no encontrado" }, { status: 404 });
  }
  if (photocardId) {
    const card = await prisma.photocard.findFirst({
      where: { id: photocardId, userId: session.user.id },
    });
    if (!card) return NextResponse.json({ error: "Photocard no encontrada" }, { status: 404 });
    // Quitar de cualquier otro slot
    await prisma.binderSlot.updateMany({
      where: { photocardId },
      data: { photocardId: null },
    });
  }
  const updated = await prisma.binderSlot.update({
    where: { id: slotId },
    data: { photocardId: photocardId || null },
    include: { photocard: true },
  });
  return NextResponse.json(updated);
}
