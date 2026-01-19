import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const faktureId = BigInt(id);

    const body = await req.json().catch(() => ({}));

    const klientId = body?.klientId ? BigInt(String(body.klientId)) : null;
    if (!klientId) return NextResponse.json({ error: "Zgjedh klientin" }, { status: 400 });

    const automjetId = body?.automjetId ? BigInt(String(body.automjetId)) : null;
    const statusi = body?.statusi ? String(body.statusi) : "Hap";
    const shenim = body?.shenim ? String(body.shenim).trim() : null;

    const zbritjeNum = Number(body?.zbritje ?? 0);
    const zbritje = Number.isFinite(zbritjeNum) ? zbritjeNum : 0;

    await prisma.fakture.update({
      where: { faktureId },
      data: {
        klientId,
        automjetId,
        statusi,
        shenim,
        zbritje, // ✅ ruaj zbritjen
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("PATCH /api/faktura/[id]/update error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë ruajtjes së faturës", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
