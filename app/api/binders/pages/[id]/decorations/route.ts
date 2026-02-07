import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Listar decoraciones de una página
export async function GET(
  _request: Request,
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
  
  const decorations = await prisma.binderDecoration.findMany({
    where: { pageId },
    orderBy: { zIndex: "asc" },
  });
  
  return NextResponse.json(decorations);
}

// Crear o actualizar decoración
export async function POST(
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
  const { type, content, positionX, positionY, width, height, rotation, zIndex, shape, fontSize, fontColor, fontFamily } = body;
  
  if (!type || !content) {
    return NextResponse.json({ error: "type y content son requeridos" }, { status: 400 });
  }
  
  const decoration = await prisma.binderDecoration.create({
    data: {
      pageId,
      type,
      content,
      positionX: positionX || 0,
      positionY: positionY || 0,
      width: width || null,
      height: height || null,
      rotation: rotation || 0,
      zIndex: zIndex || 0,
      shape: shape || null,
      fontSize: fontSize || null,
      fontColor: fontColor || null,
      fontFamily: fontFamily || null,
    },
  });
  
  return NextResponse.json(decoration);
}
