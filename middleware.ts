import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "ADMIN";
    const isUser = token?.role === "USER" || token?.role === "ADMIN";

    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(
          new URL(
            "/logowanie",
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          )
        );
      }
    }

    if (req.nextUrl.pathname.startsWith("/panel")) {
      if (!isUser) {
        return NextResponse.redirect(
          new URL(
            "/logowanie",
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          )
        );
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname === "/logowanie" ||
          req.nextUrl.pathname === "/rejestracja"
        ) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*"],
};
