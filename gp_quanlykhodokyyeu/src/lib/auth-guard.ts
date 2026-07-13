import {cookies} from 'next/headers';
import {verifyAccessToken} from "@/lib/auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) return null;

    return verifyAccessToken(accessToken);
}

export async function requireUser(){
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("UNAUTHORIZED");
    }
    return user;
}

export async function requireAdmin(){
    const user = await requireUser();
    if (user.role !== "ADMIN") {
        throw new Error("FORBIDDEN");
    }

    return user;
}




