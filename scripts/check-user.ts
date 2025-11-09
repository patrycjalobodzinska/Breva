import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function checkUser() {
  const email = process.argv[2] || "admin@breva.com";
  const password = process.argv[3] || "admin123";

  console.log("🔍 Sprawdzanie użytkownika:", email);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ Użytkownik nie istnieje w bazie danych");
      return;
    }

    console.log("✅ Użytkownik znaleziony:", {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password.length,
    });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔐 Weryfikacja hasła:", isPasswordValid ? "✅ POPRAWNE" : "❌ NIEPOPRAWNE");

    if (!isPasswordValid) {
      console.log("\n💡 Spróbuj zaktualizować hasło:");
      const newHashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHashedPassword },
      });
      console.log("✅ Hasło zaktualizowane!");
    }
  } catch (error) {
    console.error("❌ Błąd:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
