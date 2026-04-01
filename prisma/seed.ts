import { prisma } from "../lib/prisma";

async function main() {
  // 1. Create the Master Company (or find if exists)
  const company = await prisma.company.upsert({
    where: { name: "Al Saqr Technologies" },
    update: {},
    create: {
      name: "Al Saqr Technologies",
      plan: "ENTERPRISE",
      status: "ACTIVE",
    },
  });

  // 2. Create the Super Admin User (or update if exists)
  await prisma.user.upsert({
    where: { email: "teamaxon2024@gmail.com" },
    update: {
      name: "Rithik",
      role: "SUPER_ADMIN",
      clerkId: "user_3BhxAMTXnbDGnXyRgzG8j0HAhEO",
      companyId: company.id,
    },
    create: {
      email: "teamaxon2024@gmail.com",
      name: "Rithik",
      role: "SUPER_ADMIN",
      clerkId: "user_3BhxAMTXnbDGnXyRgzG8j0HAhEO",
      companyId: company.id,
    },
  });

  console.log("✅ Database Seeded: Super Admin Created!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
