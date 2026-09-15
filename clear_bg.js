const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.settings.delete({where: {key: 'auth_bg_image'}})
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());