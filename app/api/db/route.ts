import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/db — Comprueba si la base de datos responde.
 * Abre http://localhost:3000/api/db en el navegador para ver el resultado.
 */
export async function GET() {
  try {
    // Para MongoDB, simplemente hacemos una consulta simple en lugar de $queryRaw
    const userCount = await prisma.user.count();
    return NextResponse.json({
      ok: true,
      message: "Conexión a la base de datos correcta",
      userCount,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
