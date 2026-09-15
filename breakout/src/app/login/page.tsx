import { PrismaClient } from "@prisma/client";
import LoginClient from "./LoginClient";

const prisma = new PrismaClient();

export default async function LoginPage() {
  const bgSetting = await prisma.settings.findUnique({
    where: { key: "auth_bg_image" }
  });
  
  const bgUrl = bgSetting?.value || "/auth-bg.jpg";

  return <LoginClient bgUrl={bgUrl} />;
}