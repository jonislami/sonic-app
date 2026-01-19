"use client";

import { useEffect, useMemo, useState } from "react";

type Kategori = {
  kategoriId: string;
  emri: string;
  pershkrimi: string;
  aktiv: boolean;
  renditja: number;
};

type Item = {
  kategoriItemId: string;
  kategoriId: string;
  key: string;
  etikete: string;
  renditja: number;
};

export default function InspektKategoriPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const [items, setItems] = useState<Item[]>([]);

  // form kategori
  const [kEmri, setKEmri] = useState("");
  const [kPershkrimi, setKPershkrimi] = useState("");
  const [kRenditja, setKRenditja] = useState("0");
  const [kAktiv, setKAktiv] = useState(true);

  // form item
  const [iKey, setIKey] = useState("");
  const [iEtikete, setIEtikete] = useState("");
  const [iRenditja, setIRenditja] = useState("0");

  async function loadKategori() {
    setLoading(true);
    setErr(null);

    const res = await fetch("/api/inspekt-kategori", { cache: "no-store" });
    const d = await res.json().catch(() => []);

    if (!res.ok) {
      setErr((d as any)?.error ?? "Gabim");
      setKategori([]);
      setLoading(false);
      return;
    }

    const rows = Array.isArray(d) ? d : [];
    setKategori(
      rows.map((x: any) => ({
        kategoriId: String(x.kategoriId),
        emri: String(x.emri ?? ""),
        pershkrimi: String(x.pershkrimi ?? ""),
        aktiv: x.aktiv !== false,
        renditja: Number(x.renditja ?? 0),
      }))
    );

    // ruaj selection nese ekziston
    if (selectedId && !rows.some((x: any) => String(x.kategoriId) === selectedId)) {
      setSelectedId("");
      setItems([]);
    }

    setLoading(false);
  }

  async function loadItems(kid: string) {
    setItems([]);
    if (!kid) return;

    const res = await fetch(`/api/inspekt-kategori/${kid}/iteme`, { cache: "no-store" });
    const d = await res.json().catch(() => []);

    if (!res.ok) return;

    setItems(
      (Array.isArray(d) ? d : []).map((x: any) => ({
        kategoriItemId: String(x.kategoriItemId),
        kategoriId: String(x.kategoriId),
        key: String(x.key ?? ""),
        etikete: String(x.etikete ?? ""),
        renditja: Number(x.renditja ?? 0),
      }))
    );
  }

  useEffect(() => {
    loadKategori();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId) loadItems(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selected = useMemo(
    () => kategori.find((k) => k.kategoriId === selectedId) ?? null,
    [kategori, selectedId]
  );

  async function createKategori(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/inspekt-kategori", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emri: kEmri,
        pershkrimi: kPershkrimi,
        renditja: Number(kRenditja || 0),
        aktiv: kAktiv,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(d?.error ?? "Gabim");

    setKEmri("");
    setKPershkrimi("");
    setKRenditja("0");
    setKAktiv(true);

    await loadKategori();
  }

  async function delKategori() {
    if (!selectedId) return;
    if (!confirm("Me fshi kategorinë dhe të gjitha itemet?")) return;

    const res = await fetch(`/api/inspekt-kategori/${selectedId}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(d?.error ?? "Gabim");

    setSelectedId("");
    setItems([]);
    await loadKategori();
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!selectedId) return setErr("Zgjedh një kategori.");

    const res = await fetch(`/api/inspekt-kategori/${selectedId}/iteme`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: iKey,
        etikete: iEtikete,
        renditja: Number(iRenditja || 0),
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(d?.error ?? "Gabim");

    setIKey("");
    setIEtikete("");
    setIRenditja("0");
    await loadItems(selectedId);
  }

  async function delItem(itemId: string) {
    if (!confirm("Me fshi itemin?")) return;
    setErr(null);

    const res = await fetch(`/api/inspekt-kategori-item/${itemId}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(d?.error ?? "Gabim");

    if (selectedId) await loadItems(selectedId);
  }

  if (loading) return <div className="p-6 text-sm text-gray-700">Duke ngarku…</div>;

  return (
    <div className="p-6 space-y-4 text-gray-900">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Kategoritë e Inspektimit</h1>
          <p className="text-sm text-gray-700">Krijo kategori (p.sh. Gomat) dhe shto rreshtat një-ka-një.</p>
        </div>
      </div>

      {err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {/* LEFT: lista + krijim */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div className="font-semibold">Kategoritë</div>

          {kategori.length === 0 ? (
            <div className="text-sm text-gray-700">S’ka kategori ende.</div>
          ) : (
            <div className="space-y-2">
              {kategori.map((k) => (
                <button
                  key={k.kategoriId}
                  className={`w-full text-left rounded-lg border p-3 hover:bg-gray-50 ${
                    selectedId === k.kategoriId ? "border-black ring-1 ring-black" : ""
                  }`}
                  onClick={() => setSelectedId(k.kategoriId)}
                  type="button"
                >
                  <div className="font-semibold">{k.emri}</div>
                  <div className="text-xs text-gray-600">
                    {k.aktiv ? "Aktiv" : "Jo aktiv"} • Renditja: {k.renditja}
                  </div>
                  {k.pershkrimi ? <div className="text-sm text-gray-700 mt-1">{k.pershkrimi}</div> : null}
                </button>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="font-semibold">Shto kategori</div>

            <form className="mt-3 grid gap-2" onSubmit={createKategori}>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Emri (p.sh. Gomat)"
                value={kEmri}
                onChange={(e) => setKEmri(e.target.value)}
                required
              />
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Përshkrim (opsional)"
                value={kPershkrimi}
                onChange={(e) => setKPershkrimi(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="rounded-lg border px-3 py-2"
                  placeholder="Renditja"
                  value={kRenditja}
                  onChange={(e) => setKRenditja(e.target.value)}
                />
                <label className="flex items-center gap-2 text-sm rounded-lg border px-3 py-2">
                  <input type="checkbox" checked={kAktiv} onChange={(e) => setKAktiv(e.target.checked)} />
                  Aktiv
                </label>
              </div>

              <button className="rounded-lg bg-black px-3 py-2 text-white whitespace-nowrap">
                Ruaj kategorinë
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: items */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold">Itemet</div>
            <button
              className="rounded-lg border px-3 py-2 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
              disabled={!selectedId}
              onClick={delKategori}
              type="button"
            >
              Fshi kategorinë
            </button>
          </div>

          {!selected ? (
            <div className="text-sm text-gray-700">Zgjedh një kategori në anën e majtë.</div>
          ) : (
            <>
              <div className="text-sm text-gray-700">
                Kategoria: <b>{selected.emri}</b>
              </div>

              {/* ✅ RREGULLIMI: i japim më shumë hapësirë butonit + min-width */}
              <form
  onSubmit={addItem}
  className="flex flex-wrap items-stretch gap-2"
>
  <input
    className="rounded-lg border px-3 py-2 flex-1 min-w-[200px]"
    placeholder='key (p.sh. "tread_depth")'
    value={iKey}
    onChange={(e) => setIKey(e.target.value)}
  />

  <input
    className="rounded-lg border px-3 py-2 flex-[2] min-w-[260px]"
    placeholder='Etiketa (p.sh. "Thellësia e gomës")'
    value={iEtikete}
    onChange={(e) => setIEtikete(e.target.value)}
  />

  <input
    className="rounded-lg border px-3 py-2 w-[72px]"
    placeholder="R"
    value={iRenditja}
    onChange={(e) => setIRenditja(e.target.value)}
  />

  <button
    className="rounded-lg bg-black px-5 py-2 text-white min-w-[110px] whitespace-nowrap"
    type="submit"
  >
    Shto
  </button>
</form>


              {items.length === 0 ? (
                <div className="text-sm text-gray-700">S’ka iteme në këtë kategori.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b text-left text-gray-800">
                      <tr>
                        <th className="py-2">Key</th>
                        <th>Etiketa</th>
                        <th>R</th>
                        <th className="text-right">Veprime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it.kategoriItemId} className="border-b">
                          <td className="py-2 font-mono">{it.key}</td>
                          <td>{it.etikete}</td>
                          <td>{it.renditja}</td>
                          <td className="text-right">
                            <button
                              className="rounded-lg border px-2 py-1 hover:bg-gray-50 whitespace-nowrap"
                              onClick={() => delItem(it.kategoriItemId)}
                              type="button"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
