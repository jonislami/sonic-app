import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const rreshtId = BigInt(id);

  const body = await req.json().catch(() => ({}));
  const pershkrimi = String(body?.pershkrimi ?? "").trim();
  if (!pershkrimi) return NextResponse.json({ error: "Përshkrimi është i detyrueshëm" }, { status: 400 });

  const sasia = Number(body?.sasia ?? 1);
  const cmimi = Number(body?.cmimi ?? 0);
  const totali = sasia * cmimi;

  await prisma.faktureRresht.update({
    where: { rreshtId },
    data: { pershkrimi, sasia, cmimi, totali },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.faktureRresht.delete({ where: { rreshtId: BigInt(id) } });
  return NextResponse.json({ ok: true });
}
