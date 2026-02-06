import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeName } from "@/lib/slug";

// Añadir miembro a un grupo
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id: groupId } = await params;
  const body = await request.json();
  const { name, imageUrl } = body;
  if (!name) return NextResponse.json({ error: "name es requerido" }, { status: 400 });

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });

  const normalizedName = normalizeName(name);
  const slug = generateSlug(normalizedName);

  // Verificar si ya existe
  const existing = await prisma.member.findFirst({
    where: { groupId, slug },
  });
  if (existing) {
    return NextResponse.json(existing);
  }

  const member = await prisma.member.create({
    data: {
      groupId,
      slug,
      name: normalizedName,
      imageUrl: imageUrl || null,
    },
  });
  return NextResponse.json(member);
}
