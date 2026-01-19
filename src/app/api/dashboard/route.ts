import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function ymRange(ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return null;
  const [Y, M] = ym.split("-").map(Number);
  const start = new Date(Y, M - 1, 1);
  const end = new Date(Y, M, 1);
  return { start, end };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ym = (url.searchParams.get("ym") ?? "").trim();

  const range = ymRange(ym);
  if (!range) return NextResponse.json({ error: "ym duhet p.sh. 2026-01" }, { status: 400 });

  const { start, end } = range;

  // ============ Të hyra nga faturat (total rreshta)
  const teHyraAgg = await prisma.faktureRresht.aggregate({
    _sum: { totali: true },
    where: {
      fakture: {
        data: { gte: start, lt: end },
        statusi: { not: "Anuluar" },
      },
    },
  });
  const teHyra = Number(teHyraAgg._sum.totali?.toString() ?? 0);

  // ============ Kosto pjesësh (DALJE)
  const dalje = await prisma.inventarLevizje.findMany({
    where: { data: { gte: start, lt: end }, tipi: "DALJE" },
    select: { sasia: true, cmimi: true },
  });
  const kostoPjesesh = dalje.reduce((s, x) => s + Number(x.cmimi.toString()) * Number(x.sasia), 0);

  const fitimBruto = teHyra - kostoPjesesh;

  // ============ Shpenzime tjera
  const shpenzimeAgg = await prisma.shpenzim.aggregate({
    _sum: { shuma: true },
    where: { data: { gte: start, lt: end } },
  });
  const shpenzimeTjera = Number(shpenzimeAgg._sum.shuma?.toString() ?? 0);

  const fitimNeto = fitimBruto - shpenzimeTjera;

  // ============ Borxhet (fatura me pagesa)
  const faturat = await prisma.fakture.findMany({
    where: { statusi: { not: "Anuluar" } },
    include: { rreshta: true, pagesa: true, klient: true },
    orderBy: { data: "desc" },
    take: 200,
  });

  let borxhiTotal = 0;
  const borxheTop = faturat
    .map((f) => {
      const total = f.rreshta.reduce((s, r) => s + Number(r.totali.toString()), 0);
      const paguar = f.pagesa.reduce((s, p) => s + Number(p.shuma.toString()), 0);
      const borxh = total - paguar;
      return {
        faktureId: f.faktureId.toString(),
        nrFakture: f.nrFakture,
        klient: `${f.klient.emri} ${f.klient.mbiemri ?? ""}`.trim(),
        borxh,
      };
    })
    .filter((x) => x.borxh > 0.001)
    .sort((a, b) => b.borxh - a.borxh)
    .slice(0, 6);

  borxhiTotal = borxheTop.reduce((s, x) => s + x.borxh, 0);

  // ============ Servise Hap (quick list)
  const serviseHap = await prisma.servis.findMany({
    where: { statusi: "Hap" },
    orderBy: { dataServisit: "desc" },
    take: 8,
    include: { automjet: { include: { klient: true } } },
  });

  const servise = serviseHap.map((s) => ({
    servisId: s.servisId.toString(),
    dataServisit: s.dataServisit.toISOString(),
    pershkrimi: s.pershkrimi ?? "",
    automjet: `${s.automjet.marka ?? ""} ${s.automjet.modeli ?? ""} ${s.automjet.viti ?? ""}`.trim(),
    targa: s.automjet.targa ?? "",
    klient: `${s.automjet.klient.emri} ${s.automjet.klient.mbiemri ?? ""}`.trim(),
  }));

  // ============ Low-stock (top 10)
  const inv = await prisma.inventarPjese.findMany({
    orderBy: { sasiaStok: "asc" },
    take: 10,
    select: { inventarId: true, emri: true, sasiaStok: true },
  });

  const lowStock = inv
    .filter((x) => x.sasiaStok <= 2)
    .map((x) => ({
      inventarId: x.inventarId.toString(),
      emri: x.emri,
      sasiaStok: x.sasiaStok,
    }));

  return NextResponse.json({
    ym,
    cards: {
      teHyra: teHyra.toFixed(2),
      kostoPjesesh: kostoPjesesh.toFixed(2),
      shpenzimeTjera: shpenzimeTjera.toFixed(2),
      fitimNeto: fitimNeto.toFixed(2),
      borxhiTopTotal: borxhiTotal.toFixed(2),
    },
    servise,
    lowStock,
    borxheTop: borxheTop.map((x) => ({
      ...x,
      borxh: x.borxh.toFixed(2),
    })),
  });
}
