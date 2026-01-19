import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const automjetId = BigInt(id);
    const body = await req.json().catch(() => ({}));

    await prisma.automjet.update({
      where: { automjetId },
      data: {
        marka: body?.marka ? String(body.marka).trim() : null,
        modeli: body?.modeli ? String(body.modeli).trim() : null,
        viti: body?.viti ? Number(body.viti) : null,
        targa: body?.targa ? String(body.targa).trim() : null,
        vin: body?.vin ? String(body.vin).trim() : null,
        motori: body?.motori ? String(body.motori).trim() : null,
        kmAktuale: body?.kmAktuale ? BigInt(String(body.kmAktuale)) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("PATCH /api/automjete/[id] error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë ruajtjes së automjetit", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const automjetId = BigInt(id);

    // kontrollo a ka servise (nëse po, shfaq mesazh të qartë)
    const count = await prisma.servis.count({ where: { automjetId } });
    if (count > 0) {
      return NextResponse.json(
        {
          error:
            "Nuk mund të fshihet automjeti sepse ka servise të lidhura. Fshiji serviset fillimisht.",
        },
        { status: 400 }
      );
    }

    await prisma.automjet.delete({ where: { automjetId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/automjete/[id] error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë fshirjes së automjetit", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}


export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const automjetId = BigInt(String(id).trim().replace(/n$/, ""));

    const a = await prisma.automjet.findUnique({
      where: { automjetId },
      include: { klient: true },
    });

    if (!a) {
      return NextResponse.json({ error: "Automjeti nuk u gjet" }, { status: 404 });
    }

    return NextResponse.json({
      automjet: {
        automjetId: a.automjetId.toString(),
        marka: a.marka ?? "",
        modeli: a.modeli ?? "",
        viti: a.viti ?? null,
        targa: a.targa ?? "",
        vin: a.vin ?? "",
        motori: a.motori ?? "",
        kmAktuale: a.kmAktuale ? a.kmAktuale.toString() : "",
        klientId: a.klientId.toString(),
        klient: {
          klientId: a.klient.klientId.toString(),
          emri: a.klient.emri ?? "",
          mbiemri: a.klient.mbiemri ?? "",
          telefoni: a.klient.telefoni ?? "",
          email: a.klient.email ?? "",
        },
      },
    });
  } catch (e: any) {
    console.error("GET /api/automjete/[id] error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë marrjes së automjetit", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
