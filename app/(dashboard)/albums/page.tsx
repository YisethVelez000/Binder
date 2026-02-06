import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AlbumsView } from "./AlbumsView";

export default async function AlbumsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  
  const [groups, albums] = await Promise.all([
    prisma.group.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.album.findMany({
      include: {
        group: true,
        versions: { orderBy: { name: "asc" } },
      },
      orderBy: [{ group: { name: "asc" } }, { name: "asc" }],
    }),
  ]);
  
  return (
    <AlbumsView
      groups={JSON.parse(JSON.stringify(groups))}
      albums={JSON.parse(JSON.stringify(albums))}
    />
  );
}
