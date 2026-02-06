import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeName } from "@/lib/slug";

// Actualizar versión
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { id } = await params;
  const version = await prisma.albumVersion.findUnique({
    where: { id },
    include: { album: true },
  });
  if (!version) {
    return NextResponse.json({ error: "Versión no encontrada" }, { status: 404 });
  }
  
  const body = await request.json();
  const normalizedName = body.name ? normalizeName(body.name) : version.name;
  const slug = body.name ? generateSlug(normalizedName) : version.slug;
  
  const updated = await prisma.albumVersion.update({
    where: { id },
    data: {
      ...(body.name != null && { slug, name: normalizedName }),
      ...(body.imageUrl != null && { imageUrl: body.imageUrl }),
      ...(body.color != null && { color: body.color }),
    },
  });
  
  return NextResponse.json(updated);
}

// Eliminar versión
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { id } = await params;
  const version = await prisma.albumVersion.findUnique({ where: { id } });
  if (!version) {
    return NextResponse.json({ error: "Versión no encontrada" }, { status: 404 });
  }
  
  // Eliminar colecciones de usuarios que tienen esta versión
  await prisma.userAlbumCollection.deleteMany({ where: { versionId: id } });
  await prisma.albumVersion.delete({ where: { id } });
  
  return NextResponse.json({ ok: true });
}
