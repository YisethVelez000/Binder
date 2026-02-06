import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeName } from "@/lib/slug";

// Listar álbumes (opcionalmente filtrados por grupo)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  
  const albums = await prisma.album.findMany({
    where: groupId ? { groupId } : undefined,
    include: {
      group: true,
      versions: { orderBy: { name: "asc" } },
    },
    orderBy: { name: "asc" },
  });
  
  return NextResponse.json(albums);
}

// Crear álbum
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const body = await request.json();
  const { groupId, name, imageUrl, releaseDate } = body;
  
  if (!groupId || !name) {
    return NextResponse.json({ error: "groupId y name son requeridos" }, { status: 400 });
  }
  
  // Verificar que el grupo existe
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }
  
  const normalizedName = normalizeName(name);
  const slug = generateSlug(normalizedName);
  
  // Verificar si ya existe
  const existing = await prisma.album.findFirst({
    where: { groupId, slug },
  });
  if (existing) {
    return NextResponse.json(existing);
  }
  
  const album = await prisma.album.create({
    data: {
      groupId,
      slug,
      name: normalizedName,
      imageUrl: imageUrl || null,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      addedBy: session.user.id,
    },
    include: {
      group: true,
      versions: true,
    },
  });
  
  return NextResponse.json(album);
}
