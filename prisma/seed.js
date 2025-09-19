import prisma from "./client.js";
import bcrypt from "bcrypt";


async function main() {
  
  console.log("Seeding database...");

  const salt = await bcrypt.genSalt(10);

  const acmeTenant = await prisma.tenant.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Acme Inc", slug: "acme", plan: "FREE" },
  });

  const globexTenant = await prisma.tenant.upsert({
    where: { id: 2 },
    update: {},
    create: { name: "Globex Corp", slug: "globex", plan: "FREE" },
  });

  const users = [
    { email: "admin@acme.test", password: await bcrypt.hash("password", salt), role: "ADMIN", tenantId: acmeTenant.id },
    { email: "user@acme.test", password: await bcrypt.hash("password", salt), role: "MEMBER", tenantId: acmeTenant.id },
    { email: "admin@globex.test", password: await bcrypt.hash("password", salt), role: "ADMIN", tenantId: globexTenant.id },
    { email: "user@globex.test", password: await bcrypt.hash("password", salt), role: "MEMBER", tenantId: globexTenant.id },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
