import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const faktureId = BigInt(id);

  const rows = await prisma.faktureRresht.findMany({
    where: { faktureId },
    orderBy: { rreshtId: "asc" },
  });

  return NextResponse.json(
    rows.map((r) => ({
      rreshtId: r.rreshtId.toString(),
      pershkrimi: r.pershkrimi,
      sasia: r.sasia,
      cmimi: r.cmimi.toString(),
      totali: r.totali.toString(),
    }))
  );
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const faktureId = BigInt(id);

  const body = await req.json().catch(() => ({}));
  const pershkrimi = String(body?.pershkrimi ?? "").trim();
  if (!pershkrimi) return NextResponse.json({ error: "Përshkrimi është i detyrueshëm" }, { status: 400 });

  const sasia = Number(body?.sasia ?? 1);
  const cmimi = Number(body?.cmimi ?? 0);
  const totali = sasia * cmimi;

  const row = await prisma.faktureRresht.create({
    data: { faktureId, pershkrimi, sasia, cmimi, totali },
  });

  return NextResponse.json({ ok: true, rreshtId: row.rreshtId.toString() });
}
