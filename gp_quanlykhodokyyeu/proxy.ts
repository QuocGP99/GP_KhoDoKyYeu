import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

type AuthUser = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: "ADMIN" | "STAFF";
};

const JWT_SECRET = process.env.JWT_SECRET!;

function verifyAccessToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const user = token ? verifyAccessToken(token) : null;
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/login";
  const isAdminPage = pathname.startsWith("/admin");
  const isStaffPage = pathname.startsWith("/staff");

  if (!user && (isAdminPage || isStaffPage)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user && isLoginPage) {
    const redirectTo = user.role === "ADMIN" ? "/admin" : "/staff";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  if (user?.role === "STAFF" && isAdminPage) {
    return NextResponse.redirect(new URL("/staff", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/staff/:path*"],
};