"use client";

import { useEffect, useMemo, useState } from "react";

function eur(n: number) {
  return new Intl.NumberFormat("sq-AL", { style: "currency", currency: "EUR" }).format(Number(n || 0));
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type ShpenzimRow = {
  shpenzimId: string;
  data: string | null;
  pershkrimi: string;
  kategoria: string | null;
  shuma: number;
  shenim: string | null;
};

type DaljeRow = {
  levizjeId: string;
  data: string | null;
  sasia: number;
  cmimiBlerje: number;
  cmimiShitje: number;
  kosto: number;
  shitje: number;
  fitim: number;
  shenim: string | null;
  pjese: {
    inventarId: string;
    emri: string;
    kodi: string | null;
    marka: string | null;
    modeli: string | null;
  };
};

type DailyResponse = {
  ok: boolean;
  date: string;

  teHyraFatura: number;

  pagesaAplikuar: number;
  bakshish: number;
  teHyraCash: number;

  kostoPjesesh: number;
  shpenzimeTjera: number;
  fitimNeto: number;

  borxhInfo: number;

  shpenzimeList: ShpenzimRow[];
  daljeList: DaljeRow[];

  daljeKostoTotal: number;
  daljeShitjeTotal: number;
  daljeFitimTotal: number;
};

export default function RaporteDitorePage() {
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [r, setR] = useState<DailyResponse | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    const res = await fetch(`/api/raporte/ditore?d=${encodeURIComponent(date)}`, { cache: "no-store" });
    const d = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(d?.error ?? "Gabim");
      setR(null);
      setLoading(false);
      return;
    }

    setR(d);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = useMemo(() => {
    const x = r ?? ({
      teHyraFatura: 0,
      pagesaAplikuar: 0,
      bakshish: 0,
      teHyraCash: 0,
      kostoPjesesh: 0,
      shpenzimeTjera: 0,
      fitimNeto: 0,
      borxhInfo: 0,
    } as any);

    return [
      { title: "Të hyra (Fatura)", value: eur(x.teHyraFatura), sub: "nga rreshtat e faturave (krijim fature)" },
      { title: "Pagesa (aplikuar)", value: eur(x.pagesaAplikuar), sub: "pagesa që mbulojnë faturat" },
      { title: "Bakshish", value: eur(x.bakshish), sub: "overpay mbi totalin e faturës" },
      { title: "Cash total", value: eur(x.teHyraCash), sub: "pagesa + bakshish" },
      { title: "Kosto pjesësh", value: eur(x.kostoPjesesh), sub: "kosto blerje (DALJE)" },
      { title: "Shpenzime tjera", value: eur(x.shpenzimeTjera), sub: "nga shpenzimet" },
      {
        title: "Fitim neto",
        value: eur(x.fitimNeto),
        sub: "cash - kosto - shpenzime",
        good: x.fitimNeto >= 0,
      },
      { title: "Borxh (info)", value: eur(x.borxhInfo), sub: "fatura të asaj dite pa u mbuluar" },
    ];
  }, [r]);

  return (
    <div className="p-6">
      <div className="max-w-6xl border rounded-2xl bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Raporte Ditore</h1>
            <p className="text-sm text-gray-600">Përmbledhje ditore (EUR).</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-700">Data</div>
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button className="bg-black text-white rounded-lg px-4 py-2" onClick={load}>
              Shfaq
            </button>
          </div>
        </div>

        {err ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{err}</div>
        ) : null}

        {loading ? (
          <div className="mt-4 text-sm text-gray-700">Duke ngarkuar…</div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
              {cards.map((c) => (
                <div key={c.title} className="border rounded-xl p-4">
                  <div className="text-sm text-gray-600">{c.title}</div>
                  <div
                    className={`text-xl font-semibold ${
                      c.title === "Fitim neto" ? (c.good ? "text-green-700" : "text-red-700") : ""
                    }`}
                  >
                    {c.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* SHPENZIME */}
            <div className="mt-6 border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Shpenzimet (dita)</div>
                <div className="text-sm text-gray-700">Total: <b>{eur(r?.shpenzimeTjera ?? 0)}</b></div>
              </div>

              {(r?.shpenzimeList ?? []).length === 0 ? (
                <div className="mt-2 text-sm text-gray-700">S’ka shpenzime.</div>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b text-left text-gray-800">
                      <tr>
                        <th className="py-2">Data</th>
                        <th>Kategoria</th>
                        <th>Përshkrimi</th>
                        <th>Shënim</th>
                        <th className="text-right">Shuma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r!.shpenzimeList.map((x) => (
                        <tr key={x.shpenzimId} className="border-b">
                          <td className="py-2">{x.data ? new Date(x.data).toLocaleString() : "-"}</td>
                          <td>{x.kategoria ?? "-"}</td>
                          <td>{x.pershkrimi}</td>
                          <td>{x.shenim ?? ""}</td>
                          <td className="text-right font-semibold">{eur(x.shuma)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* DALJET INVENTAR */}
            <div className="mt-6 border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Daljet e inventarit (dita)</div>
                <div className="text-sm text-gray-700">
                  Kosto: <b>{eur(r?.daljeKostoTotal ?? 0)}</b> • Fitim:{" "}
                  <b className={(r?.daljeFitimTotal ?? 0) >= 0 ? "text-green-700" : "text-red-700"}>
                    {eur(r?.daljeFitimTotal ?? 0)}
                  </b>
                </div>
              </div>

              {(r?.daljeList ?? []).length === 0 ? (
                <div className="mt-2 text-sm text-gray-700">S’ka dalje.</div>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b text-left text-gray-800">
                      <tr>
                        <th className="py-2">Data</th>
                        <th>Pjesa</th>
                        <th>Kodi</th>
                        <th>Sasia</th>
                        <th>Cmimi blerje</th>
                        <th>Cmimi shitje</th>
                        <th>Kosto</th>
                        <th>Fitim</th>
                        <th>Shënim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r!.daljeList.map((x) => (
                        <tr key={x.levizjeId} className="border-b">
                          <td className="py-2">{x.data ? new Date(x.data).toLocaleString() : "-"}</td>
                          <td>{x.pjese?.emri ?? "Pjesë"}</td>
                          <td>{x.pjese?.kodi ?? "-"}</td>
                          <td>{Number(x.sasia ?? 0)}</td>
                          <td>{Number(x.cmimiBlerje ?? 0).toFixed(2)} €</td>
                          <td>{Number(x.cmimiShitje ?? 0).toFixed(2)} €</td>
                          <td className="font-semibold">{Number(x.kosto ?? 0).toFixed(2)} €</td>
                          <td className={`font-semibold ${Number(x.fitim ?? 0) >= 0 ? "text-green-700" : "text-red-700"}`}>
                            {Number(x.fitim ?? 0).toFixed(2)} €
                          </td>
                          <td>{x.shenim ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-3 text-sm text-right">
                    <div>Total Kosto: <b>{eur(r?.daljeKostoTotal ?? 0)}</b></div>
                    <div>Total Shitje (info): <b>{eur(r?.daljeShitjeTotal ?? 0)}</b></div>
                    <div className={(r?.daljeFitimTotal ?? 0) >= 0 ? "text-green-700" : "text-red-700"}>
                      Total Fitim: <b>{eur(r?.daljeFitimTotal ?? 0)}</b>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
