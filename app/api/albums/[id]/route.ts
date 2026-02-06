import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeName } from "@/lib/slug";

// Obtener álbum específico
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { id } = await params;
  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      group: true,
      versions: { orderBy: { name: "asc" } },
    },
  });
  
  if (!album) {
    return NextResponse.json({ error: "Álbum no encontrado" }, { status: 404 });
  }
  
  return NextResponse.json(album);
}

// Actualizar álbum
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { id } = await params;
  const album = await prisma.album.findUnique({ where: { id } });
  if (!album) {
    return NextResponse.json({ error: "Álbum no encontrado" }, { status: 404 });
  }
  
  const body = await request.json();
  const normalizedName = body.name ? normalizeName(body.name) : album.name;
  const slug = body.name ? generateSlug(normalizedName) : album.slug;
  
  const updated = await prisma.album.update({
    where: { id },
    data: {
      ...(body.name != null && { slug, name: normalizedName }),
      ...(body.imageUrl != null && { imageUrl: body.imageUrl }),
      ...(body.releaseDate != null && { releaseDate: body.releaseDate ? new Date(body.releaseDate) : null }),
    },
    include: {
      group: true,
      versions: { orderBy: { name: "asc" } },
    },
  });
  
  return NextResponse.json(updated);
}

// Eliminar álbum
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const { id } = await params;
  const album = await prisma.album.findUnique({ where: { id } });
  if (!album) {
    return NextResponse.json({ error: "Álbum no encontrado" }, { status: 404 });
  }
  
  // Eliminar versiones y colecciones de usuarios primero
  await prisma.userAlbumCollection.deleteMany({ where: { albumId: id } });
  await prisma.albumVersion.deleteMany({ where: { albumId: id } });
  await prisma.album.delete({ where: { id } });
  
  return NextResponse.json({ ok: true });
}
