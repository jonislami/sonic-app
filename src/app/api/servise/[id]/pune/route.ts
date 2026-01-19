import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const servisId = BigInt(id);

  const rows = await prisma.puneServisi.findMany({
    where: { servisId },
    orderBy: { puneId: "asc" },
  });

  return NextResponse.json(
    rows.map((p) => ({
      puneId: p.puneId.toString(),
      servisId: p.servisId.toString(),
      pershkrimi: p.pershkrimi,
      sasia: p.sasia,
      cmimi: p.cmimi.toString(),
      totali: p.totali.toString(),
    }))
  );
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const servisId = BigInt(id);

  const body = await req.json().catch(() => ({}));
  const pershkrimi = String(body?.pershkrimi ?? "").trim();
  if (!pershkrimi) return NextResponse.json({ error: "Përshkrimi është i detyrueshëm" }, { status: 400 });

  const sasia = Number(body?.sasia ?? 1);
  const cmimi = Number(body?.cmimi ?? 0);
  const totali = sasia * cmimi;

  const row = await prisma.puneServisi.create({
    data: { servisId, pershkrimi, sasia, cmimi, totali },
  });

  return NextResponse.json({ ok: true, puneId: row.puneId.toString() });
}
