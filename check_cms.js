const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.settings.findUnique({where:{key:'LANDING_PAGE_CMS'}})
  .then(r => console.log(r?.value.substring(0, 500)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());