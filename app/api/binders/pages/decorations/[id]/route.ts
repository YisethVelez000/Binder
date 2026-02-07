import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Actualizar decoración
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const { id } = await params;
    
    // Buscar la decoración con la página y el binder
    const decoration = await prisma.binderDecoration.findUnique({
      where: { id },
      include: { 
        page: { 
          include: { binder: true } 
        } 
      },
    });
    
    if (!decoration) {
      return NextResponse.json({ error: "Decoración no encontrada" }, { status: 404 });
    }
    
    if (decoration.page.binder.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    
    const body = await request.json();
    
    const updated = await prisma.binderDecoration.update({
      where: { id },
      data: {
        ...(body.content != null && { content: body.content }),
        ...(body.positionX != null && { positionX: body.positionX }),
        ...(body.positionY != null && { positionY: body.positionY }),
        ...(body.width != null && { width: body.width }),
        ...(body.height != null && { height: body.height }),
        ...(body.rotation != null && { rotation: body.rotation }),
        ...(body.zIndex != null && { zIndex: body.zIndex }),
        ...(body.shape !== undefined && { shape: body.shape }),
        ...(body.fontSize != null && { fontSize: body.fontSize }),
        ...(body.fontColor != null && { fontColor: body.fontColor }),
        ...(body.fontFamily != null && { fontFamily: body.fontFamily }),
      },
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating decoration:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar decoración" },
      { status: 500 }
    );
  }
}

// Eliminar decoración
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const { id } = await params;
    
    const decoration = await prisma.binderDecoration.findUnique({
      where: { id },
      include: { 
        page: { 
          include: { binder: true } 
        } 
      },
    });
    
    if (!decoration) {
      return NextResponse.json({ error: "Decoración no encontrada" }, { status: 404 });
    }
    
    if (decoration.page.binder.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    
    await prisma.binderDecoration.delete({ where: { id } });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting decoration:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al eliminar decoración" },
      { status: 500 }
    );
  }
}
