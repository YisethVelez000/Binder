import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GroupsView } from "./GroupsView";

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const groups = await prisma.group.findMany({
    include: { members: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });
  return <GroupsView groups={JSON.parse(JSON.stringify(groups))} />;
}
