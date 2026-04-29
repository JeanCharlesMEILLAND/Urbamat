import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const rows = await p.pageContent.findMany({ where: { page: 'home' } });
console.log(JSON.stringify(rows, null, 2));
await p.$disconnect();
