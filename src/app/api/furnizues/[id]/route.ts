import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const furnizuesId = BigInt(String(id).trim());
    const body = await req.json().catch(() => ({}));

    const emri = body?.emri !== undefined ? String(body.emri).trim() : undefined;
    const telefoni = body?.telefoni !== undefined ? String(body.telefoni).trim() : undefined;
    const email = body?.email !== undefined ? String(body.email).trim() : undefined;
    const adresa = body?.adresa !== undefined ? String(body.adresa).trim() : undefined;

    if (emri !== undefined && !emri) {
      return NextResponse.json({ error: "Emri është i detyrueshëm" }, { status: 400 });
    }

    await prisma.furnizues.update({
      where: { furnizuesId },
      data: {
        ...(emri !== undefined ? { emri } : {}),
        ...(telefoni !== undefined ? { telefoni: telefoni || null } : {}),
        ...(email !== undefined ? { email: email || null } : {}),
        ...(adresa !== undefined ? { adresa: adresa || null } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("PATCH /api/furnizues/[id] error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë ruajtjes së furnizuesit", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const furnizuesId = BigInt(String(id).trim());

    // nëse ke inventar të lidhur, Prisma do e ndalojë fshirjen (ose SetNull në inventar)
    await prisma.furnizues.delete({ where: { furnizuesId } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/furnizues/[id] error:", e);
    return NextResponse.json(
      { error: "Gabim gjatë fshirjes së furnizuesit", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
