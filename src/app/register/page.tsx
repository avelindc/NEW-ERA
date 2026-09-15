export const dynamic = "force-dynamic";
import { isMaintenanceActive } from "@/lib/maintenance";
import { RegisterClient } from "./RegisterClient";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function RegisterPage() {
  const active = await isMaintenanceActive();
  if (active) {
    redirect("/maintenance");
  }

  const bgSetting = await prisma.settings.findUnique({
    where: { key: "auth_bg_image" }
  });
  const bgUrl = bgSetting?.value || "/auth-bg.jpg";

  return <RegisterClient bgUrl={bgUrl} />;
}
