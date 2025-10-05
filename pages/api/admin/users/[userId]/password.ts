import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId } = req.query;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Hasło musi mieć co najmniej 6 znaków" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId as string },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Użytkownik nie został znaleziony" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId as string },
      data: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ message: "Hasło zostało zmienione pomyślnie" });
  } catch (error) {
    console.error("Error changing user password:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas zmiany hasła",
    });
  }
}
