const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient();
} catch (e) {
  console.error('Prisma init error:', e);
  process.exit(1);
}

module.exports = prisma;