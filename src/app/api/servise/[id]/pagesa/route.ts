import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

function n(x: any) {
  return Number(x?.toString?.() ?? x ?? 0) || 0;
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const servisId = BigInt(id);

  const rows = await prisma.pagesaServisi.findMany({
    where: { servisId },
    orderBy: { pagesaId: "asc" },
  });

  return NextResponse.json(
    rows.map((p) => ({
      pagesaId: p.pagesaId.toString(),
      servisId: p.servisId.toString(),
      dataPageses: p.dataPageses.toISOString(),
      menyra: p.menyra,
      shuma: p.shuma.toString(),
      shenim: p.shenim ?? null,
    }))
  );
}

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const servisId = BigInt(id);

    const body = await req.json().catch(() => ({}));

    const dataPageses = body?.dataPageses ? new Date(String(body.dataPageses)) : new Date();
    const menyra = body?.menyra ? String(body.menyra) : "Cash";

    // Decimal: prano si string ose number, por ruaj si string "12.34"
    const shumaNum = Number(body?.shuma ?? 0);
    const shenim = body?.shenim ? String(body.shenim).trim() : null;

    if (!Number.isFinite(shumaNum) || shumaNum <= 0) {
      return NextResponse.json({ error: "Shuma duhet të jetë > 0" }, { status: 400 });
    }

    const shuma = shumaNum.toFixed(2); // ruaj si Decimal i saktë

    const result = await prisma.$transaction(async (tx) => {
      // 1) krijo pagesën
      const row = await tx.pagesaServisi.create({
        data: { servisId, dataPageses, menyra, shuma, shenim },
      });

      // 2) total i servisit (pune + pjese)
      const [puneAgg, pjeseAgg] = await Promise.all([
        tx.puneServisi.aggregate({
          _sum: { totali: true },
          where: { servisId },
        }),
        tx.pjeseServisi.aggregate({
          _sum: { totali: true },
          where: { servisId },
        }),
      ]);

      const totalServisi = n(puneAgg._sum.totali) + n(pjeseAgg._sum.totali);

      // 3) total i paguar (pagesat e servisit)
      const paguarAgg = await tx.pagesaServisi.aggregate({
        _sum: { shuma: true },
        where: { servisId },
      });

      const paguar = n(paguarAgg._sum.shuma);

      // 4) auto status: mbyllur nëse paguar >= total (dhe total > 0)
      const statusiRi =
        totalServisi > 0 && paguar + 1e-9 >= totalServisi ? "Mbyllur" : "Hap";

      await tx.servis.update({
        where: { servisId },
        data: { statusi: statusiRi },
      });

      return {
        pagesaId: row.pagesaId.toString(),
        statusi: statusiRi,
        totalServisi: Number(totalServisi.toFixed(2)),
        paguar: Number(paguar.toFixed(2)),
        mbetur: Number(Math.max(0, totalServisi - paguar).toFixed(2)),
      };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("POST /api/servise/[id]/pagesa error:", e);
    return NextResponse.json(
      { error: "Gabim duke shtuar pagesë", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
