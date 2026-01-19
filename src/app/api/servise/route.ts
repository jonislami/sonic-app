import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const statusi = (url.searchParams.get("statusi") ?? "").trim();
  const ym = (url.searchParams.get("ym") ?? "").trim(); // p.sh. 2026-01

  let start: Date | null = null;
  let end: Date | null = null;

  if (/^\d{4}-\d{2}$/.test(ym)) {
    const [Y, M] = ym.split("-").map(Number);
    start = new Date(Y, M - 1, 1);
    end = new Date(Y, M, 1);
  }

  const rows = await prisma.servis.findMany({
    where: {
      ...(statusi ? { statusi } : {}),
      ...(start && end ? { dataServisit: { gte: start, lt: end } } : {}),
      ...(q
        ? {
            OR: [
              { pershkrimi: { contains: q, mode: "insensitive" } },
              { automjet: { targa: { contains: q, mode: "insensitive" } } },
              { automjet: { vin: { contains: q, mode: "insensitive" } } },
              { automjet: { marka: { contains: q, mode: "insensitive" } } },
              { automjet: { modeli: { contains: q, mode: "insensitive" } } },
              { automjet: { klient: { emri: { contains: q, mode: "insensitive" } } } },
              { automjet: { klient: { mbiemri: { contains: q, mode: "insensitive" } } } },
              { automjet: { klient: { telefoni: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    orderBy: { dataServisit: "desc" },
    include: {
      automjet: { include: { klient: true } },
      pune: true,
      pjese: true,
      pagesa: true,
    },
  });

  const data = rows.map((s) => {
    const total = [...s.pune, ...s.pjese].reduce((sum, x) => sum + Number(x.totali.toString()), 0);
    const paguar = s.pagesa.reduce((sum, p) => sum + Number(p.shuma.toString()), 0);

    return {
      servisId: s.servisId.toString(),
      dataServisit: s.dataServisit.toISOString(),
      statusi: s.statusi,
      kmNeServis: s.kmNeServis?.toString() ?? null,
      pershkrimi: s.pershkrimi ?? null,

      klient: {
        klientId: s.automjet.klient.klientId.toString(),
        emri: s.automjet.klient.emri,
        mbiemri: s.automjet.klient.mbiemri ?? null,
        telefoni: s.automjet.klient.telefoni ?? null,
      },
      automjet: {
        automjetId: s.automjet.automjetId.toString(),
        marka: s.automjet.marka ?? null,
        modeli: s.automjet.modeli ?? null,
        viti: s.automjet.viti ?? null,
        targa: s.automjet.targa ?? null,
      },

      total: total.toFixed(2),
      paguar: paguar.toFixed(2),
      borxh: (total - paguar).toFixed(2),
    };
  });

  return NextResponse.json(data);
}
