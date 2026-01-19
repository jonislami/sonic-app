"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Klient = {
  klientId: string;
  emri: string;
  mbiemri: string;
  telefoni: string;
};

type Automjet = {
  automjetId: string;
  klientId: string;
  marka: string;
  modeli: string;
  viti: number | null;
  targa: string;
  vin: string;
  motori: string; // ✅ SHTUAR
  klient: Klient;
};

export default function AutomjetePage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [kliente, setKliente] = useState<Klient[]>([]);
  const [items, setItems] = useState<Automjet[]>([]);

  const [klientId, setKlientId] = useState("");
  const [marka, setMarka] = useState("");
  const [modeli, setModeli] = useState("");
  const [viti, setViti] = useState("");
  const [targa, setTarga] = useState("");
  const [vin, setVin] = useState("");
  const [motori, setMotori] = useState(""); // ✅ SHTUAR

  async function loadAll() {
    setLoading(true);
    setErr(null);

    const [kRes, aRes] = await Promise.all([
      fetch("/api/kliente", { cache: "no-store" }),
      fetch("/api/automjete", { cache: "no-store" }),
    ]);

    const k = await kRes.json().catch(() => null);
    const a = await aRes.json().catch(() => null);

    if (!kRes.ok || !Array.isArray(k)) {
      setErr(k?.error ?? "Gabim gjatë marrjes së klientëve");
      setKliente([]);
      setItems([]);
      setLoading(false);
      return;
    }

    if (!aRes.ok || !Array.isArray(a)) {
      setErr(a?.error ?? "Gabim gjatë marrjes së automjeteve");
      setKliente(k);
      setItems([]);
      setLoading(false);
      return;
    }

    setKliente(k);
    setItems(a);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function createOne(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/automjete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        klientId,
        marka,
        modeli,
        viti: viti.trim() ? Number(viti) : null,
        targa,
        vin,
        motori, // ✅ SHTUAR
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.error ?? "Gabim gjatë ruajtjes");
      return;
    }

    setKlientId("");
    setMarka("");
    setModeli("");
    setViti("");
    setTarga("");
    setVin("");
    setMotori(""); // ✅ SHTUAR

    await loadAll();
  }

  const list = useMemo(() => items, [items]);

  return (
    <div className="p-6">
      <div className="max-w-5xl border rounded-2xl bg-white p-5">
        <div>
          <h1 className="text-2xl font-semibold">Automjete</h1>
          <p className="text-sm text-gray-600">Shto automjetet e klientëve.</p>
        </div>

        {err ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {err}
          </div>
        ) : null}

        <form onSubmit={createOne} className="mt-5 border rounded-xl p-4">
          <div className="font-semibold mb-3">Shto automjet</div>

          <div className="grid gap-3">
            <select
              className="border rounded-lg px-3 py-2"
              value={klientId}
              onChange={(e) => setKlientId(e.target.value)}
            >
              <option value="">Zgjedh klientin *</option>
              {kliente.map((k) => (
                <option key={k.klientId} value={k.klientId}>
                  {k.emri} {k.mbiemri} {k.telefoni ? `- ${k.telefoni}` : ""}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Marka"
                value={marka}
                onChange={(e) => setMarka(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Modeli"
                value={modeli}
                onChange={(e) => setModeli(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Viti"
                value={viti}
                onChange={(e) => setViti(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Targa"
                value={targa}
                onChange={(e) => setTarga(e.target.value)}
              />
            </div>

            <input
              className="border rounded-lg px-3 py-2"
              placeholder="VIN"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
            />

            {/* ✅ MOTORI */}
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Motori (p.sh. 2.0 TDI / 3.0 Diesel)"
              value={motori}
              onChange={(e) => setMotori(e.target.value)}
            />

            <button className="bg-black text-white rounded-lg px-4 py-2">
              Ruaj
            </button>
          </div>
        </form>

        <div className="mt-5 border rounded-xl overflow-hidden">
          <div className="px-4 py-3 font-semibold border-b">Lista</div>

          {loading ? (
            <div className="p-4 text-sm text-gray-600">Duke ngarkuar…</div>
          ) : list.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">S’ka automjete.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
  <thead className="bg-gray-50">
  <tr>
    <td className="text-left p-3 border-b">Klienti</td>
    <td className="text-left p-3 border-b">Automjeti</td>
    <td className="text-left p-3 border-b">Motori</td>
    <td className="text-left p-3 border-b">Targa</td>
    <td className="text-left p-3 border-b">VIN</td>
    <td className="text-right p-3 border-b">Veprime</td>
  </tr>
</thead>


                <tbody>
                  {list.map((a) => (
                    <tr key={a.automjetId} className="border-b">
                      <td className="p-3">
                        {a.klient?.emri ?? ""} {a.klient?.mbiemri ?? ""}
                        <div className="text-xs text-gray-500">{a.klient?.telefoni ?? ""}</div>
                      </td>
                      <td className="p-3">
                        {(a.marka || "").trim()} {(a.modeli || "").trim()}{" "}
                        {a.viti ? String(a.viti) : ""}
                      </td>
                      <td className="p-3">{a.motori || "-"}</td> {/* ✅ */}
                      <td className="p-3">{a.targa || "-"}</td>
                      <td className="p-3">{a.vin || "-"}</td>
                      <td className="p-3 text-right">
                        <Link className="border rounded px-3 py-1" href={`/automjete/${a.automjetId}`}>
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
    </div>
  );
}
