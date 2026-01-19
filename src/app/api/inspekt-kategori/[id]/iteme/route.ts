import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const kategoriId = BigInt(id);

    const rows = await prisma.inspektimKategoriItem.findMany({
      where: { kategoriId },
      orderBy: [{ renditja: "asc" }, { etikete: "asc" }],
    });

    return NextResponse.json(
      rows.map((x) => ({
        kategoriItemId: x.kategoriItemId.toString(),
        kategoriId: x.kategoriId.toString(),
        key: x.key,
        etikete: x.etikete,
        renditja: x.renditja,
        aktiv: x.aktiv,
      }))
    );
  } catch (e: any) {
    console.error("GET /api/inspekt-kategori/[id]/iteme error:", e);
    return NextResponse.json({ error: "Gabim" }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const kategoriId = BigInt(id);
    const body = await req.json().catch(() => ({}));

    const key = String(body?.key ?? "").trim();
    const etikete = String(body?.etikete ?? "").trim();

    if (!key || !etikete) {
      return NextResponse.json({ error: "key dhe etikete janë të detyrueshme" }, { status: 400 });
    }

    const row = await prisma.inspektimKategoriItem.create({
      data: {
        kategoriId,
        key,
        etikete,
        renditja: Number(body?.renditja ?? 0),
        aktiv: body?.aktiv !== false,
      },
    });

    return NextResponse.json({ ok: true, kategoriItemId: row.kategoriItemId.toString() });
  } catch (e: any) {
    console.error("POST /api/inspekt-kategori/[id]/iteme error:", e);
    return NextResponse.json({ error: "Gabim" }, { status: 500 });
  }
}
