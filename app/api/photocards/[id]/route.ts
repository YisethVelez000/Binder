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
  const card = await prisma.photocard.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!card) return NextResponse.json({ error: "Photocard no encontrada" }, { status: 404 });
  return NextResponse.json(card);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const card = await prisma.photocard.findFirst({ where: { id, userId: session.user.id } });
  if (!card) return NextResponse.json({ error: "Photocard no encontrada" }, { status: 404 });
  const body = await request.json();
  
  // Si la photocard está en el catálogo global, verificar permisos
  if (card.catalogId) {
    const catalogItem = await prisma.catalogPhotocard.findUnique({
      where: { id: card.catalogId },
    });
    if (catalogItem && catalogItem.addedBy !== session.user.id) {
      // No es el creador, no puede editar
      return NextResponse.json(
        { error: "Esta photocard está en el catálogo global. Solo el creador puede editarla. Edítala desde el catálogo si eres el creador." },
        { status: 403 }
      );
    }
    // Si es el creador, editar el catálogo global (esto actualizará todas las copias)
    if (catalogItem && catalogItem.addedBy === session.user.id) {
      const normalizedGroupName = body.groupName ? normalizeName(body.groupName) : catalogItem.groupName;
      const normalizedAlbumName = body.albumName ? normalizeName(body.albumName) : catalogItem.albumName;
      const normalizedMemberName = body.memberName ? normalizeName(body.memberName) : catalogItem.memberName;
      const groupSlug = body.groupName ? generateSlug(normalizedGroupName) : catalogItem.groupSlug;
      const albumSlug = body.albumName ? generateSlug(normalizedAlbumName) : catalogItem.albumSlug;
      const memberSlug = body.memberName ? generateSlug(normalizedMemberName) : catalogItem.memberSlug;

      // Normalizar versión: si viene como cadena vacía, null o undefined, establecer a null
      const versionValue = body.hasOwnProperty('version') 
        ? (body.version === "" || body.version === null || body.version === undefined ? null : body.version)
        : catalogItem.version;

      // Actualizar el catálogo global
      const updatedCatalog = await prisma.catalogPhotocard.update({
        where: { id: card.catalogId },
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
        where: { catalogId: card.catalogId },
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

      // Devolver la photocard actualizada del usuario
      const updatedCard = await prisma.photocard.findUnique({ where: { id } });
      return NextResponse.json(updatedCard);
    }
  }

  // Photocard personal (no está en catálogo o el usuario es el creador pero editando directamente)
  const normalizedGroupName = body.groupName ? normalizeName(body.groupName) : card.groupName;
  const normalizedAlbumName = body.albumName ? normalizeName(body.albumName) : card.albumName;
  const normalizedMemberName = body.memberName ? normalizeName(body.memberName) : card.memberName;
  const groupSlug = body.groupName ? generateSlug(normalizedGroupName) : card.groupSlug;
  const albumSlug = body.albumName ? generateSlug(normalizedAlbumName) : card.albumSlug;
  const memberSlug = body.memberName ? generateSlug(normalizedMemberName) : card.memberSlug;

  let catalogId: string | null = card.catalogId;

  // Si se solicita añadir al catálogo y aún no está
  if (body.addToCatalog && !card.catalogId) {
    const existingCatalog = await prisma.catalogPhotocard.findFirst({
      where: {
        groupSlug,
        albumSlug,
        memberSlug,
        version: (body.version || card.version) || null,
      },
    });
    if (existingCatalog) {
      catalogId = existingCatalog.id;
    } else {
      const catalogItem = await prisma.catalogPhotocard.create({
        data: {
          groupSlug,
          groupName: normalizedGroupName,
          albumSlug,
          albumName: normalizedAlbumName,
          version: (body.version || card.version) || null,
          memberSlug,
          memberName: normalizedMemberName,
          imageUrl: body.imageUrl || card.imageUrl,
          rarity: body.rarity || card.rarity,
          addedBy: session.user.id,
        },
      });
      catalogId = catalogItem.id;
    }
  }

  // Normalizar versión: si viene como cadena vacía, null o undefined, establecer a null
  const versionValue = body.hasOwnProperty('version') 
    ? (body.version === "" || body.version === null || body.version === undefined ? null : body.version)
    : card.version;

  const updated = await prisma.photocard.update({
    where: { id },
    data: {
      ...(body.groupName != null && { groupSlug, groupName: normalizedGroupName }),
      ...(body.albumName != null && { albumSlug, albumName: normalizedAlbumName }),
      ...(body.memberName != null && { memberSlug, memberName: normalizedMemberName }),
      ...(body.hasOwnProperty('version') && { version: versionValue }),
      ...(body.imageUrl != null && { imageUrl: body.imageUrl }),
      ...(body.rarity != null && { rarity: body.rarity }),
      ...(catalogId !== card.catalogId && { catalogId }),
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
  const card = await prisma.photocard.findFirst({ where: { id, userId: session.user.id } });
  if (!card) return NextResponse.json({ error: "Photocard no encontrada" }, { status: 404 });
  await prisma.photocard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
