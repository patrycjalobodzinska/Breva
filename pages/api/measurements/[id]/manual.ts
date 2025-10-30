import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { manualMeasurementSchema } from "@/lib/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;
    const { leftVolumeMl, rightVolumeMl, note } = manualMeasurementSchema.parse(
      req.body
    );

    const baseline = await prisma.measurement?.findFirst({
      where: {
        id: id as string,
        userId: session.user.id,
      },
    });

    if (!baseline) {
      return res
        .status(404)
        .json({ error: "Pomiar bazowy nie został znaleziony" });
    }

    // Zapisz analizę MANUAL do istniejącego pomiaru
    const manualAnalysis = await prisma.breastAnalysis?.upsert({
      where: {
        // unikalność logiczna: jedna analiza MANUAL na measurement
        // tworzymy sztuczny klucz przez wyszukanie wcześniej, bo Prisma upsert wymaga unique
        id:
          (
            await prisma.breastAnalysis?.findFirst({
              where: { measurementId: id as string, measurementType: "MANUAL" },
            })
          )?.id || "",
      },
      update: {
        leftVolumeMl,
        rightVolumeMl,
      },
      create: {
        measurementId: id as string,
        measurementType: "MANUAL",
        leftVolumeMl,
        rightVolumeMl,
      },
    });

    // Zwróć zaktualizowany pomiar
    const updatedMeasurement = await prisma.measurement?.findFirst({
      where: { id: id as string, userId: session.user.id },
      include: { analyses: true },
    });

    return res.status(201).json(updatedMeasurement);
  } catch (error) {
    console.error("Error creating manual measurement:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas tworzenia pomiaru ręcznego",
    });
  }
}
