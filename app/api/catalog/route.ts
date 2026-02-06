import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeName } from "@/lib/slug";

// Listar catálogo global (búsqueda)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group");
  const member = searchParams.get("member");
  const album = searchParams.get("album");
  const search = searchParams.get("search");

  const where: any = {};
  if (group) where.groupSlug = group;
  if (member) where.memberSlug = member;
  if (album) where.albumSlug = album;

  let catalog = await prisma.catalogPhotocard.findMany({
    where,
    orderBy: [{ groupName: "asc" }, { albumName: "asc" }, { memberName: "asc" }],
    take: 200, // Más resultados para filtrar en cliente si hay búsqueda
  });

  // Filtrar por búsqueda en el cliente (MongoDB no tiene contains fácil)
  if (search) {
    const searchLower = search.toLowerCase();
    catalog = catalog.filter(
      (item) =>
        item.groupName.toLowerCase().includes(searchLower) ||
        item.albumName.toLowerCase().includes(searchLower) ||
        item.memberName.toLowerCase().includes(searchLower)
    );
  }

  return NextResponse.json(catalog.slice(0, 100));
}

// Añadir photocard al catálogo global (cualquier usuario puede añadir)
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
  } = body;
  if (!groupName || !albumName || !memberName) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: groupName, albumName, memberName" },
      { status: 400 }
    );
  }

  // Normalizar nombres y generar slugs
  const normalizedGroupName = normalizeName(groupName);
  const normalizedAlbumName = normalizeName(albumName);
  const normalizedMemberName = normalizeName(memberName);
  const groupSlug = generateSlug(normalizedGroupName);
  const albumSlug = generateSlug(normalizedAlbumName);
  const memberSlug = generateSlug(normalizedMemberName);

  // Buscar si ya existe en el catálogo
  const existing = await prisma.catalogPhotocard.findFirst({
    where: {
      groupSlug,
      albumSlug,
      memberSlug,
      version: version || null,
    },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  // Crear nueva entrada en el catálogo
  const catalogItem = await prisma.catalogPhotocard.create({
    data: {
      groupSlug,
      groupName: normalizedGroupName,
      albumSlug,
      albumName: normalizedAlbumName,
      version: version || null,
      memberSlug,
      memberName: normalizedMemberName,
      imageUrl: imageUrl || "/placeholder-card.png",
      rarity: rarity || "common",
      addedBy: session.user.id,
    },
  });
  return NextResponse.json(catalogItem);
}
