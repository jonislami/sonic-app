import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await prisma.furnizues.findMany({
      orderBy: { furnizuesId: "desc" },
    });

    const data = rows.map((r) => ({
      furnizuesId: r.furnizuesId.toString(),
      emri: r.emri,
      telefoni: r.telefoni ?? "",
      email: r.email ?? "",
      adresa: r.adresa ?? "",
    }));

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("GET /api/furnizues error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë marrjes së furnizuesve", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const emri = String(body?.emri ?? "").trim();
    const telefoni = String(body?.telefoni ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const adresa = String(body?.adresa ?? "").trim();

    if (!emri) {
      return NextResponse.json({ error: "Emri është i detyrueshëm" }, { status: 400 });
    }

    const row = await prisma.furnizues.create({
      data: {
        emri,
        telefoni: telefoni || null,
        email: email || null,
        adresa: adresa || null,
      },
    });

    return NextResponse.json({
      ok: true,
      furnizuesId: row.furnizuesId.toString(),
    });
  } catch (e: any) {
    console.error("POST /api/furnizues error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë krijimit të furnizuesit", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
