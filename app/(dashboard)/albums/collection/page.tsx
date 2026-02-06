import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AlbumCollectionView } from "./AlbumCollectionView";

export default async function AlbumCollectionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  
  const [collection, albums] = await Promise.all([
    prisma.userAlbumCollection.findMany({
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
    }),
    prisma.album.findMany({
      include: {
        group: true,
        versions: { orderBy: { name: "asc" } },
      },
      orderBy: [{ group: { name: "asc" } }, { name: "asc" }],
    }),
  ]);
  
  const userAlbumIds = new Set(collection.map((c) => c.albumId));
  
  return (
    <AlbumCollectionView
      collection={JSON.parse(JSON.stringify(collection))}
      availableAlbums={JSON.parse(JSON.stringify(albums))}
      userAlbumIds={Array.from(userAlbumIds)}
    />
  );
}
