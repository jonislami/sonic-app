import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await prisma.klient.findMany({
    orderBy: { klientId: "desc" },
  });

  const data = rows.map((k) => ({
    ...k,
    klientId: k.klientId.toString(),
    dataRegjistrimit: k.dataRegjistrimit.toISOString(),
  }));

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const emri = String(body?.emri ?? "").trim();
  if (!emri) {
    return NextResponse.json({ error: "Emri është i detyrueshëm" }, { status: 400 });
  }

  const klient = await prisma.klient.create({
    data: {
      emri,
      mbiemri: body?.mbiemri ? String(body.mbiemri).trim() : null,
      telefoni: body?.telefoni ? String(body.telefoni).trim() : null,
      email: body?.email ? String(body.email).trim() : null,
      adresa: body?.adresa ? String(body.adresa).trim() : null,
    },
  });

  return NextResponse.json({ ok: true, klientId: klient.klientId.toString() });
}
