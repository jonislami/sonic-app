"use client";

import { INSPECTION_TEMPLATE, type InspectionStatus } from "@/lib/inspection-template";

export type ChecklistState = Record<string, InspectionStatus>;

type Props = {
  value: ChecklistState;
  onChange: (next: ChecklistState) => void;
};

const OPTIONS: Array<{ label: string; value: InspectionStatus }> = [
  { label: "OK", value: "OK" },
  { label: "Vëmendje", value: "WARN" },
  { label: "Urgjente", value: "FAIL" },
];

export default function InspectionChecklist({ value, onChange }: Props) {
  function setStatus(key: string, status: InspectionStatus) {
    onChange({ ...value, [key]: status });
  }

  return (
    <div className="space-y-6">
      {/* Legjenda */}
      <div className="rounded-xl border p-4">
        <div className="font-semibold mb-2">Legjenda</div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded bg-green-600" /> OK
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded bg-yellow-400" /> Vëmendje
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded bg-red-600" /> Urgjente
          </span>
        </div>
      </div>

      {INSPECTION_TEMPLATE.map((g) => (
        <div key={g.title} className="space-y-3">
          <div className="text-lg font-semibold">{g.title}</div>

          <div className="space-y-2">
            {g.items.map((it) => {
              const st = value[it.key];

              return (
                <div
                  key={it.key}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="text-sm">{it.label}</div>

                  <div className="flex items-center gap-2">
                    {OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setStatus(it.key, o.value)}
                        className={`h-8 w-10 rounded border text-sm font-semibold ${
                          st === o.value ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"
                        }`}
                        title={o.label}
                      >
                        {o.value === "OK" ? "OK" : o.value === "WARN" ? "!" : "X"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
