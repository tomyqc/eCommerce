import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const section = req.nextUrl.pathname.split("/")[2] || "dashboard";
      const permission = section === "merchant" ? "agents" : section === "settings" ? "settings" : section;
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
          const permission = section === "merchant" ? "agents" : section === "settings" ? "settings" : section;
          const permissions = (token?.permissions as string[] | undefined) || [];
          return !!token && (token.role === "admin" || permissions.includes(permission) || (section === "settings" && (permissions.includes("payment-settings") || permissions.includes("announcements"))));
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"]
};
