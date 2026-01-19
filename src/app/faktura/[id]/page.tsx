"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Klient = {
  klientId: string;
  emri: string;
  mbiemri: string | null;
  telefoni: string | null;
  adresa?: string | null;
};

type Automjet = {
  automjetId: string;
  klientId: string;
  marka: string | null;
  modeli: string | null;
  viti: number | null;
  targa: string | null;
  vin: string | null;
  motori?: string | null;
};

type Rresht = { rreshtId: string; pershkrimi: string; sasia: number; cmimi: string; totali: string };

type Pagesa = {
  pagesaId: string;
  dataPageses: string;
  menyra: string;
  shuma: string;
  zbritje?: string; // ✅
  shenim: string | null;
};

type LlojiRreshti = "PUNE" | "PJese";

function parseLloji(p: string): LlojiRreshti {
  const t = String(p ?? "").trim().toUpperCase();
  if (t.startsWith("PUNË:") || t.startsWith("PUNE:") || t.startsWith("PUNË -") || t.startsWith("PUNE -")) return "PUNE";
  if (t.startsWith("PJESË:") || t.startsWith("PJESE:") || t.startsWith("PJESË -") || t.startsWith("PJESE -")) return "PJese";
  return "PUNE";
}

function stripPrefix(p: string) {
  return String(p ?? "")
    .replace(/^PUNË:\s*/i, "")
    .replace(/^PUNE:\s*/i, "")
    .replace(/^PUNË\s*-\s*/i, "")
    .replace(/^PUNE\s*-\s*/i, "")
    .replace(/^PJESË:\s*/i, "")
    .replace(/^PJESE:\s*/i, "")
    .replace(/^PJESË\s*-\s*/i, "")
    .replace(/^PJESE\s*-\s*/i, "")
    .trim();
}

function addPrefix(lloji: LlojiRreshti, tekst: string) {
  const clean = stripPrefix(tekst);
  return lloji === "PUNE" ? `PUNË: ${clean}` : `PJESË: ${clean}`;
}

