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

    const isAdmin = session.user.role === "ADMIN";

    const baseline = await prisma.measurement?.findFirst({
      where: {
        id: id as string,
        ...(isAdmin ? {} : { userId: session.user.id }),
      },
    });

    if (!baseline) {
      return res
        .status(404)
        .json({ error: "Pomiar bazowy nie został znaleziony" });
    }

    // Find or create manual analysis for this measurement
    const existingManualAnalysis = await prisma.breastAnalysis?.findUnique({
      where: { manualMeasurementId: id as string },
    });

    let manualAnalysis;
    if (existingManualAnalysis) {
      manualAnalysis = await prisma.breastAnalysis?.update({
        where: { id: existingManualAnalysis.id },
        data: {
          leftVolumeMl,
          rightVolumeMl,
        },
      });
    } else {
      manualAnalysis = await prisma.breastAnalysis?.create({
        data: {
          manualMeasurementId: id as string,
          leftVolumeMl,
          rightVolumeMl,
        },
      });
    }

    // Update the measurement's note if provided
    if (note !== undefined) {
      await prisma.measurement?.update({
        where: { id: id as string },
        data: { note },
      });
    }

    // Return the updated measurement with its analyses
    const updatedMeasurement = await prisma.measurement?.findUnique({
      where: { id: id as string },
      include: {
        aiAnalysis: true,
        manualAnalysis: true,
      },
    });

    return res.status(200).json(updatedMeasurement);
  } catch (error) {
    console.error("Error creating manual measurement:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas tworzenia pomiaru ręcznego",
    });
  }
}
