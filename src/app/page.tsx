"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Dash = {
  ym: string;
  cards: {
    teHyra: string;
    kostoPjesesh: string;
    shpenzimeTjera: string;
    fitimNeto: string;
    borxhiTopTotal: string;
  };
  servise: Array<{
    servisId: string;
    dataServisit: string;
    pershkrimi: string;
    automjet: string;
    targa: string;
    klient: string;
  }>;
  lowStock: Array<{ inventarId: string; emri: string; sasiaStok: number }>;
  borxheTop: Array<{ faktureId: string; nrFakture: string; klient: string; borxh: string }>;
};

function thisMonthYM() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function DashboardPage() {
  const [ym, setYm] = useState(thisMonthYM());
  const [data, setData] = useState<Dash | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr(null);

    const res = await fetch(`/api/dashboard?ym=${encodeURIComponent(ym)}`);
    const d = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(d?.error ?? "Gabim");
      setData(null);
      setLoading(false);
      return;
    }

    setData(d);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ym]);

  const cards = useMemo(() => {
    if (!data) return null;
    return {
      teHyra: Number(data.cards.teHyra),
      kosto: Number(data.cards.kostoPjesesh),
      shpenzime: Number(data.cards.shpenzimeTjera),
      fitimNeto: Number(data.cards.fitimNeto),
      borxhi: Number(data.cards.borxhiTopTotal),
    };
  }, [data]);

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-700">Përmbledhje mujore (EUR) + servise hap.</p>
        </div>

        <div className="flex items-end gap-2">
          <div className="text-sm text-gray-700">Muaji</div>
          <input
            className="rounded-lg border px-3 py-2"
            type="month"
            value={ym}
            onChange={(e) => setYm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-700">Duke ngarku…</div>
      ) : err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
      ) : !data || !cards ? null : (
        <>
          <div className="grid gap-3 md:grid-cols-5">
            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-700">Të hyra</div>
              <div className="text-xl font-semibold">{cards.teHyra.toFixed(2)} €</div>
              <div className="mt-2 text-xs text-gray-600">
                <Link className="underline" href="/faktura">Shiko faturat</Link>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-700">Kosto pjesësh</div>
              <div className="text-xl font-semibold">{cards.kosto.toFixed(2)} €</div>
              <div className="mt-2 text-xs text-gray-600">
                (DALJE nga inventari)
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-700">Shpenzime tjera</div>
              <div className="text-xl font-semibold">{cards.shpenzime.toFixed(2)} €</div>
              <div className="mt-2 text-xs text-gray-600">
                <Link className="underline" href="/shpenzime">Menaxho shpenzimet</Link>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-700">Fitim neto</div>
              <div className={`text-xl font-semibold ${cards.fitimNeto >= 0 ? "text-green-700" : "text-red-700"}`}>
                {cards.fitimNeto.toFixed(2)} €
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <Link className="underline" href="/raporte">Raporte</Link>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-700">Borxhe (Top)</div>
              <div className={`text-xl font-semibold ${cards.borxhi > 0 ? "text-red-700" : "text-green-700"}`}>
                {cards.borxhi.toFixed(2)} €
              </div>
              <div className="mt-2 text-xs text-gray-600">
                (fatura me borxh)
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {/* Servise hap */}
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Servise Hap</h2>
                <Link className="text-sm underline" href="/servise">Të gjitha</Link>
              </div>

              {data.servise.length === 0 ? (
                <div className="mt-2 text-sm text-gray-700">S’ka servise hap.</div>
              ) : (
                <div className="mt-3 space-y-2">
                  {data.servise.map((s) => (
                    <div key={s.servisId} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">
                            {s.automjet} {s.targa ? `(${s.targa})` : ""}
                          </div>
                          <div className="text-sm text-gray-700">{s.klient}</div>
                          {s.pershkrimi ? <div className="mt-1 text-sm text-gray-700">{s.pershkrimi}</div> : null}
                        </div>
                        <Link className="rounded-lg border px-2 py-1 hover:bg-gray-50" href={`/servise/${s.servisId}`}>
                          Hape
                        </Link>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {new Date(s.dataServisit).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low stock */}
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Low-stock</h2>
                <Link className="text-sm underline" href="/inventar">Inventar</Link>
              </div>

              {data.lowStock.length === 0 ? (
                <div className="mt-2 text-sm text-gray-700">Nuk ka low-stock (≤ 2).</div>
              ) : (
                <div className="mt-3 space-y-2">
                  {data.lowStock.map((x) => (
                    <div key={x.inventarId} className="rounded-lg border p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{x.emri}</div>
                        <div className="text-sm text-gray-700">Stok: {x.sasiaStok}</div>
                      </div>
                      <Link className="rounded-lg border px-2 py-1 hover:bg-gray-50" href="/inventar">
                        Hape
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Borxhe top */}
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Borxhe (Top)</h2>
              <Link className="text-sm underline" href="/faktura">Fatura</Link>
            </div>

            {data.borxheTop.length === 0 ? (
              <div className="mt-2 text-sm text-gray-700">S’ka borxhe.</div>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-left text-gray-800">
                    <tr>
                      <th className="py-2">Fatura</th>
                      <th>Klienti</th>
                      <th>Borxh (€)</th>
                      <th className="text-right">Veprime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.borxheTop.map((b) => (
                      <tr key={b.faktureId} className="border-b">
                        <td className="py-2 font-semibold">{b.nrFakture}</td>
                        <td>{b.klient}</td>
                        <td className="font-semibold text-red-700">{Number(b.borxh).toFixed(2)}</td>
                        <td className="text-right">
                          <Link className="rounded-lg border px-2 py-1 hover:bg-gray-50" href={`/faktura/${b.faktureId}`}>
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
        </>
      )}
    </div>
  );
}
