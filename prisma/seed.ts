import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const adminData: Prisma.AdminCreateInput[] = [
  {
    name: "Jahidul Islam",
    username: "superadmin",
    password: "123456",
    roles: ["superadmin"],
  },
  {
    name: "Jahidul Islam",
    username: "admin",
    password: "123456",
    roles: ["admin"],
  },
];

const userData = [
  {
    name: "John Doe",
    username: "johndoe",
    password: "123456",
  },
  {
    name: "Leo Zayn",
    username: "leozayn",
    password: "123456",
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

  for (const a of userData) {
    const user = await prisma.user.create({
      data: a,
    });
    console.log(`Created user with id: ${user.id}`);
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
