import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const section = req.nextUrl.pathname.split("/")[2] || "dashboard";
      const permission = section === "merchant" ? "agents" : section === "settings" ? "payment-settings" : section;
      const permissions = (req.nextauth.token?.permissions as string[] | undefined) || [];
      if (req.nextauth.token?.role !== "admin" && !permissions.includes(permission)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/admin")) {
          const section = req.nextUrl.pathname.split("/")[2] || "dashboard";
          const permission = section === "merchant" ? "agents" : section === "settings" ? "payment-settings" : section;
          return !!token && (token.role === "admin" || ((token.permissions as string[] | undefined) || []).includes(permission));
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"]
};
