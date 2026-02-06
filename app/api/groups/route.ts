import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeName } from "@/lib/slug";

// Listar grupos
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const groups = await prisma.group.findMany({
    include: { members: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(groups);
}

// Crear grupo
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const { name, imageUrl } = body;
  if (!name) return NextResponse.json({ error: "name es requerido" }, { status: 400 });

  const normalizedName = normalizeName(name);
  const slug = generateSlug(normalizedName);

  // Verificar si ya existe
  const existing = await prisma.group.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(existing);
  }

  const group = await prisma.group.create({
    data: {
      slug,
      name: normalizedName,
      imageUrl: imageUrl || null,
      addedBy: session.user.id,
    },
    include: { members: true },
  });
  return NextResponse.json(group);
}
