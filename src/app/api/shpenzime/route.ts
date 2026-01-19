import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function monthRange(ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return null;
  const [Y, M] = ym.split("-").map(Number);
  const start = new Date(Y, M - 1, 1);
  const end = new Date(Y, M, 1);
  return { start, end };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ym = (url.searchParams.get("ym") ?? "").trim();
  const q = (url.searchParams.get("q") ?? "").trim();
  const kategoria = (url.searchParams.get("kategoria") ?? "").trim();

  const range = ym ? monthRange(ym) : null;

  const rows = await prisma.shpenzim.findMany({
    where: {
      ...(range ? { data: { gte: range.start, lt: range.end } } : {}),
      ...(kategoria ? { kategoria } : {}),
      ...(q
        ? {
            OR: [
              { pershkrimi: { contains: q, mode: "insensitive" } },
              { furnizues: { contains: q, mode: "insensitive" } },
              { nrFature: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { data: "desc" },
  });

  return NextResponse.json(
    rows.map((s) => ({
      shpenzimId: s.shpenzimId.toString(),
      data: s.data.toISOString(),
      kategoria: s.kategoria,
      pershkrimi: s.pershkrimi ?? "",
      shuma: s.shuma.toString(),
      menyra: s.menyra ?? "",
      furnizues: s.furnizues ?? "",
      nrFature: s.nrFature ?? "",
    }))
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const kategoria = String(body?.kategoria ?? "").trim();
  const shuma = Number(body?.shuma ?? 0);

  if (!kategoria) return NextResponse.json({ error: "Kategoria është e detyrueshme" }, { status: 400 });
  if (!Number.isFinite(shuma) || shuma <= 0) return NextResponse.json({ error: "Shuma duhet të jetë > 0" }, { status: 400 });

  const data = body?.data ? new Date(String(body.data)) : new Date();

  const row = await prisma.shpenzim.create({
    data: {
      data,
      kategoria,
      pershkrimi: body?.pershkrimi ? String(body.pershkrimi).trim() : null,
      shuma,
      menyra: body?.menyra ? String(body.menyra) : null,
      furnizues: body?.furnizues ? String(body.furnizues).trim() : null,
      nrFature: body?.nrFature ? String(body.nrFature).trim() : null,
    },
  });

  return NextResponse.json({ ok: true, shpenzimId: row.shpenzimId.toString() });
}
