import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getRedirectByRole, signAccessToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = String(body.identifier || "").trim();
    const password = String(body.password || "").trim();

    console.log("identifier:", identifier);

    if (!identifier || !password) {
      return NextResponse.json(
        { ok: false, message: "Vui lòng nhập đầy đủ thông tin." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    console.log("user found:", !!user);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { ok: false, message: "Tài khoản không tồn tại hoặc đã bị khóa." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log("password match:", isMatch);

    if (!isMatch) {
      return NextResponse.json(
        { ok: false, message: "Sai mật khẩu." },
        { status: 401 }
      );
    }

    const token = signAccessToken({
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });

    const res = NextResponse.json({
      ok: true,
      redirectTo: getRedirectByRole(user.role),
    });

    res.cookies.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Có lỗi xảy ra khi đăng nhập." },
      { status: 500 }
    );
  }
}