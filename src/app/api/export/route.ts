import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


function toCsv(rows: any[]) {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);

  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    // escape double quotes
    const q = s.replace(/"/g, '""');
    // wrap in quotes if needed
    return /[",\n]/.test(q) ? `"${q}"` : q;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];

  return lines.join("\n");
}

function asTextDate(d: any) {
  try {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toISOString();
  } catch {
    return String(d ?? "");
  }
}

function money(v: any) {
  if (v === null || v === undefined) return "";
  return Number(String(v)).toFixed(2);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const table = (url.searchParams.get("table") ?? "").trim();
  const format = (url.searchParams.get("format") ?? "csv").trim(); // csv | xlsx

  if (!table) return NextResponse.json({ error: "Mungon table" }, { status: 400 });
  if (!["csv", "xlsx"].includes(format)) return NextResponse.json({ error: "format duhet csv ose xlsx" }, { status: 400 });

  let rows: any[] = [];
  let filename = `${table}.${format}`;

  // ====== KLIENTE ======
  if (table === "kliente") {
    const data = await prisma.klient.findMany({ orderBy: { klientId: "asc" } });
    rows = data.map((k) => ({
      klientId: k.klientId.toString(),
      emri: k.emri,
      mbiemri: k.mbiemri ?? "",
      telefoni: k.telefoni ?? "",
      email: k.email ?? "",
      adresa: k.adresa ?? "",
      dataRegjistrimit: asTextDate(k.dataRegjistrimit),
    }));
    filename = `kliente.${format}`;
  }

  // ====== AUTOMJETE ======
  else if (table === "automjete") {
    const data = await prisma.automjet.findMany({
      orderBy: { automjetId: "asc" },
      include: { klient: true },
    });
    rows = data.map((a) => ({
      automjetId: a.automjetId.toString(),
      klientId: a.klientId.toString(),
      klient: `${a.klient.emri} ${a.klient.mbiemri ?? ""}`.trim(),
      marka: a.marka ?? "",
      modeli: a.modeli ?? "",
      viti: a.viti ?? "",
      targa: a.targa ?? "",
      vin: a.vin ?? "",
      motori: a.motori ?? "",
      kmAktuale: a.kmAktuale ? a.kmAktuale.toString() : "",
    }));
    filename = `automjete.${format}`;
  }

  // ====== SERVISE ======
  else if (table === "servise") {
    const data = await prisma.servis.findMany({
      orderBy: { servisId: "asc" },
      include: { automjet: { include: { klient: true } } },
    });

    rows = data.map((s) => ({
      servisId: s.servisId.toString(),
      automjetId: s.automjetId.toString(),
      klient: `${s.automjet.klient.emri} ${s.automjet.klient.mbiemri ?? ""}`.trim(),
      automjet: `${s.automjet.marka ?? ""} ${s.automjet.modeli ?? ""} ${s.automjet.viti ?? ""}`.trim(),
      targa: s.automjet.targa ?? "",
      dataServisit: asTextDate(s.dataServisit),
      kmNeServis: s.kmNeServis ? s.kmNeServis.toString() : "",
      statusi: s.statusi,
      pershkrimi: s.pershkrimi ?? "",
    }));
    filename = `servise.${format}`;
  }

  // ====== FAKTURA ======
  else if (table === "faktura") {
    const data = await prisma.fakture.findMany({
      orderBy: { faktureId: "asc" },
      include: { klient: true, automjet: true, rreshta: true, pagesa: true },
    });

    rows = data.map((f) => {
      const total = f.rreshta.reduce((s, r) => s + Number(r.totali.toString()), 0);
      const paguar = f.pagesa.reduce((s, p) => s + Number(p.shuma.toString()), 0);
      const borxh = total - paguar;

      return {
        faktureId: f.faktureId.toString(),
        nrFakture: f.nrFakture,
        data: asTextDate(f.data),
        statusi: f.statusi,
        valuta: f.valuta,
        klientId: f.klientId.toString(),
        klient: `${f.klient.emri} ${f.klient.mbiemri ?? ""}`.trim(),
        automjetId: f.automjetId ? f.automjetId.toString() : "",
        automjet: f.automjet ? `${f.automjet.marka ?? ""} ${f.automjet.modeli ?? ""} ${f.automjet.viti ?? ""}`.trim() : "",
        targa: f.automjet?.targa ?? "",
        servisId: f.servisId ? f.servisId.toString() : "",
        total: money(total),
        paguar: money(paguar),
        borxh: money(borxh),
        shenim: f.shenim ?? "",
      };
    });

    filename = `faktura.${format}`;
  }

  // ====== SHPENZIME ======
  else if (table === "shpenzime") {
    const data = await prisma.shpenzim.findMany({ orderBy: { data: "desc" } });
    rows = data.map((s) => ({
      shpenzimId: s.shpenzimId.toString(),
      data: asTextDate(s.data),
      kategoria: s.kategoria,
      shuma: money(s.shuma),
      menyra: s.menyra ?? "",
      furnizues: s.furnizues ?? "",
      nrFature: s.nrFature ?? "",
      pershkrimi: s.pershkrimi ?? "",
    }));
    filename = `shpenzime.${format}`;
  }

  // ====== INVENTAR ======
  else if (table === "inventar") {
    const data = await prisma.inventarPjese.findMany({
      orderBy: { inventarId: "asc" },
      include: { furnizues: true },
    });

    rows = data.map((p) => ({
      inventarId: p.inventarId.toString(),
      kodi: p.kodi ?? "",
      emri: p.emri,
      marka: p.marka ?? "",
      modeli: p.modeli ?? "",
      furnizuesId: p.furnizuesId ? p.furnizuesId.toString() : "",
      furnizues: p.furnizues?.emri ?? "",
      sasiaStok: p.sasiaStok,
      cmimiBlerje: money(p.cmimiBlerje),
      cmimiShitje: money(p.cmimiShitje),
    }));
    filename = `inventar.${format}`;
  }

  else {
    return NextResponse.json({ error: "table i panjohur" }, { status: 400 });
  }

  // ====== CSV ======
  if (format === "csv") {
    const csv = toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // ====== XLSX ======
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, table);

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
