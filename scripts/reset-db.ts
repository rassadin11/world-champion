// Полная очистка таблиц (сброс seed-данных перед реальным синком).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Порядок важен из-за внешних ключей: сначала зависимые.
  const s = await prisma.standing.deleteMany();
  const m = await prisma.match.deleteMany();
  const t = await prisma.team.deleteMany();
  console.log(`Очищено: standings=${s.count}, matches=${m.count}, teams=${t.count}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
