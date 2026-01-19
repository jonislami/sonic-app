import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

function formatNrFakture(n: number) {
  return `F-${String(n).padStart(6, "0")}`;
}

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const servisId = BigInt(id);

    // nëse ekziston faturë për këtë servis, mos krijo të dytën
    const existing = await prisma.fakture.findFirst({
      where: { servisId },
      orderBy: { faktureId: "desc" },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        faktureId: existing.faktureId.toString(),
        reused: true,
      });
    }

    const servis = await prisma.servis.findUnique({
      where: { servisId },
      include: {
        automjet: { include: { klient: true } },
        pune: true,
        pjese: true,
      },
    });

    if (!servis) return NextResponse.json({ error: "Servisi nuk u gjet" }, { status: 404 });

    const rreshta = [
      ...servis.pune.map((p) => ({
        pershkrimi: `Punë: ${p.pershkrimi}`,
        sasia: p.sasia,
        cmimi: Number(p.cmimi.toString()),
        totali: Number(p.totali.toString()),
      })),
      ...servis.pjese.map((p) => ({
        pershkrimi: `Pjesë: ${p.pershkrimi}${p.furnizues ? ` (Furnizues: ${p.furnizues})` : ""}`,
        sasia: p.sasia,
        cmimi: Number(p.cmimi.toString()),
        totali: Number(p.totali.toString()),
      })),
    ];

    if (rreshta.length === 0) {
      return NextResponse.json({ error: "Ky servis s’ka punë/pjesë." }, { status: 400 });
    }

    // nrFakture unik me logjikë të sigurt: numri i radhës = count + 1
    const count = await prisma.fakture.count();
    let nrFakture = formatNrFakture(count + 1);

    // në rast se përplaset (shumë rrallë), rrit derisa të gjejë të lirë
    for (let i = 0; i < 50; i++) {
      const exists = await prisma.fakture.findUnique({ where: { nrFakture } });
      if (!exists) break;
      nrFakture = formatNrFakture(count + 2 + i);
    }

    const created = await prisma.fakture.create({
      data: {
        nrFakture,
        data: new Date(),
        valuta: "EUR",
        statusi: "Hap",
        shenim: `Faturë automatike nga Servisi #${servis.servisId.toString()}`,
        klientId: servis.automjet.klientId,
        automjetId: servis.automjetId,
        servisId: servis.servisId,
        rreshta: {
          create: rreshta.map((r) => ({
            pershkrimi: r.pershkrimi,
            sasia: r.sasia,
            cmimi: r.cmimi,
            totali: r.totali,
          })),
        },
      },
    });

    return NextResponse.json({ ok: true, faktureId: created.faktureId.toString() });
  } catch (e: any) {
    console.error("krijo-fakture error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë krijimit të faturës", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
