"use client";

import { useEffect, useMemo, useState } from "react";

type Furnizues = {
  furnizuesId: string;
  emri: string;
  telefoni: string;
  email: string;
  adresa: string;
};

export default function FurnizuesPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [items, setItems] = useState<Furnizues[]>([]);

  const [emri, setEmri] = useState("");
  const [telefoni, setTelefoni] = useState("");
  const [email, setEmail] = useState("");
  const [adresa, setAdresa] = useState("");

  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/furnizues", { cache: "no-store" });
    const d = await res.json().catch(() => null);

    if (!res.ok || !Array.isArray(d)) {
      setErr(d?.error ?? "Gabim");
      setItems([]);
      setLoading(false);
      return;
    }

    setItems(d);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createOne(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/furnizues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emri, telefoni, email, adresa }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.error ?? "Gabim gjatë krijimit");
      return;
    }

    setEmri("");
    setTelefoni("");
    setEmail("");
    setAdresa("");
    await load();
  }

  async function saveRow(row: Furnizues) {
    setErr(null);
    const res = await fetch(`/api/furnizues/${row.furnizuesId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emri: row.emri,
        telefoni: row.telefoni,
        email: row.email,
        adresa: row.adresa,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.error ?? "Gabim gjatë ruajtjes");
      return;
    }
    await load();
  }

  async function deleteRow(id: string) {
    if (!confirm("A je i sigurt që do ta fshish furnizuesin?")) return;

    setErr(null);
    const res = await fetch(`/api/furnizues/${id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.error ?? "Gabim gjatë fshirjes");
      return;
    }
    await load();
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => {
      return (
        x.emri.toLowerCase().includes(s) ||
        (x.telefoni || "").toLowerCase().includes(s) ||
        (x.email || "").toLowerCase().includes(s) ||
        (x.adresa || "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  return (
    <div className="p-6">
      <div className="max-w-5xl border rounded-2xl bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Furnizues</h1>
            <p className="text-sm text-gray-600">Shto, kërko dhe menaxho furnizuesit.</p>
          </div>
        </div>

        {err ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {err}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <form onSubmit={createOne} className="border rounded-xl p-4">
            <div className="font-semibold mb-3">Shto furnizues</div>

            <div className="grid gap-2">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Emri *"
                value={emri}
                onChange={(e) => setEmri(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Telefoni"
                value={telefoni}
                onChange={(e) => setTelefoni(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Adresa"
                value={adresa}
                onChange={(e) => setAdresa(e.target.value)}
              />

              <button className="mt-2 bg-black text-white rounded-lg px-3 py-2">
                Ruaj
              </button>
            </div>
          </form>

          <div className="border rounded-xl p-4">
            <div className="font-semibold mb-3">Kërko</div>
            <input
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Kërko (emër/telefon/email/adresë)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="text-xs text-gray-600 mt-2">
              Totali: {filtered.length} furnizues
            </div>
          </div>
        </div>

        <div className="mt-5 border rounded-xl overflow-hidden">
          <div className="px-4 py-3 font-semibold border-b">Lista</div>

          {loading ? (
            <div className="p-4 text-sm text-gray-600">Duke ngarkuar…</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">S’ka furnizues.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 border-b">Emri</th>
                    <th className="text-left p-3 border-b">Telefoni</th>
                    <th className="text-left p-3 border-b">Email</th>
                    <th className="text-left p-3 border-b">Adresa</th>
                    <th className="text-right p-3 border-b">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <Row key={r.furnizuesId} r={r} onSave={saveRow} onDelete={deleteRow} />
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

function Row({
  r,
  onSave,
  onDelete,
}: {
  r: Furnizues;
  onSave: (row: Furnizues) => void;
  onDelete: (id: string) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [row, setRow] = useState<Furnizues>(r);

  useEffect(() => setRow(r), [r]);

  return (
    <tr className="border-b">
      <td className="p-3">
        {edit ? (
          <input
            className="border rounded px-2 py-1 w-full"
            value={row.emri}
            onChange={(e) => setRow({ ...row, emri: e.target.value })}
          />
        ) : (
          row.emri
        )}
      </td>

      <td className="p-3">
        {edit ? (
          <input
            className="border rounded px-2 py-1 w-full"
            value={row.telefoni}
            onChange={(e) => setRow({ ...row, telefoni: e.target.value })}
          />
        ) : (
          row.telefoni || "-"
        )}
      </td>

      <td className="p-3">
        {edit ? (
          <input
            className="border rounded px-2 py-1 w-full"
            value={row.email}
            onChange={(e) => setRow({ ...row, email: e.target.value })}
          />
        ) : (
          row.email || "-"
        )}
      </td>

      <td className="p-3">
        {edit ? (
          <input
            className="border rounded px-2 py-1 w-full"
            value={row.adresa}
            onChange={(e) => setRow({ ...row, adresa: e.target.value })}
          />
        ) : (
          row.adresa || "-"
        )}
      </td>

      <td className="p-3 text-right">
        {edit ? (
          <div className="flex justify-end gap-2">
            <button
              className="border rounded px-3 py-1"
              onClick={() => {
                setEdit(false);
                setRow(r);
              }}
              type="button"
            >
              Anulo
            </button>
            <button
              className="bg-black text-white rounded px-3 py-1"
              onClick={() => {
                onSave(row);
                setEdit(false);
              }}
              type="button"
            >
              Ruaj
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <button className="border rounded px-3 py-1" onClick={() => setEdit(true)} type="button">
              Edit
            </button>
            <button className="border rounded px-3 py-1" onClick={() => onDelete(r.furnizuesId)} type="button">
              Fshi
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
