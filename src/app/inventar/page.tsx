"use client";

import { useEffect, useMemo, useState } from "react";

type Furnizues = { furnizuesId: string; emri: string; telefoni: string; email: string; adresa: string };

type Item = {
  inventarId: string;
  kodi: string;
  emri: string;
  marka: string;
  modeli: string;
  sasiaStok: number;
  cmimiBlerje: string;
  cmimiShitje: string;
  furnizuesId: string;
  furnizuesEmri: string;
};

type Levizje = {
  levizjeId: string;
  data: string;
  tipi: string;
  sasia: number;
  cmimi: string;
  shenim: string;
  servisId: string;
};

export default function InventarPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [furnizues, setFurnizues] = useState<Furnizues[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // add form
  const [kodi, setKodi] = useState("");
  const [emri, setEmri] = useState("");
  const [marka, setMarka] = useState("");
  const [modeli, setModeli] = useState("");
  const [sasiaStok, setSasiaStok] = useState("0");
  const [cmimBlerje, setCmimBlerje] = useState("0");
  const [cmimShitje, setCmimShitje] = useState("0");
  const [furnizuesId, setFurnizuesId] = useState("");

  // levizje modal-ish (simple)
  const [openLev, setOpenLev] = useState<Item | null>(null);
  const [lev, setLev] = useState<Levizje[]>([]);
  const [levTipi, setLevTipi] = useState("HYRJE");
  const [levSasia, setLevSasia] = useState("1");
  const [levCmimi, setLevCmimi] = useState("0");
  const [levShenim, setLevShenim] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());

    const [invRes, fRes] = await Promise.all([
      fetch(`/api/inventar?${params.toString()}`),
      fetch(`/api/furnizues`),
    ]);

    setItems(await invRes.json().catch(() => []));
    setFurnizues(await fRes.json().catch(() => []));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const totalVlereBlerje = useMemo(() => {
    return items.reduce((s, i) => s + Number(i.cmimiBlerje || 0) * Number(i.sasiaStok || 0), 0);
  }, [items]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/inventar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kodi, emri, marka, modeli,
        sasiaStok, cmimiBlerje: cmimBlerje, cmimiShitje: cmimShitje,
        furnizuesId: furnizuesId || null,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(d?.error ?? "Gabim"); return; }

    setKodi(""); setEmri(""); setMarka(""); setModeli("");
    setSasiaStok("0"); setCmimBlerje("0"); setCmimShitje("0"); setFurnizuesId("");

    await load();
  }

  async function del(id: string) {
    if (!confirm("Me fshi artikullin?")) return;
    const res = await fetch(`/api/inventar/${id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { alert(d?.error ?? "S’u fshi"); return; }
    await load();
  }

  async function openLevizje(item: Item) {
    setOpenLev(item);
    const res = await fetch(`/api/inventar/${item.inventarId}/levizje`);
    setLev(await res.json().catch(() => []));
  }

  async function addLevizje(e: React.FormEvent) {
    e.preventDefault();
    if (!openLev) return;

    const res = await fetch(`/api/inventar/${openLev.inventarId}/levizje`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipi: levTipi,
        sasia: levSasia,
        cmimi: levCmimi,
        shenim: levShenim,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) { alert(d?.error ?? "Gabim"); return; }

    setLevTipi("HYRJE"); setLevSasia("1"); setLevCmimi("0"); setLevShenim("");
    await load();
    await openLevizje(openLev);
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventar</h1>
          <p className="text-sm text-gray-700">Pjesë në stok + hyrje/dalje. Monedha: EUR.</p>
        </div>
        <div className="text-sm font-semibold">
          Vlera (blerje): {totalVlereBlerje.toFixed(2)} €
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <input className="rounded-lg border px-3 py-2" placeholder="Kërko (emër/kod/markë/model)..." value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="rounded-lg bg-black px-3 py-2 text-white" onClick={load}>Kërko</button>
      </div>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Shto artikull</h2>
        <form className="mt-3 grid gap-2 md:grid-cols-6" onSubmit={add}>
          <input className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="Emri *" value={emri} onChange={(e)=>setEmri(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Kodi (ops.)" value={kodi} onChange={(e)=>setKodi(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Marka (ops.)" value={marka} onChange={(e)=>setMarka(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Modeli (ops.)" value={modeli} onChange={(e)=>setModeli(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Sasia stok" value={sasiaStok} onChange={(e)=>setSasiaStok(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Çmim blerje (€)" value={cmimBlerje} onChange={(e)=>setCmimBlerje(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Çmim shitje (€)" value={cmimShitje} onChange={(e)=>setCmimShitje(e.target.value)} />

          <select className="rounded-lg border px-3 py-2 md:col-span-2" value={furnizuesId} onChange={(e)=>setFurnizuesId(e.target.value)}>
            <option value="">Furnizues (opsional)</option>
            {furnizues.map((f)=>(
              <option key={f.furnizuesId} value={f.furnizuesId}>{f.emri}</option>
            ))}
          </select>

          {err ? <div className="text-sm text-red-600 md:col-span-6">{err}</div> : null}

          <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-6">Ruaj</button>
        </form>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Lista</h2>

        {loading ? (
          <div className="mt-2 text-sm text-gray-700">Duke ngarku…</div>
        ) : items.length === 0 ? (
          <div className="mt-2 text-sm text-gray-700">S’ka artikuj.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-800">
                <tr>
                  <th className="py-2">Emri</th>
                  <th>Kodi</th>
                  <th>Marka/Modeli</th>
                  <th>Stok</th>
                  <th>Blerje</th>
                  <th>Shitje</th>
                  <th>Furnizues</th>
                  <th className="text-right">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.inventarId} className="border-b align-top">
                    <td className="py-2 font-semibold">{i.emri}</td>
                    <td>{i.kodi}</td>
                    <td>{[i.marka, i.modeli].filter(Boolean).join(" ")}</td>
                    <td>{i.sasiaStok}</td>
                    <td>{Number(i.cmimiBlerje || 0).toFixed(2)} €</td>
                    <td>{Number(i.cmimiShitje || 0).toFixed(2)} €</td>
                    <td>{i.furnizuesEmri}</td>
                    <td className="text-right space-x-2">
                      <button className="rounded-lg border px-2 py-1 hover:bg-gray-50" onClick={() => openLevizje(i)}>
                        Levizje
                      </button>
                      <button className="rounded-lg border px-2 py-1 hover:bg-gray-50" onClick={() => del(i.inventarId)}>
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

      {/* Panel levizje */}
      {openLev ? (
        <section className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Levizje stoku: {openLev.emri}</h2>
            <button className="rounded-lg border px-2 py-1 hover:bg-gray-50" onClick={() => { setOpenLev(null); setLev([]); }}>
              Mbyll
            </button>
          </div>

          <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={addLevizje}>
            <select className="rounded-lg border px-3 py-2" value={levTipi} onChange={(e)=>setLevTipi(e.target.value)}>
              <option value="HYRJE">HYRJE</option>
              <option value="DALJE">DALJE</option>
              <option value="KORRIGJIM">KORRIGJIM</option>
            </select>
            <input className="rounded-lg border px-3 py-2" placeholder="Sasia" value={levSasia} onChange={(e)=>setLevSasia(e.target.value)} />
            <input className="rounded-lg border px-3 py-2" placeholder="Çmimi (€)" value={levCmimi} onChange={(e)=>setLevCmimi(e.target.value)} />
            <input className="rounded-lg border px-3 py-2" placeholder="Shënim (ops.)" value={levShenim} onChange={(e)=>setLevShenim(e.target.value)} />
            <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-4">Ruaj levizje</button>
          </form>

          {lev.length === 0 ? (
            <div className="mt-2 text-sm text-gray-700">Pa levizje.</div>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead className="border-b text-left text-gray-800">
                <tr>
                  <th className="py-2">Data</th>
                  <th>Tipi</th>
                  <th>Sasia</th>
                  <th>Çmimi</th>
                  <th>Shënim</th>
                </tr>
              </thead>
              <tbody>
                {lev.map((l) => (
                  <tr key={l.levizjeId} className="border-b">
                    <td className="py-2">{new Date(l.data).toLocaleString()}</td>
                    <td>{l.tipi}</td>
                    <td className="font-semibold">{l.sasia}</td>
                    <td>{Number(l.cmimi || 0).toFixed(2)} €</td>
                    <td>{l.shenim}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}
    </div>
  );
}
