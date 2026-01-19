import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

function toDec(x: any) {
  const n = Number(String(x ?? "0").replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const faktureId = BigInt(id);

    const body = await req.json().catch(() => ({}));
    const zbritje = toDec(body?.zbritje);

    await prisma.fakture.update({
      where: { faktureId },
      data: { zbritje },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("PATCH /api/faktura/[id]/zbritje error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë ruajtjes së zbritjes", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
