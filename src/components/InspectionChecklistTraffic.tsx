"use client";

import { useMemo } from "react";

export type TrafficState = Record<string, TrafficStatus | undefined>;

type Props = {
  value: TrafficState;
  onChange: (next: TrafficState) => void;
  readonly?: boolean;
};

function Box({ active }: { active: boolean }) {
  return (
    <div className="w-6 h-6 rounded border-2 border-black flex items-center justify-center bg-white">
      {active ? <div className="w-3 h-3 rounded-sm bg-black" /> : null}
    </div>
  );
}

export default function InspectionChecklistTraffic({ value, onChange, readonly }: Props) {
  const rows = useMemo(() => {
    const out: { group: string; key: string; label: string }[] = [];
    for (const g of INSPECTION_TEMPLATE) for (const it of g.items) out.push({ group: g.title, key: it.key, label: it.label });
    return out;
  }, []);

  function setStatus(k: string, s: TrafficStatus) {
    if (readonly) return;
    onChange({ ...value, [k]: value[k] === s ? undefined : s });
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="grid grid-cols-[72px_72px_72px_1fr]">
        <div className="col-span-3 bg-green-600 text-white text-xs font-bold px-3 py-2">CHECKED AND OK</div>
        <div className="bg-green-600" />
      </div>
      <div className="grid grid-cols-[72px_72px_72px_1fr]">
        <div className="col-span-3 bg-yellow-300 text-black text-xs font-bold px-3 py-2">MAY NEED FUTURE ATTENTION</div>
        <div className="bg-yellow-300" />
      </div>
      <div className="grid grid-cols-[72px_72px_72px_1fr]">
        <div className="col-span-3 bg-red-600 text-white text-xs font-bold px-3 py-2">REQUIRES IMMEDIATE ATTENTION</div>
        <div className="bg-red-600" />
      </div>

      <div className="grid grid-cols-[72px_72px_72px_1fr]">
        <div className="bg-green-600 h-3" />
        <div className="bg-yellow-300 h-3" />
        <div className="bg-red-600 h-3" />
        <div className="bg-black h-3" />
      </div>

      <div className="max-h-[70vh] overflow-auto">
        {(() => {
          let lastGroup = "";
          return rows.map((r) => {
            const isNewGroup = r.group !== lastGroup;
            lastGroup = r.group;

            return (
              <div key={r.key}>
                {isNewGroup ? (
                  <div className="grid grid-cols-[72px_72px_72px_1fr]">
                    <div className="bg-black h-7" />
                    <div className="bg-black h-7" />
                    <div className="bg-black h-7" />
                    <div className="bg-black text-white text-xs font-bold px-3 py-2">{r.group}</div>
                  </div>
                ) : null}

                <div className="grid grid-cols-[72px_72px_72px_1fr] items-center">
                  <button type="button" className="bg-green-600 py-2 flex justify-center" onClick={() => setStatus(r.key, "OK")}>
                    <Box active={value[r.key] === "OK"} />
                  </button>
                  <button type="button" className="bg-yellow-300 py-2 flex justify-center" onClick={() => setStatus(r.key, "WARN")}>
                    <Box active={value[r.key] === "WARN"} />
                  </button>
                  <button type="button" className="bg-red-600 py-2 flex justify-center" onClick={() => setStatus(r.key, "FAIL")}>
                    <Box active={value[r.key] === "FAIL"} />
                  </button>

                  <div className="px-3 py-2 text-sm bg-white border-b border-gray-200">{r.label}</div>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
