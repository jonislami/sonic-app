import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const inventarId = BigInt(id);

  const rows = await prisma.inventarLevizje.findMany({
    where: { inventarId },
    orderBy: { data: "desc" },
  });
  
  
  return NextResponse.json(
    rows.map((l) => ({
      levizjeId: l.levizjeId.toString(),
      data: l.data.toISOString(),
      tipi: l.tipi,
      sasia: l.sasia,
      cmimi: l.cmimi.toString(),
      shenim: l.shenim ?? "",
      servisId: l.servisId?.toString() ?? "",
    }))
  );
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const inventarId = BigInt(id);

  const body = await req.json().catch(() => ({}));
  const tipi = String(body?.tipi ?? "").trim(); // HYRJE/DALJE/KORRIGJIM
  const sasia = Number(body?.sasia ?? 0);
  const cmimi = Number(body?.cmimi ?? 0);
  const shenim = body?.shenim ? String(body.shenim).trim() : null;

  if (!["HYRJE", "DALJE", "KORRIGJIM"].includes(tipi)) {
    return NextResponse.json({ error: "Tipi duhet të jetë HYRJE/DALJE/KORRIGJIM" }, { status: 400 });
  }
  if (!Number.isFinite(sasia) || sasia === 0) {
    return NextResponse.json({ error: "Sasia duhet të jetë ≠ 0" }, { status: 400 });
  }

  const item = await prisma.inventarPjese.findUnique({ where: { inventarId } });
  if (!item) return NextResponse.json({ error: "Artikulli nuk u gjet" }, { status: 404 });

  // Llogarit stokun e ri
  let stokIri = item.sasiaStok;

  if (tipi === "HYRJE") stokIri = item.sasiaStok + Math.abs(sasia);
  if (tipi === "DALJE") stokIri = item.sasiaStok - Math.abs(sasia);
  if (tipi === "KORRIGJIM") stokIri = item.sasiaStok + sasia; // mundet + ose -

  if (stokIri < 0) {
    return NextResponse.json({ error: "Nuk ka stok të mjaftueshëm" }, { status: 400 });
  }

  const sasiaFinale =
    tipi === "KORRIGJIM" ? sasia : Math.abs(sasia);

  await prisma.$transaction([
    prisma.inventarLevizje.create({
      data: { inventarId, tipi, sasia: sasiaFinale,  cmimi, shenim },
    }),
    prisma.inventarPjese.update({
      where: { inventarId },
      data: { sasiaStok: stokIri },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
