import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export default NextAuth(authOptions);

// Konfiguracja dla Vercel
export const config = {
  api: {
    externalResolver: true,
  },
};
