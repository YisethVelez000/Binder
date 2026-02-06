import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeName } from "@/lib/slug";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const item = await prisma.catalogPhotocard.findUnique({
    where: { id },
  });
  if (!item) return NextResponse.json({ error: "Photocard del catálogo no encontrada" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const catalogItem = await prisma.catalogPhotocard.findUnique({
    where: { id },
  });
  if (!catalogItem) {
    return NextResponse.json({ error: "Photocard del catálogo no encontrada" }, { status: 404 });
  }

  // Solo el creador puede editar
  if (catalogItem.addedBy !== session.user.id) {
    return NextResponse.json(
      { error: "Solo el creador puede editar esta photocard del catálogo" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const normalizedGroupName = body.groupName ? normalizeName(body.groupName) : catalogItem.groupName;
  const normalizedAlbumName = body.albumName ? normalizeName(body.albumName) : catalogItem.albumName;
  const normalizedMemberName = body.memberName ? normalizeName(body.memberName) : catalogItem.memberName;
  
  // Generar slugs desde los nombres normalizados
  const groupSlug = body.groupName ? generateSlug(normalizedGroupName) : catalogItem.groupSlug;
  const albumSlug = body.albumName ? generateSlug(normalizedAlbumName) : catalogItem.albumSlug;
  const memberSlug = body.memberName ? generateSlug(normalizedMemberName) : catalogItem.memberSlug;

  // Normalizar versión: si viene como cadena vacía, null o undefined, establecer a null
  const versionValue = body.hasOwnProperty('version') 
    ? (body.version === "" || body.version === null || body.version === undefined ? null : body.version)
    : catalogItem.version;

  // Actualizar el catálogo global
  const updatedCatalog = await prisma.catalogPhotocard.update({
    where: { id },
    data: {
      ...(body.groupName != null && { groupSlug, groupName: normalizedGroupName }),
      ...(body.albumName != null && { albumSlug, albumName: normalizedAlbumName }),
      ...(body.memberName != null && { memberSlug, memberName: normalizedMemberName }),
      ...(body.hasOwnProperty('version') && { version: versionValue }),
      ...(body.imageUrl != null && { imageUrl: body.imageUrl }),
      ...(body.rarity != null && { rarity: body.rarity }),
    },
  });

  // Actualizar TODAS las photocards de usuarios que tienen esta photocard del catálogo
  await prisma.photocard.updateMany({
    where: { catalogId: id },
    data: {
      groupSlug: updatedCatalog.groupSlug,
      groupName: updatedCatalog.groupName,
      albumSlug: updatedCatalog.albumSlug,
      albumName: updatedCatalog.albumName,
      memberSlug: updatedCatalog.memberSlug,
      memberName: updatedCatalog.memberName,
      version: updatedCatalog.version,
      imageUrl: updatedCatalog.imageUrl,
      rarity: updatedCatalog.rarity,
    },
  });

  return NextResponse.json(updatedCatalog);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const catalogItem = await prisma.catalogPhotocard.findUnique({
    where: { id },
  });
  if (!catalogItem) {
    return NextResponse.json({ error: "Photocard del catálogo no encontrada" }, { status: 404 });
  }

  // Solo el creador puede eliminar
  if (catalogItem.addedBy !== session.user.id) {
    return NextResponse.json(
      { error: "Solo el creador puede eliminar esta photocard del catálogo" },
      { status: 403 }
    );
  }

  // Eliminar referencias en photocards de usuarios (poner catalogId a null)
  await prisma.photocard.updateMany({
    where: { catalogId: id },
    data: { catalogId: null },
  });

  // Eliminar del catálogo
  await prisma.catalogPhotocard.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
