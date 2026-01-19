import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const servisId = BigInt(id);

  const rows = await prisma.pjeseServisi.findMany({
    where: { servisId },
    orderBy: { pjeseId: "asc" },
    include: { inventar: true },
  });

  return NextResponse.json(
    rows.map((p) => ({
      pjeseId: p.pjeseId.toString(),
      servisId: p.servisId.toString(),
      pershkrimi: p.pershkrimi,
      sasia: p.sasia,
      cmimi: p.cmimi.toString(),
      totali: p.totali.toString(),
      furnizues: p.furnizues ?? "",
      inventarId: p.inventarId?.toString() ?? "",
      inventarEmri: p.inventar?.emri ?? "",
    }))
  );
}

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const servisId = BigInt(id);

    const body = await req.json().catch(() => ({}));

    const inventarIdRaw = String(body?.inventarId ?? "").trim();
    const pershkrimiManual = String(body?.pershkrimi ?? "").trim();
    const sasia = Number(body?.sasia ?? 1);

    if (!Number.isFinite(sasia) || sasia <= 0) {
      return NextResponse.json({ error: "Sasia duhet të jetë > 0" }, { status: 400 });
    }

    // Nëse zgjedh nga inventari
    if (inventarIdRaw) {
      const inventarId = BigInt(inventarIdRaw);

      const item = await prisma.inventarPjese.findUnique({ where: { inventarId } });
      if (!item) return NextResponse.json({ error: "Pjesa në inventar nuk u gjet" }, { status: 404 });

      if (item.sasiaStok < sasia) {
        return NextResponse.json({ error: `S’ka stok mjaftueshëm. Stok: ${item.sasiaStok}` }, { status: 400 });
      }

      const cmimi = body?.cmimi !== undefined && body?.cmimi !== ""
        ? Number(body.cmimi)
        : Number(item.cmimiShitje.toString());

      const totali = sasia * cmimi;

      // Transaction: krijo pjeseServisi + zbrit stok + krijo levizje DALJE
      const created = await prisma.$transaction(async (tx) => {
        const pj = await tx.pjeseServisi.create({
          data: {
            servisId,
            inventarId,
            pershkrimi: item.emri,
            sasia,
            cmimi,
            totali,
            furnizues: null,
          },
        });

        await tx.inventarPjese.update({
          where: { inventarId },
          data: { sasiaStok: item.sasiaStok - sasia },
        });

        await tx.inventarLevizje.create({
          data: {
            inventarId,
            tipi: "DALJE",
            sasia,
            cmimi: Number(item.cmimiBlerje.toString()), // kosto (blerje)
            shenim: `Dalje për Servis #${servisId.toString()}`,
            servisId,
          },
        });

        return pj;
      });

      return NextResponse.json({ ok: true, pjeseId: created.pjeseId.toString() });
    }

    // Përndryshe: manual
    if (!pershkrimiManual) {
      return NextResponse.json({ error: "Zgjedh pjesë nga inventari ose shkruaj përshkrimin" }, { status: 400 });
    }

    const cmimi = Number(body?.cmimi ?? 0);
    const totali = sasia * cmimi;

    const row = await prisma.pjeseServisi.create({
      data: {
        servisId,
        inventarId: null,
        pershkrimi: pershkrimiManual,
        sasia,
        cmimi,
        totali,
        furnizues: body?.furnizues ? String(body.furnizues).trim() : null,
      },
    });

    return NextResponse.json({ ok: true, pjeseId: row.pjeseId.toString() });
  } catch (e: any) {
    console.error("POST pjeseServisi error:", e);
    return NextResponse.json({ error: "Gabim duke shtuar pjesë", detail: String(e?.message ?? e) }, { status: 500 });
  }
}
