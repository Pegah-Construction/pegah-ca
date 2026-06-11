import { PrismaClient } from "@prisma/client";
import { generatePassword, hashPassword } from "../lib/password";

const db = new PrismaClient();

async function main() {
  // Wipe all existing data (children before parents).
  await db.cardSubtask.deleteMany();
  await db.cardComment.deleteMany();
  await db.card.deleteMany();
  await db.activity.deleteMany();
  await db.article.deleteMany();
  await db.doc.deleteMany();
  await db.incident.deleteMany();
  await db.task.deleteMany();
  await db.milestone.deleteMany();
  await db.projectTeam.deleteMany();
  await db.tender.deleteMany();
  await db.project.deleteMany();
  await db.client.deleteMany();
  await db.user.deleteMany();

  // Single admin user.
  const admin = { id: "u1", name: "Admin", role: "admin", title: "Administrator", email: "admin@pegah.ca", phone: "", status: "Active", since: new Date().getFullYear().toString() };
  const password = hashPassword(generatePassword(admin.name, admin.email));
  await db.user.create({ data: { ...admin, password } });

  console.log("✓ Database seeded with one admin user");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
