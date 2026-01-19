import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  const rows = await prisma.inspektim.findMany({
    where: q
      ? {
          OR: [
            { automjet: { targa: { contains: q, mode: "insensitive" } } },
            { automjet: { marka: { contains: q, mode: "insensitive" } } },
            { automjet: { modeli: { contains: q, mode: "insensitive" } } },
            { automjet: { klient: { emri: { contains: q, mode: "insensitive" } } } },
            { automjet: { klient: { mbiemri: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    orderBy: { data: "desc" },
    include: { automjet: { include: { klient: true } } },
    take: 300,
  });

  return NextResponse.json(
    rows.map((x) => ({
      inspektimId: x.inspektimId.toString(),
      data: x.data.toISOString(),
      statusi: x.statusi,
      km: x.km ? x.km.toString() : "",
      automjet: {
        automjetId: x.automjetId.toString(),
        marka: x.automjet.marka ?? "",
        modeli: x.automjet.modeli ?? "",
        viti: x.automjet.viti ?? "",
        targa: x.automjet.targa ?? "",
      },
      klient: {
        klientId: x.automjet.klientId.toString(),
        emri: x.automjet.klient.emri ?? "",
        mbiemri: x.automjet.klient.mbiemri ?? "",
        telefoni: x.automjet.klient.telefoni ?? "",
      },
    }))
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const automjetId = BigInt(String(body?.automjetId ?? "0").trim().replace(/n$/, ""));

  if (!automjetId || automjetId === BigInt(0)) {
    return NextResponse.json({ error: "automjetId është i detyrueshëm" }, { status: 400 });
  }

  const row = await prisma.inspektim.create({
    data: {
      automjetId,
      statusi: "Draft",
      km: null,
      komente: null,
      demtimeJson: null,
    },
  });

  return NextResponse.json({ ok: true, inspektimId: row.inspektimId.toString() });
}
