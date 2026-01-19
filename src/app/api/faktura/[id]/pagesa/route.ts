import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

function toNumber(x: any) {
  if (x == null) return 0;
  const n = Number(String(x));
  return Number.isFinite(n) ? n : 0;
}

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const faktureId = BigInt(id);

    const rows = await prisma.fakturePagesa.findMany({
      where: { faktureId },
      orderBy: { pagesaId: "asc" },
    });

    return NextResponse.json(
      rows.map((p) => ({
        pagesaId: p.pagesaId.toString(),
        faktureId: p.faktureId.toString(),
        dataPageses: p.dataPageses.toISOString(),
        menyra: p.menyra,
        shuma: p.shuma.toString(),
        zbritje: (p as any).zbritje ? (p as any).zbritje.toString() : "0",
        shenim: p.shenim ?? null,
      }))
    );
  } catch (e: any) {
    console.error("GET /api/faktura/[id]/pagesa error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë marrjes së pagesave", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const faktureId = BigInt(id);

    const body = await req.json().catch(() => ({}));

    const dataPageses = body?.dataPageses ? new Date(String(body.dataPageses)) : new Date();
    const menyra = body?.menyra ? String(body.menyra) : "Cash";

    const shuma = toNumber(body?.shuma ?? 0);
    const zbritje = toNumber(body?.zbritje ?? 0);
    const shenim = body?.shenim ? String(body.shenim).trim() : null;

    // ✅ lejo pagesë vetëm, zbritje vetëm, ose të dyja
    if (shuma <= 0 && zbritje <= 0) {
      return NextResponse.json(
        { error: "Duhet të vendosësh Shumë ose Zbritje (të paktën njërën)." },
        { status: 400 }
      );
    }

    if (zbritje < 0) {
      return NextResponse.json({ error: "Zbritja s’mund të jetë negative." }, { status: 400 });
    }

    const row = await prisma.fakturePagesa.create({
      data: {
        faktureId,
        dataPageses,
        menyra,
        shuma,
        zbritje,
        shenim,
      } as any,
    });

    return NextResponse.json({ ok: true, pagesaId: row.pagesaId.toString() });
  } catch (e: any) {
    console.error("POST /api/faktura/[id]/pagesa error:", e);
    return NextResponse.json(
      { error: "Gabim duke shtuar pagesë", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
