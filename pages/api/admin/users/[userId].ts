import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { userId } = req.query;

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId as string },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res
          .status(404)
          .json({ error: "Użytkownik nie został znaleziony" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({
        error: "Wystąpił błąd podczas pobierania użytkownika",
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const targetUserId = userId as string;

      // Sprawdź czy admin nie próbuje usunąć samego siebie
      if (session.user.id === targetUserId) {
        return res.status(400).json({
          error: "Nie możesz usunąć własnego konta",
        });
      }

      // Sprawdź czy użytkownik istnieje
      const userToDelete = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!userToDelete) {
        return res.status(404).json({
          error: "Użytkownik nie został znaleziony",
        });
      }

      // Usuń wszystkie powiązane dane użytkownika
      await prisma.$transaction(async (tx) => {
        // Usuń wszystkie pomiary użytkownika (z automatycznym usunięciem powiązanych danych przez cascade)
        await tx.measurement.deleteMany({
          where: { userId: targetUserId },
        });

        // Usuń wszystkie pliki użytkownika
        await tx.upload.deleteMany({
          where: { userId: targetUserId },
        });

        // Usuń użytkownika
        await tx.user.delete({
          where: { id: targetUserId },
        });
      });

      return res.status(200).json({
        message: "Użytkownik został usunięty pomyślnie",
        success: true,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({
        error: "Wystąpił błąd podczas usuwania użytkownika",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
