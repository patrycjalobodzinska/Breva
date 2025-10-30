import { NextApiRequest, NextApiResponse } from "next";
import { registerSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Konfiguracja dla Vercel
export const config = {
  api: {
    bodyParser: true,
    externalResolver: false,
  },
  maxDuration: 60,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ustaw CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    console.error("Invalid method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("📝 Registration attempt - body:", JSON.stringify(req.body));
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Użytkownik z tym adresem email już istnieje",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "USER",
      },
    });

    console.log("✅ User created successfully:", user.email);

    return res.status(201).json({
      message: "Konto zostało utworzone pomyślnie",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);

    // Zod validation error
    if (error?.name === "ZodError") {
      return res.status(400).json({
        error: "Błąd walidacji danych",
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: "Wystąpił błąd podczas rejestracji",
      message: error?.message || "Unknown error",
    });
  }
}
