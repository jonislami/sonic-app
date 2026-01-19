import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const pjeseId = BigInt(id);

    const row = await prisma.pjeseServisi.findUnique({ where: { pjeseId } });
    if (!row) return NextResponse.json({ error: "Nuk u gjet" }, { status: 404 });

    // nëse ishte pjesë nga inventari, kthe stokun + levizje
    if (row.inventarId) {
      const inventarId = row.inventarId;

      await prisma.$transaction(async (tx) => {
        await tx.pjeseServisi.delete({ where: { pjeseId } });

        const item = await tx.inventarPjese.findUnique({ where: { inventarId } });
        if (item) {
          await tx.inventarPjese.update({
            where: { inventarId },
            data: { sasiaStok: item.sasiaStok + row.sasia },
          });

          await tx.inventarLevizje.create({
            data: {
              inventarId,
              tipi: "HYRJE",
              sasia: row.sasia,
              cmimi: Number(item.cmimiBlerje.toString()),
              shenim: `Kthim nga fshirja e Pjesës (Servis #${row.servisId.toString()})`,
              servisId: row.servisId,
            },
          });
        }
      });

      return NextResponse.json({ ok: true });
    }

    // manual: vetëm fshi
    await prisma.pjeseServisi.delete({ where: { pjeseId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE pjeseServisi error:", e);
    return NextResponse.json({ error: "Gabim duke fshirë pjesën", detail: String(e?.message ?? e) }, { status: 500 });
  }
}
