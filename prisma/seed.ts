import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const adminData: Prisma.AdminCreateInput[] = [
  {
    name: "Jahidul Islam",
    username: "jahidul",
    password:
      "w0QzkqGWAHqz4YHu8V1swMCAakkEYWf+o1ERtByFaj6x9/ZYEItT6bq/GLW8gh+KEq1RPmgNeeAA6pyiCb6iZw==",
    roles: ["superadmin"],
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const a of adminData) {
    const admin = await prisma.admin.create({
      data: a,
    });
    console.log(`Created admin with id: ${admin.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
