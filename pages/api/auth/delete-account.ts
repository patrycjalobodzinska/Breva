import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const userEmail = session.user.email;

    // Sprawdź czy użytkownik istnieje
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Weryfikuj hasło
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Usuń wszystkie powiązane dane użytkownika
    await prisma.$transaction(async (tx) => {
      // Usuń wszystkie pomiary użytkownika
      await tx.measurement.deleteMany({
        where: { userId: user.id },
      });

      // Usuń wszystkie pliki użytkownika
      await tx.upload.deleteMany({
        where: { userId: user.id },
      });

      // Usuń użytkownika
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    return res.status(200).json({
      message: "Account deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  } finally {
    await prisma.$disconnect();
  }
}
