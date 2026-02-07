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
  
  try {
    const body = await request.json();
    
    // Validar formato de colores si se proporcionan
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (body.primaryColor != null && !hexColorRegex.test(body.primaryColor)) {
      return NextResponse.json({ error: "Formato de color principal inválido" }, { status: 400 });
    }
    if (body.secondaryColor != null && !hexColorRegex.test(body.secondaryColor)) {
      return NextResponse.json({ error: "Formato de color secundario inválido" }, { status: 400 });
    }
    if (body.accentColor != null && !hexColorRegex.test(body.accentColor)) {
      return NextResponse.json({ error: "Formato de color de acento inválido" }, { status: 400 });
    }
    
    const updated = await prisma.binder.update({
      where: { id },
      data: {
        ...(body.name != null && { name: body.name }),
        ...(body.isPublic != null && { isPublic: body.isPublic }),
        ...(body.theme != null && { theme: body.theme }),
        ...(body.primaryColor != null && body.primaryColor !== "" && { primaryColor: body.primaryColor }),
        ...(body.secondaryColor != null && body.secondaryColor !== "" && { secondaryColor: body.secondaryColor }),
        ...(body.accentColor != null && body.accentColor !== "" && { accentColor: body.accentColor }),
      },
    });
    
    // Si se actualizó el primaryColor, actualizar también la portada (página 0)
    if (body.primaryColor != null && body.primaryColor !== "") {
      const coverPage = await prisma.binderPage.findFirst({
        where: { binderId: id, pageIndex: 0 },
      });
      if (coverPage) {
        await prisma.binderPage.update({
          where: { id: coverPage.id },
          data: { backgroundValue: body.primaryColor },
        });
      }
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating binder:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar binder" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const binder = await prisma.binder.findFirst({ where: { id, userId: session.user.id } });
  if (!binder) return NextResponse.json({ error: "Binder no encontrado" }, { status: 404 });
  
  try {
    // Obtener todas las páginas del binder
    const pages = await prisma.binderPage.findMany({
      where: { binderId: id },
      select: { id: true },
    });
    
    const pageIds = pages.map((p) => p.id);
    
    // Eliminar decoraciones de todas las páginas
    if (pageIds.length > 0) {
      await prisma.binderDecoration.deleteMany({
        where: { pageId: { in: pageIds } },
      });
    }
    
    // Eliminar slots de todas las páginas
    if (pageIds.length > 0) {
      await prisma.binderSlot.deleteMany({
        where: { pageId: { in: pageIds } },
      });
    }
    
    // Eliminar páginas
    if (pageIds.length > 0) {
      await prisma.binderPage.deleteMany({
        where: { binderId: id },
      });
    }
    
    // Finalmente eliminar el binder
    await prisma.binder.delete({ where: { id } });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting binder:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al eliminar binder" },
      { status: 500 }
    );
  }
}
