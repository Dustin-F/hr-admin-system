import { PrismaClient } from "../generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed start");

  const passwordHash = await hash("TestPass1234", 10);

  const employee = await prisma.employee.upsert({
    where: { email: "hradmin@test.com" },
    update: {},
    create: {
      firstName: "HR",
      lastName: "Admin",
      phone: "0000000000",
      email: "hradmin@test.com",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "hradmin@test.com" },
    update: {},
    create: {
      email: "hradmin@test.com",
      passwordHash,
      role: "HR_ADMIN",
      employeeId: employee.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });