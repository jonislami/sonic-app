"use client";

import { useEffect, useMemo, useState } from "react";

type Klient = {
  klientId: string;
  emri: string;
  mbiemri: string | null;
  telefoni: string | null;
  email: string | null;
  adresa: string | null;
  dataRegjistrimit: string;
};

export default function KlientePage() {
  const [items, setItems] = useState<Klient[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [emri, setEmri] = useState("");
  const [mbiemri, setMbiemri] = useState("");
  const [telefoni, setTelefoni] = useState("");
  const [email, setEmail] = useState("");
  const [adresa, setAdresa] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/kliente");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((k) =>
      `${k.emri} ${k.mbiemri ?? ""} ${k.telefoni ?? ""} ${k.email ?? ""}`
        .toLowerCase()
        .includes(s)
    );
  }, [items, q]);

  async function addKlient(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/kliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emri, mbiemri, telefoni, email, adresa }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d?.error ?? "Gabim");
      return;
    }

    setEmri(""); setMbiemri(""); setTelefoni(""); setEmail(""); setAdresa("");
    await load();
  }

  async function delKlient(id: string) {
    if (!confirm("Me fshi klientin?")) return;
    const res = await fetch(`/api/kliente/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d?.error ?? "S’u fshi");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6 text-gray-900">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Klientë</h1>
          <p className="text-sm text-gray-700">Shto, kërko dhe menaxho klientët.</p>
        </div>
        <input
          className="w-full rounded-lg border px-3 py-2 md:w-80"
          placeholder="Kërko (emër/telefon/email)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </header>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Shto klient</h2>
        <form className="mt-3 grid gap-2 md:grid-cols-2" onSubmit={addKlient}>
          <input className="rounded-lg border px-3 py-2" placeholder="Emri *" value={emri} onChange={(e)=>setEmri(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Mbiemri" value={mbiemri} onChange={(e)=>setMbiemri(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Telefoni" value={telefoni} onChange={(e)=>setTelefoni(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="Adresa" value={adresa} onChange={(e)=>setAdresa(e.target.value)} />

          {err ? <div className="text-sm text-red-600 md:col-span-2">{err}</div> : null}
          <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-2">Ruaj</button>
        </form>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Lista</h2>

        {loading ? (
          <div className="mt-2 text-sm text-gray-700">Duke ngarku…</div>
        ) : filtered.length === 0 ? (
          <div className="mt-2 text-sm text-gray-700">S’ka klientë.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-800">
                <tr>
                  <th className="py-2">Klienti</th>
                  <th>Telefoni</th>
                  <th>Email</th>
                  <th className="text-right">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((k) => (
                  <tr key={k.klientId} className="border-b">
                    <td className="py-2 font-medium">{k.emri} {k.mbiemri ?? ""}</td>
                    <td>{k.telefoni ?? ""}</td>
                    <td className="max-w-[260px] truncate">{k.email ?? ""}</td>
                    <td className="text-right">
                      <button className="rounded-lg border px-2 py-1 hover:bg-gray-50" onClick={() => delKlient(k.klientId)}>
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
