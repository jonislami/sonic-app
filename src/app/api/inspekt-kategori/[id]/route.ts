import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const kategoriId = BigInt(id);
    const body = await req.json().catch(() => ({}));

    await prisma.inspektimKategori.update({
      where: { kategoriId },
      data: {
        ...(body?.emri !== undefined ? { emri: String(body.emri ?? "").trim() } : {}),
        ...(body?.pershkrimi !== undefined ? { pershkrimi: String(body.pershkrimi ?? "").trim() || null } : {}),
        ...(body?.renditja !== undefined ? { renditja: Number(body.renditja ?? 0) } : {}),
        ...(body?.aktiv !== undefined ? { aktiv: Boolean(body.aktiv) } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("PATCH /api/inspekt-kategori/[id] error:", e);
    return NextResponse.json({ error: "Gabim" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const kategoriId = BigInt(id);

    await prisma.inspektimKategori.delete({ where: { kategoriId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/inspekt-kategori/[id] error:", e);
    return NextResponse.json({ error: "Gabim" }, { status: 500 });
  }
}
