import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Añadir una photocard del catálogo a la colección del usuario
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const { catalogId } = body as { catalogId: string };
  if (!catalogId) return NextResponse.json({ error: "catalogId requerido" }, { status: 400 });

  // Verificar que existe en el catálogo
  const catalogItem = await prisma.catalogPhotocard.findUnique({
    where: { id: catalogId },
  });
  if (!catalogItem) {
    return NextResponse.json({ error: "Photocard no encontrada en el catálogo" }, { status: 404 });
  }

  // Verificar que el usuario no la tenga ya
  const existing = await prisma.photocard.findFirst({
    where: {
      userId: session.user.id,
      catalogId,
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya tienes esta photocard en tu colección" }, { status: 400 });
  }

  // Crear copia en la colección del usuario
  const photocard = await prisma.photocard.create({
    data: {
      userId: session.user.id,
      catalogId,
      groupSlug: catalogItem.groupSlug,
      groupName: catalogItem.groupName,
      albumSlug: catalogItem.albumSlug,
      albumName: catalogItem.albumName,
      version: catalogItem.version,
      memberSlug: catalogItem.memberSlug,
      memberName: catalogItem.memberName,
      imageUrl: catalogItem.imageUrl,
      rarity: catalogItem.rarity,
      source: "catalog",
    },
  });
  return NextResponse.json(photocard);
}
