const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.settings.findUnique({where:{key:'LANDING_PAGE_CMS'}})
  .then(r => console.log(JSON.parse(r.value).contact))
  .catch(console.error)
  .finally(() => prisma.$disconnect());