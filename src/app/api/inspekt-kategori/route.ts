import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await prisma.inspektimKategori.findMany({
      orderBy: [{ renditja: "asc" }, { emri: "asc" }],
    });

    return NextResponse.json(
      rows.map((k) => ({
        kategoriId: k.kategoriId.toString(),
        emri: k.emri,
        pershkrimi: k.pershkrimi ?? null,
        renditja: k.renditja,
        aktiv: k.aktiv,
      }))
    );
  } catch (e: any) {
    console.error("GET /api/inspekt-kategori error:", e);
    return NextResponse.json({ error: "Gabim" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const emri = String(body?.emri ?? "").trim();
    if (!emri) return NextResponse.json({ error: "Emri është i detyrueshëm" }, { status: 400 });

    const row = await prisma.inspektimKategori.create({
      data: {
        emri,
        pershkrimi: body?.pershkrimi ? String(body.pershkrimi).trim() : null,
        renditja: Number(body?.renditja ?? 0),
        aktiv: body?.aktiv !== false,
      },
    });

    return NextResponse.json({ ok: true, kategoriId: row.kategoriId.toString() });
  } catch (e: any) {
    console.error("POST /api/inspekt-kategori error:", e);
    return NextResponse.json({ error: "Gabim" }, { status: 500 });
  }
}
