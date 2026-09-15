const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const tokenSetting = await prisma.settings.findUnique({ where: { key: 'telegram_bot_token' } });
    console.log("Token exists:", !!tokenSetting?.value);

    // Try setting auth_bg_image manually
    await prisma.settings.upsert({
      where: { key: "auth_bg_image" },
      update: { value: "https://example.com/test.jpg" },
      create: { key: "auth_bg_image", value: "https://example.com/test.jpg" }
    });
    console.log("Upsert successful");
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

test();