"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BodyDamagePanel, { emptyDamage } from "@/components/BodyDamagePanel";

type Kategori = {
  kategoriId: string;
  emri: string;
  pershkrimi: string;
  aktiv: boolean;
  renditja: number;
};

type KategoriItem = {
  kategoriItemId: string;
  kategoriId: string;
  key: string;
  etikete: string;
  renditja: number;
};

type InspektimItemUI = {
  key: string;          // ✅ unik brenda inspektimit (ne do e bejm `${kategoriId}:${templateKey}`)
  grup: string;         // emri i kategorise
  etikete: string;
  status: "OK" | "WARN" | "FAIL";
  kategoriId: string | null;
};

export default function Page() {
  const params = useParams<{ inspektimId: string }>();
  const inspektimId = params?.inspektimId ? String(params.inspektimId) : "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [automjet, setAutomjet] = useState<any>(null);
  const [inspektim, setInspektim] = useState<any>(null);

  const [km, setKm] = useState("");
  const [komente, setKomente] = useState("");
  const [statusi, setStatusi] = useState("Draft");

  const [damage, setDamage] = useState<any>(emptyDamage());

  // ✅ itemet e inspektimit (jo template)
  const [items, setItems] = useState<InspektimItemUI[]>([]);

  // ✅ kategoritë template
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [kategoriId, setKategoriId] = useState<string>("");
  const [kategoriItems, setKategoriItems] = useState<KategoriItem[]>([]);

  async function load() {
    if (!inspektimId) return;

    setLoading(true);
    setErr(null);

    const [resIns, resKat] = await Promise.all([
      fetch(`/api/inspektime/${inspektimId}`),
      fetch(`/api/inspekt-kategori`, { cache: "no-store" }),
    ]);

    const d = await resIns.json().catch(() => ({}));
    const k = await resKat.json().catch(() => []);

    if (!resIns.ok) {
      setErr(d?.error ?? "Gabim");
      setLoading(false);
      return;
    }

    setAutomjet(d.automjet);
    setInspektim(d.inspektim);

    setKm(d?.inspektim?.km ?? "");
    setKomente(d?.inspektim?.komente ?? "");
    setStatusi(d?.inspektim?.statusi ?? "Draft");

    const raw = d?.inspektim?.demtimeJson ?? "";
    try {
      setDamage(raw ? JSON.parse(raw) : emptyDamage());
    } catch {
      setDamage(emptyDamage());
    }

    const it = Array.isArray(d.iteme) ? d.iteme : [];
    setItems(
      it.map((x: any) => ({
        key: String(x.key),
        grup: String(x.grup ?? ""),
        etikete: String(x.etikete ?? ""),
        status: (String(x.status ?? "OK").toUpperCase() as any) ?? "OK",
        kategoriId: x.kategoriId ? String(x.kategoriId) : null,
      }))
    );

    // kategoritë
    setKategori(
      (Array.isArray(k) ? k : []).map((c: any) => ({
        kategoriId: String(c.kategoriId),
        emri: String(c.emri),
        pershkrimi: String(c.pershkrimi ?? ""),
        aktiv: c.aktiv !== false,
        renditja: Number(c.renditja ?? 0),
      }))
    );

    setLoading(false);
  }

  async function loadKategoriItems(kid: string) {
    setKategoriItems([]);
    if (!kid) return;
    const res = await fetch(`/api/inspekt-kategori/${kid}/iteme`, { cache: "no-store" });
    const d = await res.json().catch(() => []);
    if (!res.ok) return;
    setKategoriItems(Array.isArray(d) ? d : []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspektimId]);

  useEffect(() => {
    if (kategoriId) loadKategoriItems(kategoriId);
  }, [kategoriId]);

  const title = useMemo(() => {
    if (!automjet) return "Inspektim";
    return `${automjet.marka} ${automjet.modeli} ${automjet.viti ?? ""} ${automjet.targa ? `(${automjet.targa})` : ""}`.trim();
  }, [automjet]);

  const grouped = useMemo(() => {
    const m: Record<string, InspektimItemUI[]> = {};
    for (const it of items) {
      const g = it.grup || "Tjera";
      if (!m[g]) m[g] = [];
      m[g].push(it);
    }
    return Object.entries(m);
  }, [items]);

  function kategoriEmriById(kid: string) {
    return kategori.find((x) => x.kategoriId === kid)?.emri ?? "Kategori";
  }

  function mkKey(kid: string, templateKey: string) {
    return `${kid}:${templateKey}`; // ✅ unik per kategori
  }

  function addOneFromKategori(row: KategoriItem) {
    if (!kategoriId) return;
    const key = mkKey(kategoriId, row.key);
    if (items.some((x) => x.key === key)) return;

    const grup = kategoriEmriById(kategoriId);

    setItems((prev) => [
      ...prev,
      {
        key,
        grup,
        etikete: row.etikete,
        status: "OK",
        kategoriId,
      },
    ]);
  }

  function addAllFromKategori() {
    if (!kategoriId) return;
    const grup = kategoriEmriById(kategoriId);

    setItems((prev) => {
      const exists = new Set(prev.map((x) => x.key));
      const add: InspektimItemUI[] = [];
      for (const row of kategoriItems) {
        const key = mkKey(kategoriId, row.key);
        if (exists.has(key)) continue;
        add.push({ key, grup, etikete: row.etikete, status: "OK", kategoriId });
      }
      return [...prev, ...add];
    });
  }

  function setStatus(itemKey: string, st: "OK" | "WARN" | "FAIL") {
    setItems((prev) => prev.map((x) => (x.key === itemKey ? { ...x, status: st } : x)));
  }

  function removeItem(itemKey: string) {
    setItems((prev) => prev.filter((x) => x.key !== itemKey));
  }

  async function save() {
    if (!inspektimId) return;
    setErr(null);

    const res = await fetch(`/api/inspektime/${inspektimId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        km,
        komente,
        statusi,
        demtimeJson: JSON.stringify(damage),
        iteme: items.map((x) => ({
          key: x.key,
          grup: x.grup,
          etikete: x.etikete,
          status: x.status,
          kategoriId: x.kategoriId,
        })),
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.error ?? "Gabim gjatë ruajtjes");
      return;
    }

    await load();
  }

  async function del() {
    if (!inspektimId) return;
    if (!confirm("Me fshi inspektimin?")) return;

    const res = await fetch(`/api/inspektime/${inspektimId}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(d?.error ?? "Gabim gjatë fshirjes");
      return;
    }

    window.location.href = "/inspekt";
  }

  if (!inspektimId) return <div className="text-sm text-red-700">Gabim: inspektimId mungon.</div>;
  if (loading) return <div className="text-sm text-gray-700">Duke ngarku…</div>;

  return (
    <div className="space-y-4 text-gray-900">
      {err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
      ) : null}

      <div className="rounded-xl border bg-white p-4 flex items-start justify-between">
        <div>
          <div className="text-xl font-semibold">{title}</div>
          {automjet?.klient ? (
            <div className="text-sm text-gray-700">
              Klienti: <b>{automjet.klient.emri} {automjet.klient.mbiemri}</b> • Tel: {automjet.klient.telefoni || "-"} • VIN: {automjet.vin || "-"}
            </div>
          ) : (
            <div className="text-sm text-gray-700">Klienti: -</div>
          )}
          <div className="text-xs text-gray-600 mt-1">Inspektim ID: {inspektimId}</div>
        </div>

        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-2 hover:bg-gray-50" onClick={del}>
            Fshi
          </button>
          <button className="rounded-lg bg-black px-3 py-2 text-white" onClick={save}>
            Ruaj
          </button>
          <button
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
            onClick={() => window.open(`/inspekt/${inspektimId}/print`, "_blank")}
          >
            Printo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[380px_1fr] gap-6">
        {/* LEFT */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <BodyDamagePanel value={damage} onChange={setDamage} />

          <div className="border-t pt-3 space-y-2">
            <div className="text-lg font-semibold">General Inspection Comments</div>

            <input
              className="rounded-lg border px-3 py-2 w-full"
              placeholder="KM"
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />

            <select
              className="rounded-lg border px-3 py-2 w-full"
              value={statusi}
              onChange={(e) => setStatusi(e.target.value)}
            >
              <option value="Draft">Draft</option>
              <option value="Perfundu">Perfundu</option>
            </select>

            <textarea
              className="rounded-lg border px-3 py-2 w-full h-28"
              placeholder="Komente të përgjithshme"
              value={komente}
              onChange={(e) => setKomente(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          {/* ✅ Category picker */}
          <div className="rounded-xl border p-3">
            <div className="font-semibold">Shto nga Kategoria</div>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
              <select
                className="rounded-lg border px-3 py-2 md:col-span-2"
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
              >
                <option value="">Zgjedh kategori…</option>
                {kategori
                  .filter((k) => k.aktiv)
                  .map((k) => (
                    <option key={k.kategoriId} value={k.kategoriId}>
                      {k.emri}
                    </option>
                  ))}
              </select>

              <button
                className="rounded-lg bg-black px-3 py-2 text-white disabled:opacity-50"
                disabled={!kategoriId}
                onClick={addAllFromKategori}
                type="button"
              >
                Shto krejt kategorinë
              </button>
            </div>

            {kategoriId ? (
              <div className="mt-3 border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 text-sm font-semibold">
                  Iteme ({kategoriEmriById(kategoriId)})
                </div>
                <div className="divide-y">
                  {kategoriItems.length === 0 ? (
                    <div className="p-3 text-sm text-gray-700">S’ka iteme në këtë kategori.</div>
                  ) : (
                    kategoriItems.map((row) => {
                      const exists = items.some((x) => x.key === mkKey(kategoriId, row.key));
                      return (
                        <div key={row.kategoriItemId} className="p-3 flex items-center justify-between gap-2">
                          <div className="text-sm">{row.etikete}</div>
                          <button
                            className={`rounded-lg border px-2 py-1 text-sm ${exists ? "opacity-50" : "hover:bg-gray-50"}`}
                            disabled={exists}
                            onClick={() => addOneFromKategori(row)}
                            type="button"
                          >
                            {exists ? "E shtuar" : "Shto"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* ✅ Inspection items (grouped) */}
          <div className="rounded-xl border p-3">
            <div className="font-semibold">Checklist i Inspektimit</div>

            {items.length === 0 ? (
              <div className="mt-2 text-sm text-gray-700">S’ka iteme. Zgjedh kategori dhe shto.</div>
            ) : (
              <div className="mt-3 space-y-4">
                {grouped.map(([g, arr]) => (
                  <div key={g} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 font-semibold text-sm">{g}</div>

                    <div className="divide-y">
                      {arr.map((it) => (
                        <div key={it.key} className="p-3 flex items-center justify-between gap-3">
                          <div className="text-sm">{it.etikete}</div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className={`rounded border px-2 py-1 text-sm ${it.status === "OK" ? "bg-green-100" : "hover:bg-gray-50"}`}
                              onClick={() => setStatus(it.key, "OK")}
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              className={`rounded border px-2 py-1 text-sm ${it.status === "WARN" ? "bg-yellow-100" : "hover:bg-gray-50"}`}
                              onClick={() => setStatus(it.key, "WARN")}
                            >
                              WARN
                            </button>
                            <button
                              type="button"
                              className={`rounded border px-2 py-1 text-sm ${it.status === "FAIL" ? "bg-red-100" : "hover:bg-gray-50"}`}
                              onClick={() => setStatus(it.key, "FAIL")}
                            >
                              FAIL
                            </button>

                            <button
                              type="button"
                              className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
                              onClick={() => removeItem(it.key)}
                            >
                              Hiq
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
