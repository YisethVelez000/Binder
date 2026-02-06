import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeName } from "@/lib/slug";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group");
  const member = searchParams.get("member");
  const album = searchParams.get("album");
  const photocards = await prisma.photocard.findMany({
    where: {
      userId: session.user.id,
      ...(group && { groupSlug: group }),
      ...(member && { memberSlug: member }),
      ...(album && { albumSlug: album }),
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(photocards);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const {
    groupName,
    albumName,
    version,
    memberName,
    imageUrl,
    rarity,
    addToCatalog = false,
  } = body;
  if (!groupName || !albumName || !memberName) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: groupName, albumName, memberName" },
      { status: 400 }
    );
  }

  // Normalizar nombres a mayúsculas y generar slugs
  const normalizedGroupName = normalizeName(groupName);
  const normalizedAlbumName = normalizeName(albumName);
  const normalizedMemberName = normalizeName(memberName);
  const groupSlug = generateSlug(normalizedGroupName);
  const albumSlug = generateSlug(normalizedAlbumName);
  const memberSlug = generateSlug(normalizedMemberName);

  let catalogId: string | null = null;

  // Si se solicita, añadir al catálogo global (pero NO añadir automáticamente a la colección)
  if (addToCatalog) {
    const existingCatalog = await prisma.catalogPhotocard.findFirst({
      where: {
        groupSlug,
        albumSlug,
        memberSlug,
        version: version || null,
      },
    });
    if (existingCatalog) {
      catalogId = existingCatalog.id;
    } else {
      const catalogItem = await prisma.catalogPhotocard.create({
        data: {
          groupSlug,
          groupName,
          albumSlug,
          albumName,
          version: version || null,
          memberSlug,
          memberName,
          imageUrl: imageUrl || "/placeholder-card.png",
          rarity: rarity || "common",
          addedBy: session.user.id,
        },
      });
      catalogId = catalogItem.id;
    }
    // NO crear automáticamente en la colección del usuario
    // El usuario debe añadirla manualmente desde el catálogo
    return NextResponse.json({ 
      message: "Photocard añadida al catálogo global. Añádela a tu colección desde el catálogo.",
      catalogId 
    });
  }

  // Crear solo en la colección personal (sin catálogo)
  const photocard = await prisma.photocard.create({
    data: {
      userId: session.user.id,
      catalogId: null, // No está en el catálogo global
      groupSlug,
      groupName: normalizedGroupName,
      albumSlug,
      albumName: normalizedAlbumName,
      version: version ?? null,
      memberSlug,
      memberName: normalizedMemberName,
      imageUrl: imageUrl || "/placeholder-card.png",
      rarity: rarity || "common",
      source: "manual",
    },
  });
  return NextResponse.json(photocard);
}
