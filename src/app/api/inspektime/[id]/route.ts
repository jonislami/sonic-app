import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const inspektimId = BigInt(String(id).trim().replace(/n$/, ""));

    const x = await prisma.inspektim.findUnique({
      where: { inspektimId },
      include: {
        automjet: { include: { klient: true } },
        iteme: { orderBy: { itemId: "asc" }, include: { kategori: true } },
      },
    });

    if (!x) return NextResponse.json({ error: "Inspektimi nuk u gjet" }, { status: 404 });

    return NextResponse.json({
      inspektim: {
        inspektimId: x.inspektimId.toString(),
        data: x.data.toISOString(),
        statusi: x.statusi,
        km: x.km ? x.km.toString() : "",
        komente: x.komente ?? "",
        demtimeJson: x.demtimeJson ?? "",
        automjetId: x.automjetId.toString(),
      },
      automjet: {
        automjetId: x.automjet.automjetId.toString(),
        marka: x.automjet.marka ?? "",
        modeli: x.automjet.modeli ?? "",
        viti: x.automjet.viti ?? "",
        targa: x.automjet.targa ?? "",
        vin: x.automjet.vin ?? "",
        motori: x.automjet.motori ?? "",
        kmAktuale: x.automjet.kmAktuale ? x.automjet.kmAktuale.toString() : "",
        klient: {
          klientId: x.automjet.klient.klientId.toString(),
          emri: x.automjet.klient.emri ?? "",
          mbiemri: x.automjet.klient.mbiemri ?? "",
          telefoni: x.automjet.klient.telefoni ?? "",
          email: x.automjet.klient.email ?? "",
        },
      },
      iteme: x.iteme.map((i) => ({
  key: i.key,
  grup: i.grup,
  etikete: i.etikete,
  status: i.status,
  kategoriId: i.kategoriId ? i.kategoriId.toString() : null,
})),

    });
  } catch (e: any) {
    console.error("GET /api/inspektime/[id] error:", e);
    return NextResponse.json({ error: "Gabim", detail: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const inspektimId = BigInt(String(id).trim().replace(/n$/, ""));
    const body = await req.json().catch(() => ({}));

    await prisma.inspektim.update({
      where: { inspektimId },
      data: {
        ...(body?.km !== undefined ? { km: body.km ? BigInt(String(body.km)) : null } : {}),
        ...(body?.komente !== undefined ? { komente: String(body.komente ?? "").trim() || null } : {}),
        ...(body?.statusi !== undefined ? { statusi: String(body.statusi ?? "Draft") } : {}),
        ...(body?.demtimeJson !== undefined ? { demtimeJson: String(body.demtimeJson ?? "") || null } : {}),
      },
    });

    const items = Array.isArray(body?.iteme) ? body.iteme : [];
for (const it of items) {
  const key = String(it?.key ?? "").trim();
  if (!key) continue;

  const kategoriIdRaw = it?.kategoriId ?? null;
  const kategoriId =
    kategoriIdRaw !== null && kategoriIdRaw !== undefined && String(kategoriIdRaw).trim() !== ""
      ? BigInt(String(kategoriIdRaw))
      : null;

  await prisma.inspektimItem.upsert({
    where: { inspektimId_key: { inspektimId, key } },
    create: {
      inspektimId,
      kategoriId,
      grup: String(it?.grup ?? "").trim(),
      key,
      etikete: String(it?.etikete ?? "").trim(),
      status: String(it?.status ?? "OK").trim(),
    },
    update: {
      kategoriId,
      grup: String(it?.grup ?? "").trim(),
      etikete: String(it?.etikete ?? "").trim(),
      status: String(it?.status ?? "OK").trim(),
    },
  });
}


    // ✅ Sync: fshi itemet që nuk janë më në UI


    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("PATCH /api/inspektime/[id] error:", e);
    return NextResponse.json({ error: "Gabim", detail: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const inspektimId = BigInt(String(id).trim().replace(/n$/, ""));
    await prisma.inspektim.delete({ where: { inspektimId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/inspektime/[id] error:", e);
    return NextResponse.json({ error: "Gabim", detail: String(e?.message ?? e) }, { status: 500 });
  }
}