export default function FakturaPage() {
  const params = useParams<{ id: string }>();
  const faktureId = params.id;

  const [data, setData] = useState<any>(null);
  const [rreshta, setRreshta] = useState<Rresht[]>([]);
  const [pagesa, setPagesa] = useState<Pagesa[]>([]);
  const [kliente, setKliente] = useState<Klient[]>([]);
  const [automjete, setAutomjete] = useState<Automjet[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // edit header
  const [editKlientId, setEditKlientId] = useState("");
  const [editAutomjetId, setEditAutomjetId] = useState("");
  const [editStatusi, setEditStatusi] = useState("Hap");
  const [editShenim, setEditShenim] = useState("");

  // add rresht
  const [newLloji, setNewLloji] = useState<LlojiRreshti>("PUNE");
  const [newPershkrimi, setNewPershkrimi] = useState("");
  const [newSasia, setNewSasia] = useState("1");
  const [newCmimi, setNewCmimi] = useState("");

  // pagesa form (✅ + zbritje brenda pagesës)
  const [pDate, setPDate] = useState("");
  const [pMenyra, setPMenyra] = useState("Cash");
  const [pShuma, setPShuma] = useState("");
  const [pZbritje, setPZbritje] = useState(""); // ✅
  const [pShenim, setPShenim] = useState("");

  async function loadAll() {
    setLoading(true);
    setErr(null);

    const [fRes, kRes, aRes, rrRes, pRes] = await Promise.all([
      fetch(`/api/faktura/${faktureId}`),
      fetch("/api/kliente"),
      fetch("/api/automjete"),
      fetch(`/api/faktura/${faktureId}/rreshta`),
      fetch(`/api/faktura/${faktureId}/pagesa`), // ✅ lexon pagesat me zbritje
    ]);

    const fJson = await fRes.json().catch(() => ({}));
    if (!fRes.ok) {
      setErr(fJson?.error ?? "Gabim");
      setLoading(false);
      return;
    }

    setData(fJson);
    setKliente(await kRes.json().catch(() => []));
    setAutomjete(await aRes.json().catch(() => []));
    setRreshta(await rrRes.json().catch(() => []));

    const pJson = await pRes.json().catch(() => []);
    setPagesa(Array.isArray(pJson) ? pJson : []);

    // fill edit fields
    setEditKlientId(fJson.fakture.klientId);
    setEditAutomjetId(fJson.fakture.automjetId ?? "");
    setEditStatusi(fJson.fakture.statusi);
    setEditShenim(fJson.fakture.shenim ?? "");

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faktureId]);

  const autosForClient = useMemo(() => {
    if (!editKlientId) return [];
    return automjete.filter((a) => a.klientId === editKlientId);
  }, [automjete, editKlientId]);

  // ✅ totals me zbritje (borxh s’bëhet negativ, teprica = bakshish)
  const totals = useMemo(() => {
    const total = rreshta.reduce((s, r) => s + Number(r.totali), 0);

    const paguar = pagesa.reduce((s, p) => s + Number(p.shuma ?? 0), 0);
    const zbritje = pagesa.reduce((s, p) => s + Number(p.zbritje ?? 0), 0);

    const totalFinal = Math.max(0, total - zbritje);
    const borxh = Math.max(0, totalFinal - paguar);
    const teprica = Math.max(0, paguar - totalFinal);

    return { total, zbritje, totalFinal, paguar, borxh, teprica };
  }, [rreshta, pagesa]);

  const puneRows = useMemo(() => rreshta.filter((r) => parseLloji(r.pershkrimi) === "PUNE"), [rreshta]);
  const pjeseRows = useMemo(() => rreshta.filter((r) => parseLloji(r.pershkrimi) === "PJese"), [rreshta]);

  const puneTotal = useMemo(() => puneRows.reduce((s, r) => s + Number(r.totali || 0), 0), [puneRows]);
  const pjeseTotal = useMemo(() => pjeseRows.reduce((s, r) => s + Number(r.totali || 0), 0), [pjeseRows]);

  async function saveHeader() {
    setErr(null);
    const res = await fetch(`/api/faktura/${faktureId}/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        klientId: editKlientId,
        automjetId: editAutomjetId || null,
        statusi: editStatusi,
        shenim: editShenim,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(d?.error ?? "Gabim gjatë ruajtjes.");

    await loadAll();
  }

  async function addRresht(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const pershkrimiPrefixed = addPrefix(newLloji, newPershkrimi);

    const res = await fetch(`/api/faktura/${faktureId}/rreshta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pershkrimi: pershkrimiPrefixed, sasia: newSasia, cmimi: newCmimi }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(d?.error ?? "Gabim duke shtuar rresht.");

    setNewPershkrimi("");
    setNewSasia("1");
    setNewCmimi("");
    setNewLloji("PUNE");
    await loadAll();
  }

  async function updateRresht(r: Rresht) {
    setErr(null);
    const res = await fetch(`/api/faktura-rreshta/${r.rreshtId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pershkrimi: r.pershkrimi, sasia: r.sasia, cmimi: r.cmimi }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(d?.error ?? "Gabim duke ndryshuar rresht.");
    await loadAll();
  }

  async function delRresht(id: string) {
    if (!confirm("Me fshi rreshtin?")) return;
    setErr(null);
    const res = await fetch(`/api/faktura-rreshta/${id}`, { method: "DELETE" });
    if (!res.ok) return setErr("S’u fshi rreshti.");
    await loadAll();
  }

  async function addPagesa(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch(`/api/faktura/${faktureId}/pagesa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataPageses: pDate,
        menyra: pMenyra,
        shuma: pShuma,
        zbritje: pZbritje, // ✅
        shenim: pShenim,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(d?.error ?? "Gabim duke shtuar pagesë.");

    setPDate("");
    setPMenyra("Cash");
    setPShuma("");
    setPZbritje("");
    setPShenim("");
    await loadAll();
  }

  async function delPagesa(id: string) {
    if (!confirm("Me fshi pagesën?")) return;
    setErr(null);
    const res = await fetch(`/api/faktura-pagesa/${id}`, { method: "DELETE" });
    if (!res.ok) return setErr("S’u fshi pagesa.");
    await loadAll();
  }

  if (loading) return <div className="text-sm text-gray-700">Duke ngarku…</div>;
  if (err) return <div className="text-sm text-red-600">{err}</div>;
  if (!data) return null;

  const { fakture, klient, automjet } = data;

  return (
    <div className="space-y-6 text-gray-900">
      {/* ✅ PRINT CSS: printo vetëm #invoice */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
          #invoice {
            display: block !important;
          }
          #invoice table {
            width: 100%;
            border-collapse: collapse;
          }
          #invoice th,
          #invoice td {
            border: 1px solid #111;
            padding: 6px;
            font-size: 12px;
          }
          #invoice th {
            background: #f2f2f2;
            text-align: left;
          }
        }
      `}</style>

      {/* EDIT CONTROLS (NUK PRINTON) */}
      <div className="print:hidden flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Fatura</h1>

        <div className="flex gap-2">
          <button onClick={() => window.print()} className="rounded-lg bg-black px-3 py-2 text-white">
            Printo
          </button>

          <button
            onClick={async () => {
              if (!confirm("Me fshi faturën?")) return;
              const res = await fetch(`/api/faktura/${faktureId}/delete`, { method: "DELETE" });
              const d = await res.json().catch(() => ({}));
              if (!res.ok) {
                alert(d?.error ?? "Gabim");
                return;
              }
              window.location.href = "/faktura";
            }}
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
            Fshi faturën
          </button>
        </div>
      </div>

      {/* EDIT HEADER */}
      <section className="print:hidden rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Edito faturën</h2>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <select
            className="rounded-lg border px-3 py-2"
            value={editKlientId}
            onChange={(e) => {
              setEditKlientId(e.target.value);
              setEditAutomjetId("");
            }}
          >
            <option value="">Zgjedh klientin</option>
            {kliente.map((k) => (
              <option key={k.klientId} value={k.klientId}>
                {k.emri} {k.mbiemri ?? ""} {k.telefoni ? `- ${k.telefoni}` : ""}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border px-3 py-2"
            value={editAutomjetId}
            onChange={(e) => setEditAutomjetId(e.target.value)}
            disabled={!editKlientId}
          >
            <option value="">Automjeti (opsional)</option>
            {autosForClient.map((a) => (
              <option key={a.automjetId} value={a.automjetId}>
                {[a.marka, a.modeli, a.viti, a.targa ? `(${a.targa})` : ""].filter(Boolean).join(" ")}
              </option>
            ))}
          </select>

          <select className="rounded-lg border px-3 py-2" value={editStatusi} onChange={(e) => setEditStatusi(e.target.value)}>
            <option value="Hap">Hap</option>
            <option value="Paguar">Paguar</option>
            <option value="Anuluar">Anuluar</option>
          </select>

          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Shënim (ops.)"
            value={editShenim}
            onChange={(e) => setEditShenim(e.target.value)}
          />

          <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-2" onClick={saveHeader}>
            Ruaj ndryshimet
          </button>
        </div>
      </section>

      {/* EDIT RRESHTA */}
      <section className="print:hidden rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Rreshtat</h2>

        <form className="mt-3 grid gap-2 md:grid-cols-12" onSubmit={addRresht}>
          <select className="rounded-lg border px-3 py-2 md:col-span-2" value={newLloji} onChange={(e) => setNewLloji(e.target.value as LlojiRreshti)}>
            <option value="PUNE">Punë</option>
            <option value="PJese">Pjesë</option>
          </select>

          <input
            className="rounded-lg border px-3 py-2 md:col-span-5"
            placeholder="Përshkrimi"
            value={newPershkrimi}
            onChange={(e) => setNewPershkrimi(e.target.value)}
          />
          <input className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="Sasia" value={newSasia} onChange={(e) => setNewSasia(e.target.value)} />
          <input className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="Çmimi (€)" value={newCmimi} onChange={(e) => setNewCmimi(e.target.value)} />
          <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-1">Shto</button>
        </form>

        {rreshta.length === 0 ? (
          <div className="mt-2 text-sm text-gray-700">Pa rreshta.</div>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="border-b text-left text-gray-800">
              <tr>
                <th className="py-2">Lloji</th>
                <th>Përshkrimi</th>
                <th>Sasia</th>
                <th>Çmimi</th>
                <th>Totali</th>
                <th className="text-right">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {rreshta.map((r) => {
                const lloji = parseLloji(r.pershkrimi);
                return (
                  <tr key={r.rreshtId} className="border-b align-top">
                    <td className="py-2 w-28">
                      <select
                        className="w-full rounded border px-2 py-1"
                        value={lloji}
                        onChange={(e) => {
                          const nx = e.target.value as LlojiRreshti;
                          setRreshta((all) =>
                            all.map((x) => (x.rreshtId === r.rreshtId ? { ...x, pershkrimi: addPrefix(nx, x.pershkrimi) } : x))
                          );
                        }}
                      >
                        <option value="PUNE">Punë</option>
                        <option value="PJese">Pjesë</option>
                      </select>
                    </td>

                    <td className="py-2">
                      <input
                        className="w-full rounded border px-2 py-1"
                        value={stripPrefix(r.pershkrimi)}
                        onChange={(e) =>
                          setRreshta((all) =>
                            all.map((x) => (x.rreshtId === r.rreshtId ? { ...x, pershkrimi: addPrefix(lloji, e.target.value) } : x))
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="w-20 rounded border px-2 py-1"
                        value={String(r.sasia)}
                        onChange={(e) =>
                          setRreshta((all) => all.map((x) => (x.rreshtId === r.rreshtId ? { ...x, sasia: Number(e.target.value || 0) } : x)))
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="w-28 rounded border px-2 py-1"
                        value={r.cmimi}
                        onChange={(e) => setRreshta((all) => all.map((x) => (x.rreshtId === r.rreshtId ? { ...x, cmimi: e.target.value } : x)))}
                      />
                    </td>

                    <td className="font-semibold">{(Number(r.sasia) * Number(r.cmimi || 0)).toFixed(2)} €</td>

                    <td className="text-right space-x-2">
                      <button className="rounded border px-2 py-1 hover:bg-gray-50" onClick={() => updateRresht(r)} type="button">
                        Ruaj
                      </button>
                      <button className="rounded border px-2 py-1 hover:bg-gray-50" onClick={() => delRresht(r.rreshtId)} type="button">
                        Fshi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="mt-3 text-right text-sm space-y-1">
          <div>Totali: <span className="font-semibold">{totals.total.toFixed(2)} €</span></div>
          <div>Zbritje: <span className="font-semibold">{totals.zbritje.toFixed(2)} €</span></div>
          <div>Totali Final: <span className="font-semibold">{totals.totalFinal.toFixed(2)} €</span></div>
          <div>Paguar: <span className="font-semibold">{totals.paguar.toFixed(2)} €</span></div>
          <div className={`font-semibold ${totals.borxh <= 0 ? "text-green-700" : "text-red-700"}`}>
            Borxh: {totals.borxh.toFixed(2)} €
          </div>
          {totals.teprica > 0 ? (
            <div className="font-semibold text-green-700">Bakshish/Tepricë: {totals.teprica.toFixed(2)} €</div>
          ) : null}
        </div>
      </section>

      {/* ✅ PAGESA + ZBRITJE brenda formës (opsionale) */}
      <section className="print:hidden rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Pagesat</h2>

        <form className="mt-3 grid gap-2 md:grid-cols-5" onSubmit={addPagesa}>
          <input className="rounded-lg border px-3 py-2" type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} />

          <select className="rounded-lg border px-3 py-2" value={pMenyra} onChange={(e) => setPMenyra(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Transfer">Transfer</option>
            <option value="Kartel">Kartel</option>
          </select>

          <input className="rounded-lg border px-3 py-2" placeholder="Shuma (€)" value={pShuma} onChange={(e) => setPShuma(e.target.value)} />

          <input className="rounded-lg border px-3 py-2" placeholder="Zbritje (ops.)" value={pZbritje} onChange={(e) => setPZbritje(e.target.value)} />

          <input className="rounded-lg border px-3 py-2" placeholder="Shënim (ops.)" value={pShenim} onChange={(e) => setPShenim(e.target.value)} />

          <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-5">Ruaj pagesë</button>
        </form>

        {pagesa.length === 0 ? (
          <div className="mt-2 text-sm text-gray-700">Pa pagesa.</div>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="border-b text-left text-gray-800">
              <tr>
                <th className="py-2">Data</th>
                <th>Mënyra</th>
                <th>Shuma (€)</th>
                <th>Zbritje (€)</th>
                <th>Shënim</th>
                <th className="text-right">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {pagesa.map((p) => (
                <tr key={p.pagesaId} className="border-b">
                  <td className="py-2">{new Date(p.dataPageses).toLocaleDateString()}</td>
                  <td>{p.menyra}</td>
                  <td className="font-semibold">{Number(p.shuma).toFixed(2)} €</td>
                  <td className="font-semibold">{Number(p.zbritje ?? 0).toFixed(2)} €</td>
                  <td>{p.shenim ?? ""}</td>
                  <td className="text-right">
                    <button className="rounded border px-2 py-1 hover:bg-gray-50" onClick={() => delPagesa(p.pagesaId)} type="button">
                      Fshi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ================= PRINT ONLY: Fatura (PUNË + PJESË) ================= */}
      <div id="invoice" className="rounded-xl border bg-white p-6">
        <div className="flex items-start justify-between">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo.png" alt="Sonic Garage" style={{ height: 90, width: 180, objectFit: "contain" }} />
            <div>
              <div className="text-xl font-semibold">Faturë</div>
              <div className="text-sm text-gray-700">EUR</div>
            </div>
          </div>

          <div className="text-right text-sm">
            <div><span className="font-semibold">Nr. Fature:</span> {fakture.nrFakture ?? faktureId}</div>
            <div><span className="font-semibold">Data:</span> {new Date(fakture.data).toLocaleDateString()}</div>
            <div><span className="font-semibold">Statusi:</span> {fakture.statusi}</div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <div className="font-semibold">Klienti</div>
            <div>{klient.emri} {klient.mbiemri ?? ""}</div>
            {klient.telefoni ? <div className="text-gray-700">Tel: {klient.telefoni}</div> : null}
            {klient.adresa ? <div className="text-gray-700">Adresa: {klient.adresa}</div> : null}
          </div>

          <div>
            <div className="font-semibold">Automjeti</div>
            {automjet ? (
              <>
                <div>{automjet.marka ?? ""} {automjet.modeli ?? ""} {automjet.viti ?? ""}</div>
                <div className="text-gray-700">Targa: {automjet.targa ?? "-"}</div>
                <div className="text-gray-700">VIN: {automjet.vin ?? "-"}</div>
                {automjet.motori ? <div className="text-gray-700">Motori: {automjet.motori}</div> : null}
              </>
            ) : <div className="text-gray-700">—</div>}
          </div>
        </div>

        {/* PUNË */}
        <div className="mt-6">
          <div className="font-semibold">PUNË</div>
          {puneRows.length === 0 ? (
            <div className="text-sm text-gray-700">Pa punë.</div>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead className="border-b text-left">
                <tr>
                  <th className="py-2">Përshkrimi</th>
                  <th>Sasia</th>
                  <th>Çmimi (€)</th>
                  <th>Totali (€)</th>
                </tr>
              </thead>
              <tbody>
                {puneRows.map((r) => (
                  <tr key={r.rreshtId} className="border-b">
                    <td className="py-2">{stripPrefix(r.pershkrimi)}</td>
                    <td>{r.sasia}</td>
                    <td>{Number(r.cmimi).toFixed(2)}</td>
                    <td className="font-semibold">{(Number(r.sasia) * Number(r.cmimi)).toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="py-2 text-right font-semibold">Totali Punë</td>
                  <td className="font-semibold">{puneTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* PJESË */}
        <div className="mt-6">
          <div className="font-semibold">PJESË</div>
          {pjeseRows.length === 0 ? (
            <div className="text-sm text-gray-700">Pa pjesë.</div>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead className="border-b text-left">
                <tr>
                  <th className="py-2">Përshkrimi</th>
                  <th>Sasia</th>
                  <th>Çmimi (€)</th>
                  <th>Totali (€)</th>
                </tr>
              </thead>
              <tbody>
                {pjeseRows.map((r) => (
                  <tr key={r.rreshtId} className="border-b">
                    <td className="py-2">{stripPrefix(r.pershkrimi)}</td>
                    <td>{r.sasia}</td>
                    <td>{Number(r.cmimi).toFixed(2)}</td>
                    <td className="font-semibold">{(Number(r.sasia) * Number(r.cmimi)).toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="py-2 text-right font-semibold">Totali Pjesë</td>
                  <td className="font-semibold">{pjeseTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* TOTALS */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-sm text-sm space-y-1">
            <div className="flex justify-between"><span>Totali</span><span>{totals.total.toFixed(2)} €</span></div>
            <div className="flex justify-between"><span>Zbritje</span><span>{totals.zbritje.toFixed(2)} €</span></div>
            <div className="flex justify-between font-semibold"><span>Totali Final</span><span>{totals.totalFinal.toFixed(2)} €</span></div>
            <div className="flex justify-between"><span>Paguar</span><span>{totals.paguar.toFixed(2)} €</span></div>
            <div className={`mt-1 flex justify-between font-semibold ${totals.borxh <= 0 ? "text-green-700" : "text-red-700"}`}>
              <span>Borxh</span><span>{totals.borxh.toFixed(2)} €</span>
            </div>
           
          </div>
        </div>

        {fakture.shenim ? (
          <div className="mt-6 text-sm text-gray-700">
            <span className="font-semibold">Shënim:</span> {fakture.shenim}
          </div>
        ) : null}

        <div className="mt-10 text-center text-sm text-gray-700">
          Faleminderit për besimin!
        </div>
      </div>
    </div>
  );
}
