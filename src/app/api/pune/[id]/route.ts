import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  await prisma.puneServisi.delete({ where: { puneId: BigInt(id) } });
  return NextResponse.json({ ok: true });
}
