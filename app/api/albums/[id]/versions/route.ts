import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeName } from "@/lib/slug";

// Listar versiones de un álbum
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { id: albumId } = await params;
  const versions = await prisma.albumVersion.findMany({
    where: { albumId },
    orderBy: { name: "asc" },
  });
  
  return NextResponse.json(versions);
}

// Crear versión de álbum
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { id: albumId } = await params;
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) {
    return NextResponse.json({ error: "Álbum no encontrado" }, { status: 404 });
  }
  
  const body = await request.json();
  const { name, imageUrl, color } = body;
  
  if (!name) {
    return NextResponse.json({ error: "name es requerido" }, { status: 400 });
  }
  
  const normalizedName = normalizeName(name);
  const slug = generateSlug(normalizedName);
  
  // Verificar si ya existe
  const existing = await prisma.albumVersion.findFirst({
    where: { albumId, slug },
  });
  if (existing) {
    return NextResponse.json(existing);
  }
  
  const version = await prisma.albumVersion.create({
    data: {
      albumId,
      slug,
      name: normalizedName,
      imageUrl: imageUrl || null,
      color: color || null,
    },
  });
  
  return NextResponse.json(version);
}
