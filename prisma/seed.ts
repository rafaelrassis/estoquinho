import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_EMAIL ?? "dono@estoquinho.local";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: "Dono da Loja", email },
  });

  await prisma.product.upsert({
    where: { userId_sku: { userId: user.id, sku: "DEMO-001" } },
    update: {},
    create: {
      userId: user.id,
      name: "Produto de teste",
      sku: "DEMO-001",
      costCents: 1000,
      priceCents: 2500,
      stockQty: 10,
      lowStockAt: 3,
    },
  });

  console.log(`Seed ok -> ${email} (login via Google com esse e-mail)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
