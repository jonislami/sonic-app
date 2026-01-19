"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ automjetId: string }>();
  const automjetId = params?.automjetId ? String(params.automjetId) : "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [automjet, setAutomjet] = useState<any>(null);

  async function loadAutomjet() {
    if (!automjetId) return;

    setLoading(true);
    setErr(null);

    const res = await fetch(`/api/automjete/${automjetId}`);
    const d = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(d?.error ?? "Gabim");
      setAutomjet(null);
      setLoading(false);
      return;
    }

    setAutomjet(d.automjet);
    setLoading(false);
  }

  async function createDraft() {
    if (!automjetId) return;

    setErr(null);

    const res = await fetch("/api/inspektime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ automjetId }),
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(d?.error ?? "Gabim gjatë krijimit të inspektit");
      return;
    }

    router.push(`/inspekt/edit/${d.inspektimId}`);
  }

  useEffect(() => {
    loadAutomjet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automjetId]);

  const title = useMemo(() => {
    if (!automjet) return "Inspekt";
    return `${automjet.marka} ${automjet.modeli} ${automjet.viti ?? ""} ${
      automjet.targa ? `(${automjet.targa})` : ""
    }`.trim();
  }, [automjet]);

  if (!automjetId) {
    return <div className="text-sm text-red-700">Gabim: automjetId mungon në URL.</div>;
  }

  if (loading) return <div className="text-sm text-gray-700">Duke ngarku…</div>;

  return (
    <div className="space-y-4 text-gray-900">
      {err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="rounded-xl border bg-white p-4 flex items-start justify-between">
        <div>
          <div className="text-xl font-semibold">{title}</div>

          {automjet ? (
            <div className="text-sm text-gray-700">
              Klienti:{" "}
              <b>
                {automjet.klient?.emri ?? ""} {automjet.klient?.mbiemri ?? ""}
              </b>{" "}
              • Tel: {automjet.klient?.telefoni || "-"} • VIN: {automjet.vin || "-"}
            </div>
          ) : (
            <div className="text-sm text-gray-700">Automjeti nuk u gjet.</div>
          )}
        </div>

        <button
          className={`rounded-lg px-3 py-2 text-white ${
            automjet ? "bg-black" : "bg-gray-400"
          }`}
          onClick={createDraft}
          disabled={!automjet}
        >
          Krijo inspekt
        </button>
      </div>

      <div className="rounded-xl border bg-white p-4 text-sm text-gray-700">
        Këtu krijohet një inspekt “Draft”, pastaj hapet faqja e editimit ku vendos tick-at dhe ruan.
      </div>
    </div>
  );
}
