import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const COOKIE_NAME = "sonic_session";

function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET mungon ne ENV");
  return new TextEncoder().encode(s);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "");

    const okEmail = (process.env.AUTH_EMAIL ?? "").trim();
    const okPass = process.env.AUTH_PASSWORD ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Plotëso email dhe fjalëkalim." }, { status: 400 });
    }

    if (!okEmail || !okPass) {
      return NextResponse.json(
        { error: "AUTH_EMAIL / AUTH_PASSWORD mungojnë në ENV." },
        { status: 500 }
      );
    }

    if (email !== okEmail || password !== okPass) {
      return NextResponse.json({ error: "Email ose fjalëkalim gabim." }, { status: 401 });
    }

    // ✅ krijo JWT që middleware e verifikon
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(getSecret());

    const res = NextResponse.json({ ok: true });

    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 ditë
    });

    return res;
  } catch (e: any) {
    console.error("POST /api/auth/login error:", e);
    return NextResponse.json(
      { error: "Gabim ne login", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
