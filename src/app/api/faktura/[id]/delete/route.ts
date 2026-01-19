import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const faktureId = BigInt(id);

    // fshi gjithçka të lidhur
    await prisma.faktureRresht.deleteMany({ where: { faktureId } });
    await prisma.fakturePagesa.deleteMany({ where: { faktureId } });

    // pastaj fshi faturën
    await prisma.fakture.delete({ where: { faktureId } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Delete fakture error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë fshirjes së faturës", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
