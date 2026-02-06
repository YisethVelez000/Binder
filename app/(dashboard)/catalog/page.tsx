import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CatalogView } from "./CatalogView";

export default async function CatalogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Obtener las photocards que el usuario ya tiene
  const userPhotocards = await prisma.photocard.findMany({
    where: { userId: session.user.id },
    select: { catalogId: true },
  });
  const userCatalogIdsArray: string[] = userPhotocards
    .map((p) => p.catalogId)
    .filter((id): id is string => typeof id === "string" && id !== null && id !== undefined);
  const userCatalogIds = new Set<string>(userCatalogIdsArray);

  // Obtener catálogo global y grupos
  const [catalog, groups] = await Promise.all([
    prisma.catalogPhotocard.findMany({
      orderBy: [{ groupName: "asc" }, { albumName: "asc" }, { memberName: "asc" }],
      take: 50,
    }),
    prisma.group.findMany({
      include: { members: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-[var(--text)] mb-6">
        Catálogo de Photocards
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Explora el catálogo global y añade photocards a tu colección. Solo puedes editar las que tú creaste.
      </p>
      <CatalogView 
        catalog={JSON.parse(JSON.stringify(catalog))} 
        userCatalogIds={userCatalogIdsArray}
        userId={session.user.id}
        groups={JSON.parse(JSON.stringify(groups))}
      />
    </div>
  );
}
