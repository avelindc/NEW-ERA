import { PrismaClient } from "@prisma/client";
import { AdminArtistsClient } from "./AdminArtistsClient";

const prisma = new PrismaClient();

export default async function AdminArtistsPage() {
  const pendingUsers = await prisma.user.findMany({
    where: { role: 'USER', status: 'PENDING' },
    include: { artists: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const approvedUsers = await prisma.user.findMany({
    where: { role: 'USER', status: 'APPROVED' },
    include: { artists: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-10 px-4 sm:px-6 lg:px-8 w-full">
      <AdminArtistsClient pendingUsers={pendingUsers} approvedUsers={approvedUsers} />
    </div>
  );
}
