"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Pune = {
  puneId: string;
  servisId: string;
  pershkrimi: string;
  sasia: number;
  cmimi: string;
  totali: string;
};

type Pjese = {
  pjeseId: string;
  servisId: string;
  pershkrimi: string;
  sasia: number;
  cmimi: string;
  totali: string;
  furnizues: string;
  inventarId: string; // "" nëse manual
  inventarEmri: string;
};

type Pagesa = {
  pagesaId: string;
  servisId: string;
  dataPageses: string;
  menyra: string;
  shuma: string;
  shenim: string | null;
};

type InvItem = {
  inventarId: string;
  emri: string;
  kodi: string;
  marka: string;
  modeli: string;
  sasiaStok: number;
  cmimiShitje: string;
  cmimiBlerje: string;
};

export default function ServisPage() {
  const params = useParams<{ id: string }>();
  const servisId = params.id;
  const router = useRouter();

  const [tab, setTab] = useState<"pune" | "pjese" | "pagesa">("pune");

  const [punet, setPunet] = useState<Pune[]>([]);
  const [pjeset, setPjeset] = useState<Pjese[]>([]);
  const [pagesat, setPagesat] = useState<Pagesa[]>([]);
  const [invList, setInvList] = useState<InvItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // ===== PUNE FORM
  const [p_pershkrimi, setP_pershkrimi] = useState("");
  const [p_sasia, setP_sasia] = useState("1");
  const [p_cmimi, setP_cmimi] = useState("");

  // ===== PJESË FORM (INVENTAR + MANUAL)
  const [invId, setInvId] = useState("");
  const [pjPershkrimi, setPjPershkrimi] = useState("");
  const [pjSasia, setPjSasia] = useState("1");
  const [pjCmimi, setPjCmimi] = useState("");
  const [pjFurnizues, setPjFurnizues] = useState("");

  // ===== PAGESA FORM
  const [payData, setPayData] = useState("");
  const [payMenyra, setPayMenyra] = useState("Cash");
  const [payShuma, setPayShuma] = useState("");
  const [payShenim, setPayShenim] = useState("");

  // ===== FATURE NGA SERVISI
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const totalPunet = useMemo(() => punet.reduce((s, p) => s + Number(p.totali ?? 0), 0), [punet]);
  const totalPjeset = useMemo(() => pjeset.reduce((s, p) => s + Number(p.totali ?? 0), 0), [pjeset]);
  const totalGjithsej = totalPunet + totalPjeset;
  const totalPaguar = useMemo(() => pagesat.reduce((s, p) => s + Number(p.shuma ?? 0), 0), [pagesat]);
  const borxhi = totalGjithsej - totalPaguar;

  async function fetchJson(url: string) {
    const res = await fetch(url);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (!res.ok) throw new Error(json?.detail ? `${json.error}: ${json.detail}` : (json?.error ?? "Gabim"));
      return json;
    } catch {
      if (!res.ok) throw new Error(`API ktheu jo-JSON: ${text.slice(0, 140)}`);
      return [];
    }
  }

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const [pune, pjese, pay, inv] = await Promise.all([
        fetchJson(`/api/servise/${servisId}/pune`),
        fetchJson(`/api/servise/${servisId}/pjese`),
        fetchJson(`/api/servise/${servisId}/pagesa`),
        fetchJson(`/api/inventar/list`),
      ]);

      setPunet(Array.isArray(pune) ? pune : []);
      setPjeset(Array.isArray(pjese) ? pjese : []);
      setPagesat(Array.isArray(pay) ? pay : []);
      setInvList(Array.isArray(inv) ? inv : []);
    } catch (e: any) {
      setErr(e?.message ?? "Gabim");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servisId]);

  // ===================== PUNE =====================
  async function addPune(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch(`/api/servise/${servisId}/pune`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pershkrimi: p_pershkrimi,
        sasia: p_sasia,
        cmimi: p_cmimi,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.detail ? `${d.error}: ${d.detail}` : (d?.error ?? "Gabim duke shtuar punë"));
      return;
    }

    setP_pershkrimi("");
    setP_sasia("1");
    setP_cmimi("");
    await loadAll();
  }

  async function delPune(id: string) {
    if (!confirm("Me fshi punën?")) return;
    setErr(null);

    const res = await fetch(`/api/pune/${id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.detail ? `${d.error}: ${d.detail}` : (d?.error ?? "S’u fshi puna"));
      return;
    }
    await loadAll();
  }

  // ===================== PJESË (INVENTAR INTEGRIM) =====================
  async function addPjese(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch(`/api/servise/${servisId}/pjese`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inventarId: invId || "",
        pershkrimi: pjPershkrimi,
        sasia: pjSasia,
        cmimi: pjCmimi,
        furnizues: pjFurnizues,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.detail ? `${d.error}: ${d.detail}` : (d?.error ?? "Gabim duke shtuar pjesë"));
      return;
    }

    setInvId("");
    setPjPershkrimi("");
    setPjSasia("1");
    setPjCmimi("");
    setPjFurnizues("");
    await loadAll();
  }

  async function delPjese(pjeseId: string) {
    if (!confirm("Me fshi pjesën?")) return;
    setErr(null);

    // e re: fshirje që kthen stokun mbrapsht nëse ishte nga inventari
    const res = await fetch(`/api/pjese-servisi/${pjeseId}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.detail ? `${d.error}: ${d.detail}` : (d?.error ?? "Gabim duke fshirë pjesën"));
      return;
    }
    await loadAll();
  }

  // ===================== PAGESA =====================
  async function addPagesa(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch(`/api/servise/${servisId}/pagesa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataPageses: payData,
        menyra: payMenyra,
        shuma: payShuma,
        shenim: payShenim,
      }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.detail ? `${d.error}: ${d.detail}` : (d?.error ?? "Gabim duke shtuar pagesë"));
      return;
    }

    setPayData("");
    setPayMenyra("Cash");
    setPayShuma("");
    setPayShenim("");
    await loadAll();
  }

  async function delPagesa(id: string) {
    if (!confirm("Me fshi pagesën?")) return;
    setErr(null);

    const res = await fetch(`/api/pagesa/${id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.detail ? `${d.error}: ${d.detail}` : (d?.error ?? "S’u fshi pagesa"));
      return;
    }
    await loadAll();
  }

  // ===================== FATURE NGA SERVISI =====================
  async function krijoFaktureNgaServisi() {
    setCreatingInvoice(true);
    setErr(null);

    try {
      const res = await fetch(`/api/servise/${servisId}/krijo-fakture`, { method: "POST" });
      const d = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(d?.detail ? `${d.error}: ${d.detail}` : (d?.error ?? "Gabim gjatë krijimit të faturës"));
        return;
      }

      router.push(`/faktura/${d.faktureId}`);
    } catch (e: any) {
      setErr(e?.message ?? "Gabim gjatë krijimit të faturës");
    } finally {
      setCreatingInvoice(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-700">Duke ngarku…</div>;
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Servisi</h1>
          <p className="text-sm text-gray-700">Punë • Pjesë (Inventar) • Pagesa • EUR</p>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <div className="text-right">
            <div className="text-sm text-gray-700">Totali</div>
            <div className="text-xl font-semibold">{totalGjithsej.toFixed(2)} €</div>
            <div className="mt-1 text-sm text-gray-700">Paguar: {totalPaguar.toFixed(2)} €</div>
            <div className={`text-sm font-semibold ${borxhi <= 0 ? "text-green-700" : "text-red-700"}`}>
              Borxh: {borxhi.toFixed(2)} €
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={krijoFaktureNgaServisi}
              className="rounded-lg bg-black px-3 py-2 text-white disabled:opacity-60"
              disabled={creatingInvoice}
              title="Krijon faturë me rreshta nga Punë + Pjesë"
            >
              {creatingInvoice ? "Duke kriju faturën..." : "Krijo faturë automatikisht"}
            </button>

            <Link
              href="/faktura"
              className="rounded-lg border px-3 py-2 hover:bg-gray-50"
              title="Shko te lista e faturave"
            >
              Faktura
            </Link>
          </div>
        </div>
      </div>

      {err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          className={`rounded-lg border px-3 py-2 text-sm ${tab === "pune" ? "bg-black text-white" : "hover:bg-gray-50"}`}
          onClick={() => setTab("pune")}
        >
          Punë ({punet.length})
        </button>
        <button
          className={`rounded-lg border px-3 py-2 text-sm ${tab === "pjese" ? "bg-black text-white" : "hover:bg-gray-50"}`}
          onClick={() => setTab("pjese")}
        >
          Pjesë ({pjeset.length})
        </button>
        <button
          className={`rounded-lg border px-3 py-2 text-sm ${tab === "pagesa" ? "bg-black text-white" : "hover:bg-gray-50"}`}
          onClick={() => setTab("pagesa")}
        >
          Pagesa ({pagesat.length})
        </button>
      </div>

      {/* ===================== TAB: PUNE ===================== */}
      {tab === "pune" ? (
        <div className="space-y-4">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Shto punë</h2>
            <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={addPune}>
              <input
                className="rounded-lg border px-3 py-2 md:col-span-2"
                placeholder="Përshkrimi i punës"
                value={p_pershkrimi}
                onChange={(e) => setP_pershkrimi(e.target.value)}
              />
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Sasia"
                value={p_sasia}
                onChange={(e) => setP_sasia(e.target.value)}
              />
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Çmimi (€)"
                value={p_cmimi}
                onChange={(e) => setP_cmimi(e.target.value)}
              />
              <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-4">
                Shto
              </button>
            </form>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Lista e punëve</h2>
              <div className="text-sm font-semibold">Totali: {totalPunet.toFixed(2)} €</div>
            </div>

            {punet.length === 0 ? (
              <div className="mt-2 text-sm text-gray-700">S’ka punë ende.</div>
            ) : (
              <table className="mt-3 w-full text-sm">
                <thead className="border-b text-left text-gray-800">
                  <tr>
                    <th className="py-2">Përshkrimi</th>
                    <th>Sasia</th>
                    <th>Çmimi (€)</th>
                    <th>Totali (€)</th>
                    <th className="text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {punet.map((p) => (
                    <tr key={p.puneId} className="border-b">
                      <td className="py-2">{p.pershkrimi}</td>
                      <td>{p.sasia}</td>
                      <td>{Number(p.cmimi || 0).toFixed(2)}</td>
                      <td className="font-semibold">{Number(p.totali || 0).toFixed(2)}</td>
                      <td className="text-right">
                        <button
                          className="rounded-lg border px-2 py-1 hover:bg-gray-50"
                          onClick={() => delPune(p.puneId)}
                        >
                          Fshi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      ) : null}

      {/* ===================== TAB: PJESË ===================== */}
      {tab === "pjese" ? (
        <div className="space-y-4">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Shto pjesë</h2>

            <form className="mt-3 grid gap-2 md:grid-cols-12" onSubmit={addPjese}>
              <select
                className="rounded-lg border px-3 py-2 md:col-span-5"
                value={invId}
                onChange={(e) => {
                  const v = e.target.value;
                  setInvId(v);

                  const found = invList.find((x) => x.inventarId === v);
                  if (found) {
                    if (!pjCmimi) setPjCmimi(String(found.cmimiShitje ?? ""));
                    // pershkrimi merret nga inventari në API, kështu këtu e lëmë manual për opsion
                  }
                }}
              >
                <option value="">Zgjedh nga inventari (opsional)</option>
                {invList.map((x) => (
                  <option key={x.inventarId} value={x.inventarId}>
                    {x.emri} {x.kodi ? `- ${x.kodi}` : ""} (Stok: {x.sasiaStok})
                  </option>
                ))}
              </select>

              <input
                className="rounded-lg border px-3 py-2 md:col-span-4"
                placeholder="Ose shkruaj pjesën manualisht"
                value={pjPershkrimi}
                onChange={(e) => setPjPershkrimi(e.target.value)}
              />

              <input
                className="rounded-lg border px-3 py-2 md:col-span-1"
                placeholder="Sasia"
                value={pjSasia}
                onChange={(e) => setPjSasia(e.target.value)}
              />

              <input
                className="rounded-lg border px-3 py-2 md:col-span-2"
                placeholder="Çmimi (€)"
                value={pjCmimi}
                onChange={(e) => setPjCmimi(e.target.value)}
              />

              <input
                className="rounded-lg border px-3 py-2 md:col-span-10"
                placeholder="Furnizues (opsional, vetëm tekst për manual)"
                value={pjFurnizues}
                onChange={(e) => setPjFurnizues(e.target.value)}
              />

              <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-2">
                Shto
              </button>
            </form>

            <div className="mt-2 text-xs text-gray-600">
              * Nëse zgjedh pjesë nga inventari: stoku zbret automatikisht.
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Lista e pjesëve</h2>
              <div className="text-sm font-semibold">Totali: {totalPjeset.toFixed(2)} €</div>
            </div>

            {pjeset.length === 0 ? (
              <div className="mt-2 text-sm text-gray-700">S’ka pjesë ende.</div>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-left text-gray-800">
                    <tr>
                      <th className="py-2">Përshkrimi</th>
                      <th>Sasia</th>
                      <th>Çmimi (€)</th>
                      <th>Totali (€)</th>
                      <th>Inventar</th>
                      <th className="text-right">Veprime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pjeset.map((p) => (
                      <tr key={p.pjeseId} className="border-b align-top">
                        <td className="py-2">
                          {p.pershkrimi}
                          {p.inventarId ? (
                            <div className="text-xs text-gray-600">
                              Nga inventari: {p.inventarEmri || "Po"}
                            </div>
                          ) : null}
                        </td>
                        <td>{p.sasia}</td>
                        <td>{Number(p.cmimi || 0).toFixed(2)}</td>
                        <td className="font-semibold">{Number(p.totali || 0).toFixed(2)}</td>
                        <td className="text-gray-700">{p.inventarId ? "Po" : "Jo"}</td>
                        <td className="text-right">
                          <button
                            className="rounded-lg border px-2 py-1 hover:bg-gray-50"
                            onClick={() => delPjese(p.pjeseId)}
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
          </section>
        </div>
      ) : null}

      {/* ===================== TAB: PAGESA ===================== */}
      {tab === "pagesa" ? (
        <div className="space-y-4">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Shto pagesë</h2>
            <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={addPagesa}>
              <input
                className="rounded-lg border px-3 py-2"
                type="date"
                value={payData}
                onChange={(e) => setPayData(e.target.value)}
              />
              <select
                className="rounded-lg border px-3 py-2"
                value={payMenyra}
                onChange={(e) => setPayMenyra(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Transfer">Transfer</option>
                <option value="Kartel">Kartel</option>
              </select>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Shuma (€)"
                value={payShuma}
                onChange={(e) => setPayShuma(e.target.value)}
              />
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Shënim (ops.)"
                value={payShenim}
                onChange={(e) => setPayShenim(e.target.value)}
              />

              <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-4">
                Ruaj pagesë
              </button>
            </form>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Lista e pagesave</h2>
              <div className="text-sm font-semibold">Paguar: {totalPaguar.toFixed(2)} €</div>
            </div>

            {pagesat.length === 0 ? (
              <div className="mt-2 text-sm text-gray-700">S’ka pagesa ende.</div>
            ) : (
              <table className="mt-3 w-full text-sm">
                <thead className="border-b text-left text-gray-800">
                  <tr>
                    <th className="py-2">Data</th>
                    <th>Mënyra</th>
                    <th>Shuma (€)</th>
                    <th>Shënim</th>
                    <th className="text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {pagesat.map((p) => (
                    <tr key={p.pagesaId} className="border-b">
                      <td className="py-2">{new Date(p.dataPageses).toLocaleDateString()}</td>
                      <td>{p.menyra}</td>
                      <td className="font-semibold">{Number(p.shuma || 0).toFixed(2)}</td>
                      <td>{p.shenim ?? ""}</td>
                      <td className="text-right">
                        <button
                          className="rounded-lg border px-2 py-1 hover:bg-gray-50"
                          onClick={() => delPagesa(p.pagesaId)}
                        >
                          Fshi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className={`mt-3 text-right font-semibold ${borxhi <= 0 ? "text-green-700" : "text-red-700"}`}>
              Borxh: {borxhi.toFixed(2)} €
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
