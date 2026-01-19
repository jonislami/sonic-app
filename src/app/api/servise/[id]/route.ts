import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const servisId = BigInt(id);

    // fshi të lidhurat (children)
    await prisma.puneServisi.deleteMany({ where: { servisId } });
    await prisma.pjeseServisi.deleteMany({ where: { servisId } });
    await prisma.pagesaServisi.deleteMany({ where: { servisId } });

    // nëse ke krijuar faturë nga ky servis, mund ta fshijë linkun servisId (që mos bllokohet)
    await prisma.fakture.updateMany({
      where: { servisId },
      data: { servisId: null },
    });

    // pastaj fshi servisin
    await prisma.servis.delete({ where: { servisId } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Delete servis error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë fshirjes së servisit", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
