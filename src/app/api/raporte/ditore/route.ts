import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dayRange(d?: string) {
  const now = new Date();
  const base = d
    ? new Date(`${d}T00:00:00`)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const start = new Date(base);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const iso = start.toISOString().slice(0, 10);
  return { start, end, iso };
}

// Pagesa të aplikuara + bakshish (overpay) brenda range
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
    const d = url.searchParams.get("d") ?? undefined;
    const { start, end, iso } = dayRange(d);

    // Të hyra (Fatura) = rreshta faturash të asaj dite (krijim fature)
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

    // Shpenzime (listë + total)
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

    // Borxh (info) – vetëm për faturat e asaj dite
    const borxhInfo = Math.max(0, teHyraFatura - pagesaAplikuar);

    // Cash i ditës (pagesa aplikuar + bakshish)
    const teHyraCash = pagesaAplikuar + bakshishNgaPagesat;

    // Fitim neto (cash - kosto - shpenzime)
    const fitimNeto = teHyraCash - daljeKostoTotal - shpenzimeTjera;

    return NextResponse.json({
      ok: true,
      date: iso,

      teHyraFatura: Number(teHyraFatura.toFixed(2)),

      pagesaAplikuar: Number(pagesaAplikuar.toFixed(2)),
      bakshish: Number(bakshishNgaPagesat.toFixed(2)),
      teHyraCash: Number(teHyraCash.toFixed(2)),

      // kosto pjesësh = kosto blerje nga dalje
      kostoPjesesh: daljeKostoTotal,
      shpenzimeTjera: Number(shpenzimeTjera.toFixed(2)),
      fitimNeto: Number(fitimNeto.toFixed(2)),

      borxhInfo: Number(borxhInfo.toFixed(2)),

      shpenzimeList,

      // ✅ inventar dalje list + totale
      daljeList,
      daljeKostoTotal,
      daljeShitjeTotal,
      daljeFitimTotal,
    });
  } catch (e: any) {
    console.error("GET /api/raporte/ditore error:", e);
    return NextResponse.json(
      { error: "Gabim te raporti ditor", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
