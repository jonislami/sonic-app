"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function InspektListPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Shto inspekt
  const [automjete, setAutomjete] = useState<any[]>([]);
  const [automjetId, setAutomjetId] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);

    const res = await fetch(`/api/inspektime?q=${encodeURIComponent(q)}`);
    const d = await res.json().catch(() => []);

    if (!res.ok) {
      setErr(d?.error ?? "Gabim");
      setItems([]);
      setLoading(false);
      return;
    }

    setItems(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  async function loadAutomjete() {
    const res = await fetch("/api/automjete");
    const d = await res.json().catch(() => []);
    setAutomjete(Array.isArray(d) ? d : []);
  }

  useEffect(() => {
    load();
    loadAutomjete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Inspekte</h1>
          <p className="text-sm text-gray-700">Lista e inspektimeve + krijo të re.</p>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Kërko (klient / targa / marka / modeli)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <button className="rounded-lg bg-black px-3 py-2 text-white" onClick={load}>
          Kërko
        </button>

        <div className="rounded-lg border p-2 bg-white flex gap-2 items-center">
          <select
            className="rounded-lg border px-3 py-2 w-full"
            value={automjetId}
            onChange={(e) => setAutomjetId(e.target.value)}
          >
            <option value="">Zgjedh automjet për inspekt të ri</option>

            {automjete.map((a) => (
              <option key={a.automjetId} value={a.automjetId}>
                {a.marka ?? ""} {a.modeli ?? ""} {a.viti ?? ""} - {a.targa ?? ""}{" "}
                (Klient: {(a.klient?.emri ?? a.klientEmri ?? "")} {(a.klient?.mbiemri ?? a.klientMbiemri ?? "")})
              </option>
            ))}
          </select>

          <Link
            className={`rounded-lg px-3 py-2 text-white ${
              automjetId ? "bg-black" : "bg-gray-400 pointer-events-none"
            }`}
            href={automjetId ? `/inspekt/automjet/${automjetId}` : "#"}
          >
            Shto
          </Link>
        </div>
      </div>

      {err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Lista</h2>
          <div className="text-sm text-gray-700">
            {loading ? "Duke ngarku…" : `${items.length} inspekt(e)`}
          </div>
        </div>

        {loading ? (
          <div className="mt-2 text-sm text-gray-700">Duke ngarku…</div>
        ) : items.length === 0 ? (
          <div className="mt-2 text-sm text-gray-700">S’ka inspekte.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-800">
                <tr>
                  <th className="py-2">Data</th>
                  <th>Klienti</th>
                  <th>Automjeti</th>
                  <th>Targa</th>
                  <th>Statusi</th>
                  <th className="text-right">Veprime</th>
                </tr>
              </thead>

              <tbody>
                {items.map((x) => (
                  <tr key={x.inspektimId} className="border-b">
                    <td className="py-2">{new Date(x.data).toLocaleString()}</td>
                    <td>
                      {x.klient?.emri ?? ""} {x.klient?.mbiemri ?? ""}
                    </td>
                    <td>
                      {x.automjet?.marka ?? ""} {x.automjet?.modeli ?? ""} {x.automjet?.viti ?? ""}
                    </td>
                    <td>{x.automjet?.targa ?? ""}</td>
                    <td>{x.statusi ?? "Draft"}</td>
                    <td className="text-right">
                     <Link
  className="rounded-lg border px-2 py-1 hover:bg-gray-50"
  href={`/inspekt/${x.inspektimId}`}
>
  Hape
</Link>

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
