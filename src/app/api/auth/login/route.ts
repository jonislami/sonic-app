import { NextResponse } from "next/server";

export async function POST(req: Request) {
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
      { error: "AUTH_EMAIL / AUTH_PASSWORD nuk janë vendosur në ENV." },
      { status: 500 }
    );
  }

  if (email !== okEmail || password !== okPass) {
    return NextResponse.json({ error: "Email ose fjalëkalim gabim." }, { status: 401 });
  }

  // ✅ krijo një token të thjeshtë (mjafton për middleware check)
  const token = `sg_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  // ✅ kthe response dhe vendos cookie "token"
  const res = NextResponse.json({ ok: true });

  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // në Vercel = true, në localhost = false
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 ditë
  });

  return res;
}
