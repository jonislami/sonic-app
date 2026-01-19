import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const shpenzimId = BigInt(id);
  const body = await req.json().catch(() => ({}));

  await prisma.shpenzim.update({
    where: { shpenzimId },
    data: {
      ...(body?.data !== undefined ? { data: new Date(String(body.data)) } : {}),
      ...(body?.kategoria !== undefined ? { kategoria: String(body.kategoria) } : {}),
      ...(body?.pershkrimi !== undefined ? { pershkrimi: String(body.pershkrimi).trim() || null } : {}),
      ...(body?.shuma !== undefined ? { shuma: Number(body.shuma || 0) } : {}),
      ...(body?.menyra !== undefined ? { menyra: String(body.menyra).trim() || null } : {}),
      ...(body?.furnizues !== undefined ? { furnizues: String(body.furnizues).trim() || null } : {}),
      ...(body?.nrFature !== undefined ? { nrFature: String(body.nrFature).trim() || null } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.shpenzim.delete({ where: { shpenzimId: BigInt(id) } });
  return NextResponse.json({ ok: true });
}
