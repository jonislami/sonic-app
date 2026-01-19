import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const kategoriItemId = BigInt(id);
    const body = await req.json().catch(() => ({}));

    await prisma.inspektimKategoriItem.update({
      where: { kategoriItemId },
      data: {
        ...(body?.key !== undefined ? { key: String(body.key ?? "").trim() } : {}),
        ...(body?.etikete !== undefined ? { etikete: String(body.etikete ?? "").trim() } : {}),
        ...(body?.renditja !== undefined ? { renditja: Number(body.renditja ?? 0) } : {}),
        ...(body?.aktiv !== undefined ? { aktiv: Boolean(body.aktiv) } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("PATCH /api/inspekt-kategori-item/[id] error:", e);
    return NextResponse.json({ error: "Gabim" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const kategoriItemId = BigInt(id);

    await prisma.inspektimKategoriItem.delete({ where: { kategoriItemId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/inspekt-kategori-item/[id] error:", e);
    return NextResponse.json({ error: "Gabim" }, { status: 500 });
  }
}
