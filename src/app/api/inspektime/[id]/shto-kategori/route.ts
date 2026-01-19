import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const inspektimId = BigInt(id);

  const body = await req.json().catch(() => ({}));
  const kategoriId = BigInt(String(body?.kategoriId ?? "0"));

  if (!kategoriId) return NextResponse.json({ error: "kategoriId mungon" }, { status: 400 });

  const kategori = await prisma.inspektimKategori.findUnique({
    where: { kategoriId },
    include: { iteme: { orderBy: { renditja: "asc" } } },
  });

  if (!kategori) return NextResponse.json({ error: "Kategoria nuk u gjet" }, { status: 404 });

  // krijo iteme (skip duplicates)
  const data = kategori.iteme.map((it) => ({
    inspektimId,
    grup: kategori.emri,
    key: it.key,
    etikete: it.etikete,
    status: "OK",
    kategoriId: kategori.kategoriId,
  }));

  // createMany s’respekton unique pa skipDuplicates
  await prisma.inspektimItem.createMany({
    data,
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, shtuar: data.length });
}
