import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await prisma.inventarPjese.findMany({
    orderBy: { emri: "asc" },
    select: {
      inventarId: true,
      emri: true,
      kodi: true,
      marka: true,
      modeli: true,
      sasiaStok: true,
      cmimiShitje: true,
      cmimiBlerje: true,
    },
  });

  return NextResponse.json(
    rows.map((x) => ({
      inventarId: x.inventarId.toString(),
      emri: x.emri,
      kodi: x.kodi ?? "",
      marka: x.marka ?? "",
      modeli: x.modeli ?? "",
      sasiaStok: x.sasiaStok,
      cmimiShitje: x.cmimiShitje.toString(),
      cmimiBlerje: x.cmimiBlerje.toString(),
    }))
  );
}
