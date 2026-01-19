import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.fakturePagesa.delete({ where: { pagesaId: BigInt(id) } });
  return NextResponse.json({ ok: true });
}
