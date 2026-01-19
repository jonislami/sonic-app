import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


function formatNrFakture(n: number) {
  return `F-${String(n).padStart(6, "0")}`;
}

export async function GET() {
  const rows = await prisma.fakture.findMany({
    orderBy: { faktureId: "desc" },
    include: {
      klient: true,
      automjet: true,
      rreshta: true,
      pagesa: true,
    },
  });

  const data = rows.map((f) => {
    const total = f.rreshta.reduce((s, r) => s + Number(r.totali.toString()), 0);
    const paguar = f.pagesa.reduce((s, p) => s + Number(p.shuma.toString()), 0);

    return {
      faktureId: f.faktureId.toString(),
      nrFakture: f.nrFakture,
      data: f.data.toISOString(),
      statusi: f.statusi,
      valuta: f.valuta,

      klient: {
        klientId: f.klient.klientId.toString(),
        emri: f.klient.emri,
        mbiemri: f.klient.mbiemri ?? null,
        telefoni: f.klient.telefoni ?? null,
      },

      automjet: f.automjet
        ? {
            automjetId: f.automjet.automjetId.toString(),
            marka: f.automjet.marka ?? null,
            modeli: f.automjet.modeli ?? null,
            viti: f.automjet.viti ?? null,
            targa: f.automjet.targa ?? null,
          }
        : null,

      total: total.toFixed(2),
      paguar: paguar.toFixed(2),
      borxh: (total - paguar).toFixed(2),
    };
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const klientId = String(body?.klientId ?? "").trim();
  if (!klientId) return NextResponse.json({ error: "Zgjedh klientin" }, { status: 400 });

  const automjetIdRaw = String(body?.automjetId ?? "").trim();
  const automjetId = automjetIdRaw ? BigInt(automjetIdRaw) : null;

  // Nr fature
  const last = await prisma.fakture.findFirst({ orderBy: { faktureId: "desc" } });
  const nextId = last ? Number(last.faktureId.toString()) + 1 : 1;
  const nrFakture = formatNrFakture(nextId);

  const created = await prisma.fakture.create({
    data: {
      nrFakture,
      klientId: BigInt(klientId),
      automjetId,
      valuta: "EUR",
      statusi: "Hap",
      shenim: body?.shenim ? String(body.shenim).trim() : null,
    },
  });

  return NextResponse.json({ ok: true, faktureId: created.faktureId.toString() });
}
