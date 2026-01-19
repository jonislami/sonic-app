import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const rows = await prisma.automjet.findMany({
      include: { klient: true },
      orderBy: { automjetId: "desc" },
    });

    const data = rows.map((a) => ({
      automjetId: a.automjetId.toString(),
      klientId: a.klientId.toString(),
      marka: a.marka ?? "",
      modeli: a.modeli ?? "",
      viti: a.viti ?? null,
      targa: a.targa ?? "",
      vin: a.vin ?? "",
      motori: a.motori ?? "", // ✅ SHTUAR
      kmAktuale: a.kmAktuale ? a.kmAktuale.toString() : "",
      klient: {
        klientId: a.klient.klientId.toString(),
        emri: a.klient.emri ?? "",
        mbiemri: a.klient.mbiemri ?? "",
        telefoni: a.klient.telefoni ?? "",
        email: a.klient.email ?? "",
      },
    }));

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("GET /api/automjete error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë marrjes së automjeteve", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const klientIdStr = String(body?.klientId ?? "").trim();
    if (!klientIdStr) {
      return NextResponse.json({ error: "Klienti është i detyrueshëm" }, { status: 400 });
    }

    const klientId = BigInt(klientIdStr);

    const marka = String(body?.marka ?? "").trim();
    const modeli = String(body?.modeli ?? "").trim();
    const viti = body?.viti !== undefined && body?.viti !== null && String(body.viti).trim() !== ""
      ? Number(body.viti)
      : null;
    const targa = String(body?.targa ?? "").trim();
    const vin = String(body?.vin ?? "").trim();

    const motori = String(body?.motori ?? "").trim(); // ✅ SHTUAR

    const row = await prisma.automjet.create({
      data: {
        klientId,
        marka: marka || null,
        modeli: modeli || null,
        viti,
        targa: targa || null,
        vin: vin || null,
        motori: motori || null, // ✅ SHTUAR
      },
    });

    return NextResponse.json({ ok: true, automjetId: row.automjetId.toString() });
  } catch (e: any) {
    console.error("POST /api/automjete error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë krijimit të automjetit", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
