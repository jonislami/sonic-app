"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BodyDamagePanel, { emptyDamage } from "@/components/BodyDamagePanel";

type Status = "OK" | "WARN" | "FAIL";

type Kategori = {
  kategoriId: string;
  emri: string;
  pershkrimi: string | null;
  renditja: number;
  aktiv: boolean;
};

type KategoriItem = {
  kategoriItemId: string;
  kategoriId: string;
  key: string;
  etikete: string;
  renditja: number;
  aktiv: boolean;
};

type InspektimItemRow = {
  kategoriId: string | null;
  grup: string;
  key: string;
  etikete: string;
  status: Status;
};

function buildKey(kategoriId: string, itemKey: string) {
  // ✅ unik në DB edhe në inspektim
  return `${kategoriId}::${itemKey}`;
}

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

  // ✅ kategoritë & itemet
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [activeKatId, setActiveKatId] = useState<string>("");
  const [katItems, setKatItems] = useState<Record<string, KategoriItem[]>>({});

  // ✅ rreshtat e zgjedhur në inspektim (key -> status)
  const [selected, setSelected] = useState<Record<string, Status>>({});

  async function loadInspektim() {
    if (!inspektimId) return;

    setLoading(true);
    setErr(null);

    const res = await fetch(`/api/inspektime/${inspektimId}`, { cache: "no-store" });
    const d = await res.json().catch(() => ({}));

    if (!res.ok) {
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

    // ✅ map itemet ekzistuese të inspektimit
    const next: Record<string, Status> = {};
    for (const it of (d.iteme ?? []) as InspektimItemRow[]) {
      if (it?.key && it?.status) next[String(it.key)] = it.status;
    }
    setSelected(next);

    setLoading(false);
  }

  async function loadKategori() {
    const res = await fetch("/api/inspekt-kategori", { cache: "no-store" });
    const d = await res.json().catch(() => []);
    if (!res.ok) throw new Error(d?.error ?? "Gabim kategori");

    const list = (Array.isArray(d) ? d : []).filter((x: any) => x.aktiv !== false);
    setKategori(list);
    if (!activeKatId && list.length > 0) setActiveKatId(list[0].kategoriId);

    // preload itemet
    const map: Record<string, KategoriItem[]> = {};
    for (const k of list) {
      const r2 = await fetch(`/api/inspekt-kategori/${k.kategoriId}/iteme`, { cache: "no-store" });
      const d2 = await r2.json().catch(() => []);
      map[k.kategoriId] = (Array.isArray(d2) ? d2 : []).filter((x: any) => x.aktiv !== false);
    }
    setKatItems(map);
  }

  useEffect(() => {
    if (!inspektimId) return;
    (async () => {
      try {
        await Promise.all([loadInspektim(), loadKategori()]);
      } catch (e: any) {
        console.error(e);
        setErr(String(e?.message ?? e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspektimId]);

  async function save() {
    if (!inspektimId) return;
    setErr(null);

    // ✅ ndërto itemet nga selected + katItems + kategori
    const katMap = new Map<string, string>();
    for (const k of kategori) katMap.set(k.kategoriId, k.emri);

    const itemLookup = new Map<string, { kategoriId: string; etikete: string; grup: string }>();
    for (const k of kategori) {
      const arr = katItems[k.kategoriId] ?? [];
      for (const it of arr) {
        const key = buildKey(k.kategoriId, it.key);
        itemLookup.set(key, { kategoriId: k.kategoriId, etikete: it.etikete, grup: k.emri });
      }
    }

    const iteme = Object.entries(selected)
      .filter(([_, st]) => !!st)
      .map(([k, st]) => {
        const meta = itemLookup.get(k);
        // fallback nëse ka item të vjetër
        const katId = meta?.kategoriId ?? null;
        const grup = meta?.grup ?? "Tjera";
        const etikete = meta?.etikete ?? k;
        return {
          kategoriId: katId,
          grup,
          key: k,
          etikete,
          status: st,
        };
      });

    const res = await fetch(`/api/inspektime/${inspektimId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        km,
        komente,
        statusi,
        demtimeJson: JSON.stringify(damage),
        iteme,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.error ?? "Gabim gjatë ruajtjes");
      return;
    }

    await loadInspektim();
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

  const title = useMemo(() => {
    if (!automjet) return "Inspektim";
    return `${automjet.marka} ${automjet.modeli} ${automjet.viti ?? ""} ${automjet.targa ? `(${automjet.targa})` : ""}`.trim();
  }, [automjet]);

  const activeItems = useMemo(() => {
    if (!activeKatId) return [];
    return katItems[activeKatId] ?? [];
  }, [katItems, activeKatId]);

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
          <button className="rounded-lg border px-3 py-2 hover:bg-gray-50" onClick={del}>Fshi</button>
          <button className="rounded-lg bg-black px-3 py-2 text-white" onClick={save}>Ruaj</button>
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

            <input className="rounded-lg border px-3 py-2 w-full" placeholder="KM" value={km} onChange={(e) => setKm(e.target.value)} />

            <select className="rounded-lg border px-3 py-2 w-full" value={statusi} onChange={(e) => setStatusi(e.target.value)}>
              <option value="Draft">Draft</option>
              <option value="Perfundu">Perfundu</option>
            </select>

            <textarea className="rounded-lg border px-3 py-2 w-full h-28" placeholder="Komente të përgjithshme" value={komente} onChange={(e) => setKomente(e.target.value)} />
          </div>
        </div>

        {/* RIGHT: kategoritë + itemet */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Kategoritë (dinamike)</div>
              <div className="text-xs text-gray-600">Zgjedh kategorinë dhe vendos statusin për rreshta (OK/WARN/FAIL).</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[240px_1fr] gap-4">
            {/* KATEGORI LIST */}
            <div className="rounded-xl border p-3">
              <div className="font-semibold mb-2">Kategori</div>
              {kategori.length === 0 ? (
                <div className="text-sm text-gray-700">S’ka kategori. Shto te “Inspekt Kategori”.</div>
              ) : (
                <div className="space-y-2">
                  {kategori.map((k) => (
                    <button
                      key={k.kategoriId}
                      className={`w-full text-left rounded-lg border px-3 py-2 hover:bg-gray-50 ${activeKatId === k.kategoriId ? "bg-gray-50" : ""}`}
                      onClick={() => setActiveKatId(k.kategoriId)}
                      type="button"
                    >
                      <div className="font-semibold">{k.emri}</div>
                      {k.pershkrimi ? <div className="text-xs text-gray-600">{k.pershkrimi}</div> : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ITEMET E KATEGORIS */}
            <div className="rounded-xl border p-3">
              <div className="font-semibold mb-2">Rreshtat</div>

              {!activeKatId ? (
                <div className="text-sm text-gray-700">Zgjedh një kategori.</div>
              ) : activeItems.length === 0 ? (
                <div className="text-sm text-gray-700">S’ka iteme për këtë kategori. Shto iteme te “Inspekt Kategori”.</div>
              ) : (
                <div className="space-y-2">
                  {activeItems.map((it) => {
                    const k = buildKey(activeKatId, it.key);
                    const st = selected[k] ?? "";

                    return (
                      <div key={it.kategoriItemId} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold">{it.etikete}</div>
                          <div className="text-xs text-gray-600">key: {it.key}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            className="rounded-lg border px-2 py-1"
                            value={st}
                            onChange={(e) => {
                              const v = e.target.value as Status | "";
                              setSelected((prev) => {
                                const next = { ...prev };
                                if (!v) delete next[k];
                                else next[k] = v;
                                return next;
                              });
                            }}
                          >
                            <option value="">—</option>
                            <option value="OK">OK</option>
                            <option value="WARN">WARN</option>
                            <option value="FAIL">FAIL</option>
                          </select>

                          <button
                            className="rounded-lg border px-2 py-1 hover:bg-gray-50"
                            type="button"
                            onClick={() => {
                              setSelected((prev) => {
                                const next = { ...prev };
                                delete next[k];
                                return next;
                              });
                            }}
                          >
                            Hiq
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-3 text-xs text-gray-600">
                Ruhet kur klikon <b>Ruaj</b>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
