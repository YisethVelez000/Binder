import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeName } from "@/lib/slug";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const { catalogId, groupName, albumName, memberName, imageUrl, notes, priority, addToCatalog = false } = body;
  
  let catalogItemId: string | null = catalogId || null;
  
  // Si viene catalogId, usar esa photocard del catálogo
  if (catalogId) {
    const catalogItem = await prisma.catalogPhotocard.findUnique({
      where: { id: catalogId },
    });
    if (!catalogItem) {
      return NextResponse.json({ error: "Photocard del catálogo no encontrada" }, { status: 404 });
    }
    // Usar datos del catálogo
    const item = await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        catalogId: catalogItem.id,
        groupSlug: catalogItem.groupSlug,
        groupName: catalogItem.groupName,
        albumSlug: catalogItem.albumSlug,
        albumName: catalogItem.albumName,
        memberSlug: catalogItem.memberSlug,
        memberName: catalogItem.memberName,
        imageUrl: catalogItem.imageUrl,
        notes: notes || null,
        priority: priority ?? 0,
      },
    });
    return NextResponse.json(item);
  }
  
  // Crear nueva entrada manual
  if (!groupName || !memberName) {
    return NextResponse.json({ error: "groupName y memberName son requeridos" }, { status: 400 });
  }
  
  // Normalizar nombres y generar slugs
  const normalizedGroupName = normalizeName(groupName);
  const normalizedAlbumName = albumName ? normalizeName(albumName) : null;
  const normalizedMemberName = normalizeName(memberName);
  const groupSlug = generateSlug(normalizedGroupName);
  const albumSlug = normalizedAlbumName ? generateSlug(normalizedAlbumName) : "";
  const memberSlug = generateSlug(normalizedMemberName);
  
  // Si se solicita añadir al catálogo automáticamente
  if (addToCatalog) {
    const existingCatalog = await prisma.catalogPhotocard.findFirst({
      where: {
        groupSlug,
        albumSlug,
        memberSlug,
        version: null,
      },
    });
    if (existingCatalog) {
      catalogItemId = existingCatalog.id;
    } else {
      const catalogItem = await prisma.catalogPhotocard.create({
        data: {
          groupSlug,
          groupName: normalizedGroupName,
          albumSlug,
          albumName: normalizedAlbumName || "",
          version: null,
          memberSlug,
          memberName: normalizedMemberName,
          imageUrl: imageUrl || "/placeholder-card.png",
          rarity: "common",
          addedBy: session.user.id,
        },
      });
      catalogItemId = catalogItem.id;
    }
  }
  
  const item = await prisma.wishlistItem.create({
    data: {
      userId: session.user.id,
      catalogId: catalogItemId,
      groupSlug,
      groupName: normalizedGroupName,
      albumSlug,
      albumName: normalizedAlbumName,
      memberSlug,
      memberName: normalizedMemberName,
      imageUrl: imageUrl || null,
      notes: notes || null,
      priority: priority ?? 0,
    },
  });
  return NextResponse.json(item);
}
