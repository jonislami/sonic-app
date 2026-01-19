import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const automjetId = BigInt(id);

  const rows = await prisma.servis.findMany({
    where: { automjetId },
    orderBy: { dataServisit: "desc" },
  });

  const data = rows.map((s) => ({
    servisId: s.servisId.toString(),
    automjetId: s.automjetId.toString(),
    dataServisit: s.dataServisit.toISOString(),
    kmNeServis: s.kmNeServis?.toString() ?? null,
    pershkrimi: s.pershkrimi ?? null,
    statusi: s.statusi,
  }));

  return NextResponse.json(data);
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const automjetId = BigInt(id);

  const body = await req.json().catch(() => ({}));

  const dataServisit = body?.dataServisit ? new Date(String(body.dataServisit)) : new Date();
  const kmNeServis = body?.kmNeServis ? BigInt(String(body.kmNeServis)) : null;
  const pershkrimi = body?.pershkrimi ? String(body.pershkrimi).trim() : null;
  const statusi = body?.statusi ? String(body.statusi) : "Hap";

  const row = await prisma.servis.create({
    data: { automjetId, dataServisit, kmNeServis, pershkrimi, statusi },
  });

  return NextResponse.json({ ok: true, servisId: row.servisId.toString() });
}
