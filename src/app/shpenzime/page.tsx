"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  shpenzimId: string;
  data: string;
  kategoria: string;
  pershkrimi: string;
  shuma: string;
  menyra: string;
  furnizues: string;
  nrFature: string;
};

function thisMonthYM() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const KATEGORITE = ["Qira", "Rryma", "Vegla", "Marketing", "Rroga", "Taksa", "Tjeter"];
const MENYRAT = ["Cash", "Transfer", "Kartel"];

export default function ShpenzimePage() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [ym, setYm] = useState(thisMonthYM());
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("");

  // add form
  const [aData, setAData] = useState("");
  const [aKat, setAKat] = useState("Qira");
  const [aPersh, setAPersh] = useState("");
  const [aShuma, setAShuma] = useState("");
  const [aMenyra, setAMenyra] = useState("Cash");
  const [aFurn, setAFurn] = useState("");
  const [aNr, setANr] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);
    const params = new URLSearchParams();
    if (ym) params.set("ym", ym);
    if (q.trim()) params.set("q", q.trim());
    if (kat) params.set("kategoria", kat);

    const res = await fetch(`/api/shpenzime?${params.toString()}`);
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

  useEffect(() => { load(); }, [ym]);

  const total = useMemo(() => items.reduce((s, x) => s + Number(x.shuma || 0), 0), [items]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/shpenzime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: aData || null,
        kategoria: aKat,
        pershkrimi: aPersh,
        shuma: aShuma,
        menyra: aMenyra,
        furnizues: aFurn,
        nrFature: aNr,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(d?.error ?? "Gabim"); return; }

    setAData(""); setAKat("Qira"); setAPersh(""); setAShuma(""); setAMenyra("Cash"); setAFurn(""); setANr("");
    await load();
  }

  async function del(id: string) {
    if (!confirm("Me fshi shpenzimin?")) return;
    const res = await fetch(`/api/shpenzime/${id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { alert(d?.error ?? "S’u fshi"); return; }
    await load();
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shpenzime</h1>
          <p className="text-sm text-gray-700">Qira, rryma, vegla, marketing… (EUR)</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-700">Totali i muajit</div>
          <div className="text-xl font-semibold">{total.toFixed(2)} €</div>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <input className="rounded-lg border px-3 py-2" type="month" value={ym} onChange={(e) => setYm(e.target.value)} />
        <select className="rounded-lg border px-3 py-2" value={kat} onChange={(e) => setKat(e.target.value)}>
          <option value="">Të gjitha kategoritë</option>
          {KATEGORITE.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <input className="rounded-lg border px-3 py-2" placeholder="Kërko (përshkrim/furnizues/nr)..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="rounded-lg bg-black px-3 py-2 text-white" onClick={load}>Filtro</button>
      </div>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Shto shpenzim</h2>

        <form className="mt-3 grid gap-2 md:grid-cols-6" onSubmit={add}>
          <input className="rounded-lg border px-3 py-2" type="date" value={aData} onChange={(e) => setAData(e.target.value)} />
          <select className="rounded-lg border px-3 py-2" value={aKat} onChange={(e) => setAKat(e.target.value)}>
            {KATEGORITE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="Përshkrimi (ops.)" value={aPersh} onChange={(e) => setAPersh(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Shuma (€)" value={aShuma} onChange={(e) => setAShuma(e.target.value)} />
          <select className="rounded-lg border px-3 py-2" value={aMenyra} onChange={(e) => setAMenyra(e.target.value)}>
            {MENYRAT.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input className="rounded-lg border px-3 py-2" placeholder="Furnizues (ops.)" value={aFurn} onChange={(e) => setAFurn(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Nr. Fature (ops.)" value={aNr} onChange={(e) => setANr(e.target.value)} />

          {err ? <div className="text-sm text-red-600 md:col-span-6">{err}</div> : null}

          <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-6">
            Ruaj
          </button>
        </form>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Lista</h2>

        {loading ? (
          <div className="mt-2 text-sm text-gray-700">Duke ngarku…</div>
        ) : items.length === 0 ? (
          <div className="mt-2 text-sm text-gray-700">S’ka shpenzime.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-800">
                <tr>
                  <th className="py-2">Data</th>
                  <th>Kategoria</th>
                  <th>Përshkrimi</th>
                  <th>Mënyra</th>
                  <th>Furnizues</th>
                  <th>Nr</th>
                  <th>Shuma</th>
                  <th className="text-right">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.shpenzimId} className="border-b align-top">
                    <td className="py-2">{new Date(x.data).toLocaleDateString()}</td>
                    <td>{x.kategoria}</td>
                    <td className="max-w-[520px] whitespace-pre-wrap">{x.pershkrimi}</td>
                    <td>{x.menyra}</td>
                    <td>{x.furnizues}</td>
                    <td>{x.nrFature}</td>
                    <td className="font-semibold">{Number(x.shuma).toFixed(2)} €</td>
                    <td className="text-right">
                      <button className="rounded-lg border px-2 py-1 hover:bg-gray-50" onClick={() => del(x.shpenzimId)}>
                        Fshi
                      </button>
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
