import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Czyszczenie bazy danych...");

  // Usuń wszystkie dane w odpowiedniej kolejności (zgodnie z relacjami)
  await prisma.breastAnalysis.deleteMany({});
  await prisma.lidarCapture.deleteMany({});
  await prisma.measurement.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✅ Baza danych wyczyszczona");

  console.log("🌱 Rozpoczynam seedowanie tylko admina...");

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@breva.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  console.log(`📧 Tworzenie użytkownika admin: ${adminEmail}`);

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Administrator",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user utworzony:", {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
  console.log(`🔑 Hasło: ${adminPassword}`);

  console.log("✅ Seedowanie zakończone pomyślnie!");
}

main()
  .catch((e) => {
    console.error("❌ Błąd podczas czyszczenia/seedowania:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
