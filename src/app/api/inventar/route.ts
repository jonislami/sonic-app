import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  const rows = await prisma.inventarPjese.findMany({
    where: q
      ? {
          OR: [
            { emri: { contains: q, mode: "insensitive" } },
            { kodi: { contains: q, mode: "insensitive" } },
            { marka: { contains: q, mode: "insensitive" } },
            { modeli: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { inventarId: "desc" },
    include: { furnizues: true },
  });

  return NextResponse.json(
    rows.map((p) => ({
      inventarId: p.inventarId.toString(),
      kodi: p.kodi ?? "",
      emri: p.emri,
      marka: p.marka ?? "",
      modeli: p.modeli ?? "",
      sasiaStok: p.sasiaStok,
      cmimiBlerje: p.cmimiBlerje.toString(),
      cmimiShitje: p.cmimiShitje.toString(),
      furnizuesId: p.furnizuesId?.toString() ?? "",
      furnizuesEmri: p.furnizues?.emri ?? "",
    }))
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const emri = String(body?.emri ?? "").trim();
  if (!emri) return NextResponse.json({ error: "Emri është i detyrueshëm" }, { status: 400 });

  const row = await prisma.inventarPjese.create({
    data: {
      kodi: body?.kodi ? String(body.kodi).trim() : null,
      emri,
      marka: body?.marka ? String(body.marka).trim() : null,
      modeli: body?.modeli ? String(body.modeli).trim() : null,
      sasiaStok: body?.sasiaStok ? Number(body.sasiaStok) : 0,
      cmimiBlerje: body?.cmimiBlerje !== "" && body?.cmimiBlerje != null ? Number(body.cmimiBlerje) : 0,
      cmimiShitje: body?.cmimiShitje !== "" && body?.cmimiShitje != null ? Number(body.cmimiShitje) : 0,
      furnizuesId: body?.furnizuesId ? BigInt(String(body.furnizuesId)) : null,
    },
  });

  return NextResponse.json({ ok: true, inventarId: row.inventarId.toString() });
}
