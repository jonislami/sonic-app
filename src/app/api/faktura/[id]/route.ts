import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const faktureId = BigInt(id);

  const fakture = await prisma.fakture.findUnique({
    where: { faktureId },
    include: {
      klient: true,
      automjet: true,
      rreshta: { orderBy: { rreshtId: "asc" } },
      pagesa: { orderBy: { pagesaId: "asc" } },
    },
  });

  if (!fakture) return NextResponse.json({ error: "Fatura nuk u gjet" }, { status: 404 });

  const rreshta = fakture.rreshta.map((r) => ({
    rreshtId: r.rreshtId.toString(),
    pershkrimi: r.pershkrimi,
    sasia: r.sasia,
    cmimi: r.cmimi.toString(),
    totali: r.totali.toString(),
  }));

  const pagesa = fakture.pagesa.map((p) => ({
    pagesaId: p.pagesaId.toString(),
    dataPageses: p.dataPageses.toISOString(),
    menyra: p.menyra,
    shuma: p.shuma.toString(),
    shenim: p.shenim ?? null,
  }));

  return NextResponse.json({
    fakture: {
      faktureId: fakture.faktureId.toString(),
      nrFakture: fakture.nrFakture,
      data: fakture.data.toISOString(),
      valuta: fakture.valuta,
      statusi: fakture.statusi,
      shenim: fakture.shenim ?? null,
    },
    klient: {
      klientId: fakture.klient.klientId.toString(),
      emri: fakture.klient.emri,
      mbiemri: fakture.klient.mbiemri ?? null,
      telefoni: fakture.klient.telefoni ?? null,
      email: fakture.klient.email ?? null,
      adresa: fakture.klient.adresa ?? null,
    },
    automjet: fakture.automjet
      ? {
          automjetId: fakture.automjet.automjetId.toString(),
          marka: fakture.automjet.marka ?? null,
          modeli: fakture.automjet.modeli ?? null,
          viti: fakture.automjet.viti ?? null,
          targa: fakture.automjet.targa ?? null,
          vin: fakture.automjet.vin ?? null,
        }
      : null,
    rreshta,
    pagesa,
  });
}
