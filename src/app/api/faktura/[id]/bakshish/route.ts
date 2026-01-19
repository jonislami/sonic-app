import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const faktureId = BigInt(id);

    const body = await req.json().catch(() => ({}));
    const shuma = Number(body?.shuma ?? 0);
    const menyra = String(body?.menyra ?? "Cash").trim();
    const shenim = body?.shenim ? String(body.shenim).trim() : null;
    const data = body?.data ? new Date(String(body.data)) : new Date();

    if (!Number.isFinite(shuma) || shuma <= 0) {
      return NextResponse.json({ error: "Shuma e bakshishit duhet të jetë > 0" }, { status: 400 });
    }

    await prisma.bakshish.create({
      data: {
        faktureId,
        shuma,
        menyra,
        shenim,
        data,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Gabim duke shtuar bakshish", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
