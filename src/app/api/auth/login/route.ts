import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");

  const okEmail = (process.env.AUTH_EMAIL ?? "").trim();
  const okPass = process.env.AUTH_PASSWORD ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Plotëso email dhe fjalëkalim." }, { status: 400 });
  }

  if (email !== okEmail || password !== okPass) {
    return NextResponse.json({ error: "Email ose fjalëkalim gabim." }, { status: 401 });
  }

  await createSession({ email });

  return NextResponse.json({ ok: true });
}
