export const dynamic = "force-dynamic";
import { isMaintenanceActive } from "@/lib/maintenance";
import { RegisterClient } from "./RegisterClient";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const active = await isMaintenanceActive();
  if (active) {
    redirect("/maintenance");
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const bgSetting = await prisma.settings.findUnique({
    where: { key: "auth_bg_image" }
  });
  const bgUrl = bgSetting?.value || "/auth-bg.jpg";

  return <RegisterClient bgUrl={bgUrl} />;
}
