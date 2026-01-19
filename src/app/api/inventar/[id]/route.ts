import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const inventarId = BigInt(id);
  const body = await req.json().catch(() => ({}));

  const emri = body?.emri !== undefined ? String(body.emri).trim() : undefined;
  if (emri !== undefined && !emri) return NextResponse.json({ error: "Emri s’mund të jetë bosh" }, { status: 400 });

  await prisma.inventarPjese.update({
    where: { inventarId },
    data: {
      ...(body?.kodi !== undefined ? { kodi: String(body.kodi).trim() || null } : {}),
      ...(body?.emri !== undefined ? { emri } : {}),
      ...(body?.marka !== undefined ? { marka: String(body.marka).trim() || null } : {}),
      ...(body?.modeli !== undefined ? { modeli: String(body.modeli).trim() || null } : {}),
      ...(body?.cmimiBlerje !== undefined ? { cmimiBlerje: Number(body.cmimiBlerje || 0) } : {}),
      ...(body?.cmimiShitje !== undefined ? { cmimiShitje: Number(body.cmimiShitje || 0) } : {}),
      ...(body?.furnizuesId !== undefined
        ? { furnizuesId: body.furnizuesId ? BigInt(String(body.furnizuesId)) : null }
        : {}),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const inventarId = BigInt(id);

  // mos e lejo fshirjen nese eshte perdor ne servise
  const used = await prisma.pjeseServisi.count({ where: { inventarId } });
  if (used > 0) {
    return NextResponse.json(
      { error: "Nuk mund të fshihet, sepse është përdorur në servise." },
      { status: 400 }
    );
  }

  await prisma.inventarLevizje.deleteMany({ where: { inventarId } });
  await prisma.inventarPjese.delete({ where: { inventarId } });

  return NextResponse.json({ ok: true });
}
