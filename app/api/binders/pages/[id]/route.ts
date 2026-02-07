import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Actualizar página del binder
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { id: pageId } = await params;
  const page = await prisma.binderPage.findUnique({
    where: { id: pageId },
    include: { binder: true },
  });
  
  if (!page || page.binder.userId !== session.user.id) {
    return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
  }
  
  const body = await request.json();
  
  const updated = await prisma.binderPage.update({
    where: { id: pageId },
    data: {
      ...(body.backgroundType != null && { backgroundType: body.backgroundType }),
      ...(body.backgroundValue != null && { backgroundValue: body.backgroundValue }),
      ...(body.pageType != null && { pageType: body.pageType }),
    },
  });
  
  return NextResponse.json(updated);
}
