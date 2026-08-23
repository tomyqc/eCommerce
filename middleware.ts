import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const section = req.nextUrl.pathname.split("/")[2] || "dashboard";
      const permissions = (req.nextauth.token?.permissions as string[] | undefined) || [];
      if (req.nextauth.token?.role !== "admin" && !permissions.includes(section)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/admin")) {
          const section = req.nextUrl.pathname.split("/")[2] || "dashboard";
          return !!token && (token.role === "admin" || ((token.permissions as string[] | undefined) || []).includes(section));
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"]
};
