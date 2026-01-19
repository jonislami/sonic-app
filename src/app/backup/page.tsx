"use client";

const items = [
  { key: "kliente", label: "Klientë" },
  { key: "automjete", label: "Automjete" },
  { key: "servise", label: "Servise" },
  { key: "faktura", label: "Fatura" },
  { key: "shpenzime", label: "Shpenzime" },
  { key: "inventar", label: "Inventar" },
];

function dl(table: string, format: "csv" | "xlsx") {
  window.location.href = `/api/export?table=${encodeURIComponent(table)}&format=${format}`;
}

export default function BackupPage() {
  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h1 className="text-2xl font-semibold">Backup / Export</h1>
        <p className="text-sm text-gray-700">
          Shkarko të dhënat në CSV (Excel e hap direkt) ose në Excel (.xlsx).
        </p>
      </div>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Export</h2>

        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {items.map((it) => (
            <div key={it.key} className="rounded-lg border p-3">
              <div className="font-semibold">{it.label}</div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => dl(it.key, "csv")}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Shkarko CSV
                </button>
                <button
                  onClick={() => dl(it.key, "xlsx")}
                  className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                >
                  Shkarko Excel
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-gray-600">
          * CSV është i thjeshtë dhe shumë i shpejtë. Excel (.xlsx) është më profesional për dërgim/arkiv.
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Backup i plotë i databazës (rekomandim)</h2>
        <p className="mt-2 text-sm text-gray-700">
          Për backup 100% të sigurt të Postgres, përdor <b>pg_dump</b>. Në hapin tjetër ta jap komandën e saktë sipas
          DATABASE_URL.
        </p>
      </section>
    </div>
  );
}
