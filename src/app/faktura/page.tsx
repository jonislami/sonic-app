"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Klient = { klientId: string; emri: string; mbiemri: string | null; telefoni: string | null };
type Automjet = { automjetId: string; klientId: string; marka: string | null; modeli: string | null; viti: number | null; targa: string | null };

type Row = {
  faktureId: string;
  nrFakture: string;
  data: string;
  statusi: string;
  valuta: string;
  klient: { emri: string; mbiemri: string | null; telefoni: string | null };
  automjet: { marka: string | null; modeli: string | null; viti: number | null; targa: string | null } | null;
  total: string;
  paguar: string;
  borxh: string;
};

export default function FakturaListPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [kliente, setKliente] = useState<Klient[]>([]);
  const [automjete, setAutomjete] = useState<Automjet[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [klientId, setKlientId] = useState("");
  const [automjetId, setAutomjetId] = useState("");
  const [shenim, setShenim] = useState("");

  async function load() {
    setLoading(true);
    const [fRes, kRes, aRes] = await Promise.all([fetch("/api/faktura"), fetch("/api/kliente"), fetch("/api/automjete")]);
    setItems(await fRes.json());
    setKliente(await kRes.json());
    setAutomjete(await aRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const automjeteForClient = useMemo(() => {
    if (!klientId) return [];
    return automjete.filter((a) => a.klientId === klientId);
  }, [automjete, klientId]);

  async function createFature(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/faktura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ klientId, automjetId, shenim }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.error ?? "Gabim");
      return;
    }

    setKlientId("");
    setAutomjetId("");
    setShenim("");
    await load();
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h1 className="text-2xl font-semibold">Faktura</h1>
        <p className="text-sm text-gray-700">Krijo faturë manuale ose hap faturat ekzistuese.</p>
      </div>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Krijo faturë (manuale)</h2>

        <form className="mt-3 grid gap-2 md:grid-cols-2" onSubmit={createFature}>
          <select className="rounded-lg border px-3 py-2 md:col-span-2" value={klientId} onChange={(e) => { setKlientId(e.target.value); setAutomjetId(""); }}>
            <option value="">Zgjedh klientin *</option>
            {kliente.map((k) => (
              <option key={k.klientId} value={k.klientId}>
                {k.emri} {k.mbiemri ?? ""} {k.telefoni ? `- ${k.telefoni}` : ""}
              </option>
            ))}
          </select>

          <select className="rounded-lg border px-3 py-2 md:col-span-2" value={automjetId} onChange={(e) => setAutomjetId(e.target.value)} disabled={!klientId}>
            <option value="">Automjeti (opsional)</option>
            {automjeteForClient.map((a) => (
              <option key={a.automjetId} value={a.automjetId}>
                {[a.marka, a.modeli, a.viti].filter(Boolean).join(" ")} {a.targa ? `- ${a.targa}` : ""}
              </option>
            ))}
          </select>

          <input className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="Shënim (ops.)" value={shenim} onChange={(e) => setShenim(e.target.value)} />

          {err ? <div className="text-sm text-red-600 md:col-span-2">{err}</div> : null}
          <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-2" disabled={!klientId}>
            Krijo faturë
          </button>
        </form>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Lista</h2>

        {loading ? (
          <div className="mt-2 text-sm text-gray-700">Duke ngarku…</div>
        ) : items.length === 0 ? (
          <div className="mt-2 text-sm text-gray-700">S’ka fatura.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-800">
                <tr>
                  <th className="py-2">Nr</th>
                  <th>Data</th>
                  <th>Klienti</th>
                  <th>Automjeti</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Paguar</th>
                  <th>Borxh</th>
                  <th className="text-right">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.faktureId} className="border-b">
                    <td className="py-2 font-semibold">{f.nrFakture}</td>
                    <td>{new Date(f.data).toLocaleDateString()}</td>
                    <td>{f.klient.emri} {f.klient.mbiemri ?? ""}</td>
                    <td>{f.automjet ? [f.automjet.marka, f.automjet.modeli, f.automjet.viti].filter(Boolean).join(" ") : "—"}</td>
                    <td>{f.statusi}</td>
                    <td>{Number(f.total).toFixed(2)} €</td>
                    <td>{Number(f.paguar).toFixed(2)} €</td>
                    <td className={Number(f.borxh) <= 0 ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
                      {Number(f.borxh).toFixed(2)} €
                    </td>
                    <td className="text-right">
                      <Link className="rounded-lg border px-2 py-1 hover:bg-gray-50" href={`/faktura/${f.faktureId}`}>
                        Hape
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
