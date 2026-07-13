import jwt from "jsonwebtoken";

export type AppRole = "ADMIN" | "STAFF";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: AppRole;
};

const JWT_SECRET = process.env.JWT_SECRET!;

export function signAccessToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function getRedirectByRole(role: AppRole) {
  if (role === "ADMIN") return "/admin";
  return "/staff";
}