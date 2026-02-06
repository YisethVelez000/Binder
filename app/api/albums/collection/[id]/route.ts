import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Actualizar item de colección
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { id } = await params;
  const item = await prisma.userAlbumCollection.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!item) {
    return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
  }
  
  const body = await request.json();
  
  // Si se cambia la versión, verificar que existe y pertenece al álbum
  if (body.versionId !== undefined) {
    if (body.versionId) {
      const version = await prisma.albumVersion.findFirst({
        where: { id: body.versionId, albumId: item.albumId },
      });
      if (!version) {
        return NextResponse.json({ error: "Versión no encontrada o no pertenece al álbum" }, { status: 404 });
      }
    }
  }
  
  const updated = await prisma.userAlbumCollection.update({
    where: { id },
    data: {
      ...(body.versionId !== undefined && { versionId: body.versionId || null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
    },
    include: {
      album: {
        include: {
          group: true,
          versions: true,
        },
      },
      version: true,
    },
  });
  
  return NextResponse.json(updated);
}

// Eliminar item de colección
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { id } = await params;
  const item = await prisma.userAlbumCollection.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!item) {
    return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
  }
  
  await prisma.userAlbumCollection.delete({ where: { id } });
  
  return NextResponse.json({ ok: true });
}
