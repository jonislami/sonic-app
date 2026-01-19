"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

// ⚠️ Nëse komponenti është te src/components/BodyDamagePanel.tsx kjo është rruga e saktë:
import BodyDamagePanel, { emptyDamage, type DamageKey } from "../../../../components/BodyDamagePanel";
import InspectionChecklistTraffic, { type TrafficState } from "../../../../components/InspectionChecklistTraffic";

type Inspektim = {
  inspektimId: string;
  data: string;
  statusi: string;
  km: string;
  komente: string;
  demtimeJson: string | null;
};

type Klient = {
  emri: string;
  mbiemri: string;
  telefoni: string;
};

type Automjet = {
  marka: string;
  modeli: string;
  viti: string | number;
  targa: string;
  vin: string;
  klient: Klient;
};

type Item = {
  grup: string;
  key: string;
  etikete: string;
  status: string; // p.sh. OK / WARN / FAIL / Vëmendje / Urgjente
};

type ApiResponse = {
  inspektim: Inspektim;
  automjet: Automjet;
  iteme: Item[];
};

function groupItems(items: Item[]) {
  const m: Record<string, Item[]> = {};
  for (const it of items) {
    const g = it.grup || "Tjera";
    if (!m[g]) m[g] = [];
    m[g].push(it);
  }
  return Object.entries(m);
}

// Normalizon statusin e item-it -> "OK" | "WARN" | "FAIL"
function normalizeStatus(s: string | null | undefined): "OK" | "WARN" | "FAIL" {
  const x = String(s ?? "").trim().toUpperCase();

  if (x.includes("OK")) return "OK";

  // warn / attention
  if (x.includes("WARN") || x.includes("VËMEND") || x.includes("VEMEND") || x.includes("ATTENTION"))
    return "WARN";

  // fail / urgent
  if (x.includes("FAIL") || x.includes("URGJ") || x.includes("URGENT") || x.includes("IMMEDIATE"))
    return "FAIL";

  // default nëse bosh: WARN
  return "WARN";
}

