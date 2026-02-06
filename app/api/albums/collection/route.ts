import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Listar álbumes en la colección del usuario
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const collection = await prisma.userAlbumCollection.findMany({
    where: { userId: session.user.id },
    include: {
      album: {
        include: {
          group: true,
          versions: { orderBy: { name: "asc" } },
        },
      },
      version: true,
    },
    orderBy: { createdAt: "desc" },
  });
  
  return NextResponse.json(collection);
}

// Añadir álbum a la colección del usuario
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const body = await request.json();
  const { albumId, versionId, notes } = body;
  
  if (!albumId) {
    return NextResponse.json({ error: "albumId es requerido" }, { status: 400 });
  }
  
  // Verificar que el álbum existe
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) {
    return NextResponse.json({ error: "Álbum no encontrado" }, { status: 404 });
  }
  
  // Si se especifica versión, verificar que existe y pertenece al álbum
  if (versionId) {
    const version = await prisma.albumVersion.findFirst({
      where: { id: versionId, albumId },
    });
    if (!version) {
      return NextResponse.json({ error: "Versión no encontrada o no pertenece al álbum" }, { status: 404 });
    }
  }
  
  // Verificar si ya existe en la colección
  const existing = await prisma.userAlbumCollection.findFirst({
    where: {
      userId: session.user.id,
      albumId,
      versionId: versionId || null,
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Este álbum ya está en tu colección" }, { status: 400 });
  }
  
  const collectionItem = await prisma.userAlbumCollection.create({
    data: {
      userId: session.user.id,
      albumId,
      versionId: versionId || null,
      notes: notes || null,
    },
    include: {
      album: {
        include: {
          group: true,
          versions: true,
        },
      },
      version: true,
    },
  });
  
  return NextResponse.json(collectionItem);
}
