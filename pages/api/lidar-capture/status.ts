import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { measurementId, side } = req.query;

    if (!measurementId || !side) {
      return res
        .status(400)
        .json({ error: "Measurement ID and side are required" });
    }

    // Pobierz status LiDAR capture
    const lidarCapture = await prisma.lidarCapture?.findFirst({
      where: {
        measurementId: measurementId as string,
        side: (side as string).toUpperCase(),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!lidarCapture) {
      return res.status(404).json({ error: "LiDAR capture not found" });
    }

    // Sprawdź czy pomiar należy do użytkownika
    const measurement = await prisma.measurement?.findFirst({
      where: {
        id: measurementId as string,
        userId: session.user.id,
      },
    });

    if (!measurement) {
      return res.status(404).json({ error: "Measurement not found" });
    }

    // Jeśli status jest PENDING, sprawdź aktualny status w Python API
    if (lidarCapture.status === "PENDING") {
      try {
        const backendUrl = process.env.BACKEND_URL || 'https://breva-ai-dvf4dcgrcag9fvff.polandcentral-01.azurewebsites.net';

        console.log(`📡 Sprawdzanie statusu w Python API: requestId=${lidarCapture.requestId}`);

        const pythonResponse = await fetch(
          `${backendUrl}/volume-estimation/${lidarCapture.requestId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        console.log(`📡 Python Status Response Status:`, pythonResponse.status);
        console.log(`📡 Python Status Response Headers:`, Object.fromEntries(pythonResponse.headers.entries()));

        if (pythonResponse.ok) {
          const pythonData = await pythonResponse.json();
          console.log(`✅ Python API response:`, JSON.stringify(pythonData, null, 2));
          console.log(`✅ Python API response - request_id:`, pythonData.request_id);
          console.log(`✅ Python API response - status:`, pythonData.status);
          console.log(`✅ Python API response - estimated_volume:`, pythonData.estimated_volume);

          // Zaktualizuj status w bazie jeśli się zmienił
          if (pythonData.status === "completed" && pythonData.estimated_volume) {
            // Python API zwraca objętość w mm³, konwertujemy na ml (dzielenie przez 1000)
            const estimatedVolumeMl = pythonData.estimated_volume / 1000;

            await prisma.lidarCapture?.update({
              where: { id: lidarCapture.id },
              data: {
                status: "COMPLETED",
                estimatedVolume: estimatedVolumeMl,
                updatedAt: new Date(),
              },
            });

            // Zapisz wynik do analizy AI (estimatedVolumeMl już w ml)
            const sideKey = (side as string).toLowerCase();
            const aiAnalysis = await prisma.breastAnalysis?.findUnique({
              where: { aiMeasurementId: measurementId as string },
            });

            const updateData: any = {};
            updateData[`${sideKey}VolumeMl`] = estimatedVolumeMl;
            updateData[`${sideKey}Confidence`] = 0.95;

            if (aiAnalysis) {
              await prisma.breastAnalysis?.update({
                where: { id: aiAnalysis.id },
                data: updateData,
              });
            } else {
              const createData: any = { aiMeasurementId: measurementId as string };
              createData[`${sideKey}VolumeMl`] = estimatedVolumeMl;
              createData[`${sideKey}Confidence`] = 0.95;

              await prisma.breastAnalysis?.create({
                data: createData,
              });
            }

            console.log(`✅ Status zaktualizowany: COMPLETED, volume=${estimatedVolumeMl}ml`);

            return res.status(200).json({
              requestId: lidarCapture.requestId,
              status: "COMPLETED",
              estimatedVolume: estimatedVolumeMl,
              createdAt: lidarCapture.createdAt,
              updatedAt: new Date(),
            });
          } else if (pythonData.status === "failed") {
            await prisma.lidarCapture?.update({
              where: { id: lidarCapture.id },
              data: {
                status: "FAILED",
                updatedAt: new Date(),
              },
            });

            console.log(`❌ Status zaktualizowany: FAILED`);

            return res.status(200).json({
              requestId: lidarCapture.requestId,
              status: "FAILED",
              estimatedVolume: null,
              createdAt: lidarCapture.createdAt,
              updatedAt: new Date(),
            });
          }
        } else {
          console.error(`❌ Python API error: ${pythonResponse.status}`);
        }
      } catch (pythonError) {
        console.error("❌ Error checking Python API:", pythonError);
        // Kontynuuj z danymi z bazy danych
      }
    }

    return res.status(200).json({
      requestId: lidarCapture.requestId,
      status: lidarCapture.status,
      estimatedVolume: lidarCapture.estimatedVolume,
      createdAt: lidarCapture.createdAt,
      updatedAt: lidarCapture.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching LiDAR capture status:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas pobierania statusu",
    });
  }
}
