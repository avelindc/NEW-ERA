const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.settings.findUnique({where: {key: 'telegram_bot_token'}})
  .then(async r => {
    if (r) {
      const res = await fetch('https://api.telegram.org/bot' + r.value + '/setWebhook?url=https://breakoutmusicrecord.com/api/telegram/webhook');
      const data = await res.json();
      console.log(data);
    }
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());