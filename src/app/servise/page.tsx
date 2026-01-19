"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Row = {
  servisId: string;
  dataServisit: string;
  statusi: string;
  kmNeServis: string | null;
  pershkrimi: string | null;
  klient: { emri: string; mbiemri: string | null; telefoni: string | null };
  automjet: { marka: string | null; modeli: string | null; viti: number | null; targa: string | null };
  total: string;
  paguar: string;
  borxh: string;
};

export default function ServiseListPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusi, setStatusi] = useState("");
  const [ym, setYm] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (statusi) params.set("statusi", statusi);
    if (ym) params.set("ym", ym);

    const res = await fetch(`/api/servise?${params.toString()}`);
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const sum = useMemo(() => {
    const total = items.reduce((s, x) => s + Number(x.total), 0);
    const paguar = items.reduce((s, x) => s + Number(x.paguar), 0);
    return { total, paguar, borxh: total - paguar };
  }, [items]);

  async function delServis(id: string) {
  if (!confirm("Me fshi këtë servis?")) return;

  const res = await fetch(`/api/servise/${id}`, {
    method: "DELETE",
  });

  const d = await res.json().catch(() => ({}));

  if (!res.ok) {
    alert(d?.detail ?? d?.error ?? "Gabim gjatë fshirjes së servisit");
    return;
  }

  // rifresko listën
  window.location.reload();
}


  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Servise</h1>
          <p className="text-sm text-gray-700">Kërko dhe filtro të gjitha serviset.</p>
        </div>

        <div className="text-right text-sm">
          <div className="text-gray-700">Totali: <span className="font-semibold">{sum.total.toFixed(2)} €</span></div>
          <div className="text-gray-700">Paguar: <span className="font-semibold">{sum.paguar.toFixed(2)} €</span></div>
          <div className={`font-semibold ${sum.borxh <= 0 ? "text-green-700" : "text-red-700"}`}>
            Borxh: {sum.borxh.toFixed(2)} €
          </div>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Kërko (klient/targë/VIN)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="rounded-lg border px-3 py-2" value={statusi} onChange={(e) => setStatusi(e.target.value)}>
          <option value="">Të gjitha statuset</option>
          <option value="Hap">Hap</option>
          <option value="Mbyllur">Mbyllur</option>
        </select>
        <input
          className="rounded-lg border px-3 py-2"
          type="month"
          value={ym}
          onChange={(e) => setYm(e.target.value)}
        />
        <button className="rounded-lg bg-black px-3 py-2 text-white" onClick={load}>
          Filtro
        </button>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Lista</h2>

        {loading ? (
          <div className="mt-2 text-sm text-gray-700">Duke ngarku…</div>
        ) : items.length === 0 ? (
          <div className="mt-2 text-sm text-gray-700">S’ka servise.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-800">
                <tr>
                  <th className="py-2">Data</th>
                  <th>Klienti</th>
                  <th>Automjeti</th>
                  <th>Targa</th>
                  <th>Status</th>
                  <th>Total (€)</th>
                  <th>Paguar (€)</th>
                  <th>Borxh (€)</th>
                  <th className="text-right">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.servisId} className="border-b align-top">
                    <td className="py-2">{new Date(s.dataServisit).toLocaleDateString()}</td>
                    <td>
                      {s.klient.emri} {s.klient.mbiemri ?? ""}
                      {s.klient.telefoni ? <div className="text-gray-700">{s.klient.telefoni}</div> : null}
                    </td>
                    <td>{[s.automjet.marka, s.automjet.modeli, s.automjet.viti].filter(Boolean).join(" ")}</td>
                    <td>{s.automjet.targa ?? ""}</td>
                    <td>{s.statusi}</td>
                    <td>{Number(s.total).toFixed(2)}</td>
                    <td>{Number(s.paguar).toFixed(2)}</td>
                    <td className={Number(s.borxh) <= 0 ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
                      {Number(s.borxh).toFixed(2)}
                    </td>
                    <td className="text-right">
                      <Link className="rounded-lg border px-2 py-1 hover:bg-gray-50" href={`/servise/${s.servisId}`}>
                        Hape
                      </Link> 
                      
                      <button
                        className="rounded-lg border px-2 py-1 hover:bg-gray-50"
                        onClick={() => delServis(s.servisId)}
                      >
                        Fshi
                      </button>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
