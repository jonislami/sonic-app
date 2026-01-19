import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function monthRange(ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return null;
  const [Y, M] = ym.split("-").map(Number);
  const start = new Date(Y, M - 1, 1);
  const end = new Date(Y, M, 1);
  return { start, end };
}

async function calcAppliedAndTip(start: Date, end: Date) {
  const pays = await prisma.fakturePagesa.findMany({
    where: {
      dataPageses: { gte: start, lt: end },
      fakture: { statusi: { not: "Anuluar" } },
    },
    select: { faktureId: true, shuma: true, dataPageses: true },
    orderBy: [{ faktureId: "asc" }, { dataPageses: "asc" }],
  });

  if (pays.length === 0) return { pagesaAplikuar: 0, bakshishNgaPagesat: 0 };

  const faktureIds = Array.from(new Set(pays.map((p) => p.faktureId.toString()))).map((x) => BigInt(x));

  const totals = await prisma.faktureRresht.groupBy({
    by: ["faktureId"],
    where: { faktureId: { in: faktureIds } },
    _sum: { totali: true },
  });

  const totalMap = new Map<string, number>();
  for (const t of totals) totalMap.set(t.faktureId.toString(), Number(t._sum.totali?.toString() ?? 0));

  const paidBefore = await prisma.fakturePagesa.groupBy({
    by: ["faktureId"],
    where: { faktureId: { in: faktureIds }, dataPageses: { lt: start } },
    _sum: { shuma: true },
  });

  const paidBeforeMap = new Map<string, number>();
  for (const p of paidBefore) paidBeforeMap.set(p.faktureId.toString(), Number(p._sum.shuma?.toString() ?? 0));

  let pagesaAplikuar = 0;
  let bakshishNgaPagesat = 0;

  const runningPaid = new Map<string, number>();
  for (const pid of faktureIds) runningPaid.set(pid.toString(), paidBeforeMap.get(pid.toString()) ?? 0);

  for (const pay of pays) {
    const id = pay.faktureId.toString();
    const total = totalMap.get(id) ?? 0;
    const already = runningPaid.get(id) ?? 0;

    const remaining = Math.max(0, total - Math.min(total, already));
    const shumaPay = Number(pay.shuma.toString());

    const applied = Math.min(shumaPay, remaining);
    const tip = Math.max(0, shumaPay - applied);

    pagesaAplikuar += applied;
    bakshishNgaPagesat += tip;

    runningPaid.set(id, already + shumaPay);
  }

  return { pagesaAplikuar, bakshishNgaPagesat };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ym = (url.searchParams.get("ym") ?? "").trim();

    const range = monthRange(ym);
    if (!range) {
      return NextResponse.json({ error: "Parametri ym duhet të jetë p.sh. 2026-01" }, { status: 400 });
    }

    const { start, end } = range;

    // Të hyra (Fatura) = total rreshta faturash të krijuara në muaj
    const faturatTotalAgg = await prisma.faktureRresht.aggregate({
      _sum: { totali: true },
      where: {
        fakture: {
          data: { gte: start, lt: end },
          statusi: { not: "Anuluar" },
        },
      },
    });
    const teHyraFatura = Number(faturatTotalAgg._sum.totali?.toString() ?? 0);

    // Pagesa aplikuar + bakshish (overpay)
    const { pagesaAplikuar, bakshishNgaPagesat } = await calcAppliedAndTip(start, end);

    // ✅ DALJE inventari me cmimi blerje + cmimi shitje + fitim
    const daljeRows = await prisma.inventarLevizje.findMany({
      where: { data: { gte: start, lt: end }, tipi: "DALJE" },
      orderBy: { data: "desc" },
      select: {
        levizjeId: true,
        data: true,
        sasia: true,
        shenim: true,
        inventar: {
          select: {
            inventarId: true,
            emri: true,
            kodi: true,
            marka: true,
            modeli: true,
            cmimiBlerje: true,
            cmimiShitje: true,
          },
        },
      },
    });

    const daljeList = daljeRows.map((x) => {
      const sasia = Number(x.sasia ?? 0);

      const cmimiBlerje = Number(x.inventar?.cmimiBlerje?.toString?.() ?? 0);
      const cmimiShitje = Number(x.inventar?.cmimiShitje?.toString?.() ?? 0);

      const kosto = Number((sasia * cmimiBlerje).toFixed(2));
      const shitje = Number((sasia * cmimiShitje).toFixed(2));
      const fitim = Number((shitje - kosto).toFixed(2));

      return {
        levizjeId: String(x.levizjeId),
        data: x.data ? new Date(x.data).toISOString() : null,
        sasia,
        cmimiBlerje,
        cmimiShitje,
        kosto,
        shitje,
        fitim,
        shenim: x.shenim ? String(x.shenim) : null,
        pjese: {
          inventarId: String(x.inventar?.inventarId ?? ""),
          emri: String(x.inventar?.emri ?? "Pjesë"),
          kodi: x.inventar?.kodi ? String(x.inventar.kodi) : null,
          marka: x.inventar?.marka ? String(x.inventar.marka) : null,
          modeli: x.inventar?.modeli ? String(x.inventar.modeli) : null,
        },
      };
    });

    const daljeKostoTotal = Number(
      daljeList.reduce((s: number, x: any) => s + (Number(x.kosto) || 0), 0).toFixed(2)
    );
    const daljeShitjeTotal = Number(
      daljeList.reduce((s: number, x: any) => s + (Number(x.shitje) || 0), 0).toFixed(2)
    );
    const daljeFitimTotal = Number(
      daljeList.reduce((s: number, x: any) => s + (Number(x.fitim) || 0), 0).toFixed(2)
    );

    // Shpenzime (total + listë)
    const shpenzimeRows = await prisma.shpenzim.findMany({
      where: { data: { gte: start, lt: end } },
      orderBy: { data: "desc" },
    });

    const shpenzimeList = shpenzimeRows.map((x: any) => ({
      shpenzimId: String(x.shpenzimId ?? x.id ?? ""),
      data: x.data ? new Date(x.data).toISOString() : null,
      pershkrimi: String(x.pershkrimi ?? x.lloji ?? x.emri ?? "Shpenzim"),
      kategoria: x.kategoria ? String(x.kategoria) : null,
      shenim: x.shenim ? String(x.shenim) : null,
      shuma: Number(x.shuma?.toString?.() ?? x.shuma ?? 0),
    }));

    const shpenzimeTjera = shpenzimeList.reduce((s: number, r: any) => s + (Number(r.shuma) || 0), 0);

    // Shpenzime blerje (HYRJE) – nëse do e mbash
    const hyrje = await prisma.inventarLevizje.findMany({
      where: { data: { gte: start, lt: end }, tipi: "HYRJE" },
      select: { sasia: true, cmimi: true },
    });
    const shpenzimeBlerje = hyrje.reduce(
      (s, x) => s + Number(x.sasia) * Number(x.cmimi.toString()),
      0
    );

    // Vlera stokut
    const stok = await prisma.inventarPjese.findMany({
      select: { sasiaStok: true, cmimiBlerje: true },
    });
    const vleraStokut = stok.reduce(
      (s, x) => s + Number(x.sasiaStok) * Number(x.cmimiBlerje.toString()),
      0
    );

    // Borxh mujor real (fatura të muajit pa paguar plot)
    const faturat = await prisma.fakture.findMany({
      where: { data: { gte: start, lt: end }, statusi: { not: "Anuluar" } },
      select: { faktureId: true },
    });

    let borxhMujor = 0;
    if (faturat.length > 0) {
      const ids = faturat.map((f) => f.faktureId);

      const totalsByInv = await prisma.faktureRresht.groupBy({
        by: ["faktureId"],
        where: { faktureId: { in: ids } },
        _sum: { totali: true },
      });

      const paidByInv = await prisma.fakturePagesa.groupBy({
        by: ["faktureId"],
        where: { faktureId: { in: ids } },
        _sum: { shuma: true },
      });

      const paidMap = new Map<string, number>();
      for (const p of paidByInv) paidMap.set(p.faktureId.toString(), Number(p._sum.shuma?.toString() ?? 0));

      for (const t of totalsByInv) {
        const id = t.faktureId.toString();
        const total = Number(t._sum.totali?.toString() ?? 0);
        const paid = paidMap.get(id) ?? 0;
        const appliedAllTime = Math.min(total, paid);
        borxhMujor += Math.max(0, total - appliedAllTime);
      }
    }

    // Cash mujor (pagesa aplikuar + bakshish)
    const teHyraCash = pagesaAplikuar + bakshishNgaPagesat;

    // Fitim (cash - kosto - shpenzime)
    const fitimBruto = teHyraCash - daljeKostoTotal;
    const fitimNeto = fitimBruto - shpenzimeTjera;

    return NextResponse.json({
      ym,

      teHyraFatura: Number(teHyraFatura.toFixed(2)),

      pagesaAplikuar: Number(pagesaAplikuar.toFixed(2)),
      bakshish: Number(bakshishNgaPagesat.toFixed(2)),
      teHyraCash: Number(teHyraCash.toFixed(2)),

      borxhMujor: Number(borxhMujor.toFixed(2)),

      shpenzimeBlerje: Number(shpenzimeBlerje.toFixed(2)),

      // ✅ kosto e pjesëve = kosto blerje nga dalje
      kostoPjeseshTePerdorura: Number(daljeKostoTotal.toFixed(2)),

      shpenzimeTjera: Number(shpenzimeTjera.toFixed(2)),
      vleraStokut: Number(vleraStokut.toFixed(2)),

      fitimBruto: Number(fitimBruto.toFixed(2)),
      fitimNeto: Number(fitimNeto.toFixed(2)),

      // ✅ listat
      shpenzimeList,
      daljeList,

      // ✅ totale dalje
      daljeKostoTotal,
      daljeShitjeTotal,
      daljeFitimTotal,
    });
  } catch (e: any) {
    console.error("GET /api/raporte/mujor error:", e);
    return NextResponse.json(
      { error: "Gabim te raporti mujor", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