export default function PrintInspektimPage() {
  const params = useParams<{ inspektimId: string }>();
  const inspektimId = params?.inspektimId ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inspektim, setInspektim] = useState<Inspektim | null>(null);
  const [automjet, setAutomjet] = useState<Automjet | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [damage, setDamage] = useState<Record<DamageKey, boolean>>(emptyDamage());
  const [traffic, setTraffic] = useState<TrafficState>({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/inspektime/${inspektimId}`, { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as ApiResponse | null;

        if (!res.ok || !data) {
          setError((data as any)?.error ?? "Gabim gjatë marrjes së inspektimit");
          setLoading(false);
          return;
        }

        setInspektim(data.inspektim);
        setAutomjet(data.automjet);
        setItems(Array.isArray(data.iteme) ? data.iteme : []);

        // demtimeJson -> damage map
        if (data.inspektim?.demtimeJson) {
          try {
            const parsed = JSON.parse(data.inspektim.demtimeJson) as Record<string, boolean>;
            const next = emptyDamage();
            (Object.keys(next) as DamageKey[]).forEach((k) => {
              next[k] = Boolean(parsed?.[k]);
            });
            setDamage(next);
          } catch {
            setDamage(emptyDamage());
          }
        } else {
          setDamage(emptyDamage());
        }

        setLoading(false);
      } catch {
        setError("Gabim në komunikim me serverin");
        setLoading(false);
      }
    }

    if (inspektimId) load();
  }, [inspektimId]);

  const title = useMemo(() => {
    if (!automjet) return "Raport Inspektimi";
    return `${automjet.marka} ${automjet.modeli} ${automjet.viti} (${automjet.targa})`;
  }, [automjet]);

  function printNewWindow() {
    const el = document.getElementById("print-area");
    if (!el) {
      alert("S’u gjet print-area.");
      return;
    }

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Inspektim</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: Arial, sans-serif; color: #000; background:#fff; }
    h1 { font-size: 18px; margin: 0 0 8px 0; }
    .muted { color: #333; font-size: 12px; line-height: 1.4; }
    .box { border: 1px solid #111; border-radius: 10px; padding: 10px; }
    .grid { display: grid; grid-template-columns: 340px 1fr; gap: 12px; }

    .sectionTitle { font-weight: 700; margin: 0 0 8px 0; }

    /* === CHECKLIST layout si fotoja === */
    .legend { display:flex; align-items:center; gap:16px; margin-bottom: 10px; }
    .legItem { display:flex; align-items:center; gap:8px; font-size:12px; }
    .dot { width: 14px; height: 14px; border-radius: 4px; display:inline-block; }
    .dot.ok { background:#00b050; }
    .dot.warn { background:#ffc000; }
    .dot.fail { background:#ff0000; }

    .grpTitle { font-weight:700; margin: 14px 0 8px 0; font-size: 13px; }
    .row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding: 6px 0; border-bottom: 1px solid #e5e5e5; }
    .row:last-child { border-bottom: 0; }
    .label { font-size: 12px; }
    .boxes { display:flex; gap:10px; }
    .boxSq { width: 20px; height: 20px; border: 1px solid #111; border-radius: 4px; background:#fff; }
    .boxSq.ok { background:#00b050; }
    .boxSq.warn { background:#ffc000; }
    .boxSq.fail { background:#ff0000; }

    .foot { margin-top: 14px; font-size: 11px; color:#333; }

    /* Siguri print */
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style>
</head>
<body>
  ${el.outerHTML}
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>
`;

    const w = window.open("", "_blank", "width=900,height=900");
    if (!w) {
      alert("Browser e bllokoi popup. Lejo popups për localhost.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  if (loading) return <div className="p-6">Duke ngarkuar…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!inspektim || !automjet) return <div className="p-6">S’ka të dhëna.</div>;

  const grouped = groupItems(items);

  return (
    <div className="bg-white text-black min-h-screen p-6">
      {/* Butonat (normal, nuk ka auto-print) */}
      <div className="flex gap-2 mb-4">
        <button className="border px-3 py-2 rounded" onClick={() => window.history.back()}>
          Mbrapa
        </button>
        <button className="bg-black text-white px-4 py-2 rounded" onClick={printNewWindow}>
          Printo (PDF)
        </button>
      </div>

      {/* ZONA QË PRINTON */}
      <div id="print-area" className="box">
        {/* HEADER: të dhëna majtas, logo djathtas */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18 }}>Raport Inspektimi</h1>
            <div className="muted" style={{ marginTop: 6 }}>
              <b>Automjeti:</b> {automjet.marka ?? ""} {automjet.modeli ?? ""} ({automjet.viti ?? ""})<br />
              <b>Klienti:</b> {automjet.klient?.emri ?? ""} {automjet.klient?.mbiemri ?? ""}<br />
              <b>Tel:</b> {automjet.klient?.telefoni ?? "-"}<br />
              <b>Targa:</b> {automjet.targa ?? "-"}<br />
              <b>VIN:</b> {automjet.vin ?? "-"}<br />
              <b>Data:</b> {new Date(inspektim.data).toLocaleString()}<br />
              <b>KM:</b> {inspektim.km || "-"}<br />
              <b>Statusi:</b> {inspektim.statusi}
            </div>
          </div>

          <div style={{ width: 180, textAlign: "right" }}>
            <img
              src="/logo.png"
              alt="Sonic Garage"
              style={{ height: 90, width: 180, objectFit: "contain", display: "inline-block" }}
            />
          </div>
        </div>

        <div style={{ height: 12 }} />
        <hr style={{ border: 0, borderTop: "1px solid #111", margin: "0 0 12px 0" }} />

        <div className="grid">
          {/* LEFT */}
          <div className="box">
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12 }}>BODY DAMAGE</div>
            <div className="muted" style={{ marginBottom: 8 }}>
              
            </div>

            {/* Readonly – për print vetëm shfaqje */}
            <div style={{ pointerEvents: "none" }}>
              <BodyDamagePanel value={damage} onChange={setDamage} readonly />
            </div>

            <div style={{ height: 12 }} />

            <div className="sectionTitle">General Inspection Comments</div>
            <div
              style={{
                border: "1px solid #111",
                borderRadius: 8,
                padding: 8,
                minHeight: 80,
                fontSize: 12,
                whiteSpace: "pre-wrap",
              }}
            >
              {inspektim.komente ? inspektim.komente : "—"}
            </div>
          </div>

          {/* RIGHT: Checklist si fotoja */}
          <div className="box">
            <div className="sectionTitle">Checklist</div>

            {/* Legjenda */}
            <div className="box" style={{ padding: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>Legjenda</div>
              <div className="legend">
                <div className="legItem">
                  <span className="dot ok" /> OK
                </div>
                <div className="legItem">
                  <span className="dot warn" /> Vëmendje
                </div>
                <div className="legItem">
                  <span className="dot fail" /> Urgjente
                </div>
              </div>
            </div>

            {grouped.length === 0 ? (
              <div className="muted" style={{ marginTop: 10 }}>
                S’ka iteme.
              </div>
            ) : (
              grouped.map(([g, arr]) => (
                <div key={g} style={{ marginTop: 12 }}>
                  <div className="grpTitle">{g.toUpperCase()}</div>

                  {arr.map((it) => {
                    const st = normalizeStatus(it.status);
                    return (
                      <div key={it.key} className="row">
                        <div className="label">{it.etikete}</div>

                        {/* 3 kutiza djathtas */}
                        <div className="boxes">
                          <div className={`boxSq ${st === "OK" ? "ok" : ""}`} title="OK" />
                          <div className={`boxSq ${st === "WARN" ? "warn" : ""}`} title="Vëmendje" />
                          <div className={`boxSq ${st === "FAIL" ? "fail" : ""}`} title="Urgjente" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="foot">sonic-app • Raport Inspektimi • ID: {inspektimId}</div>
      </div>
    </div>
  );
}
