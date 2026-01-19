import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  try {
    await prisma.klient.delete({ where: { klientId: BigInt(id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "S’mund të fshihet (mund të ketë automjete të lidhura)." },
      { status: 400 }
    );
  }
}
