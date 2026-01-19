"use client";

import { useMemo } from "react";

export type DamageKey =
  | "front_bumper"
  | "rear_bumper"
  | "hood"
  | "roof"
  | "trunk"
  | "left_front_door"
  | "left_rear_door"
  | "right_front_door"
  | "right_rear_door"
  | "left_fender"
  | "right_fender"
  | "left_quarter"
  | "right_quarter";

type Props = {
  value: Record<DamageKey, boolean>;
  onChange: (next: Record<DamageKey, boolean>) => void;
  readonly?: boolean;
};

const LABELS: Record<DamageKey, string> = {
  front_bumper: "Bumper para",
  rear_bumper: "Bumper mbrapa",
  hood: "Kapaku (hood)",
  roof: "Tavani (roof)",
  trunk: "Bagazhi (trunk)",
  left_front_door: "Dera majtas para",
  left_rear_door: "Dera majtas mbrapa",
  right_front_door: "Dera djathtas para",
  right_rear_door: "Dera djathtas mbrapa",
  left_fender: "Parafango majtas",
  right_fender: "Parafango djathtas",
  left_quarter: "Anësor majtas mbrapa",
  right_quarter: "Anësor djathtas mbrapa",
};

export function emptyDamage(): Record<DamageKey, boolean> {
  return Object.fromEntries((Object.keys(LABELS) as DamageKey[]).map((k) => [k, false])) as Record<
    DamageKey,
    boolean
  >;
}

export default function BodyDamagePanel({ value, onChange, readonly }: Props) {
  function toggle(k: DamageKey) {
    if (readonly) return;
    onChange({ ...value, [k]: !value[k] });
  }

  const selected = useMemo(
    () => (Object.keys(value) as DamageKey[]).filter((k) => value[k]),
    [value]
  );

  return (
    <div className="space-y-3">
      <div className="border-b pb-2">
        <div className="text-xs font-semibold tracking-wide text-gray-700">BODY DAMAGE</div>
        <div className="text-xs text-gray-600 mt-1">
          Click te pjesa ku ka dëmtim. (Ruhet kur klikon “Ruaj”.)
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-lg bg-lime-500 text-white px-3 py-2 text-sm disabled:opacity-60"
          onClick={() => !readonly && alert("Template: Sedan (default).")}
          disabled={!!readonly}
        >
          Choose Template
        </button>

        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          onClick={() => !readonly && onChange(emptyDamage())}
          disabled={!!readonly}
        >
          Reset ↻
        </button>
      </div>

      <div className="rounded-xl border bg-white p-2">
        {/* Diagram i thjeshtë, klikues (si në foto) */}
        <svg viewBox="0 0 420 280" className="w-full h-auto select-none">
          <rect x="0" y="0" width="420" height="280" fill="#fff" />

          <rect x="70" y="60" width="280" height="160" rx="40" fill="#f8fafc" stroke="#111" strokeWidth="2" />
          <rect x="140" y="85" width="140" height="110" rx="25" fill="#ffffff" stroke="#111" strokeWidth="2" />

          <rect
            x="70"
            y="90"
            width="35"
            height="100"
            rx="18"
            fill={value.front_bumper ? "rgba(239,68,68,0.35)" : "rgba(0,0,0,0.05)"}
            stroke="#111"
            onClick={() => toggle("front_bumper")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />
          <rect
            x="315"
            y="90"
            width="35"
            height="100"
            rx="18"
            fill={value.rear_bumper ? "rgba(239,68,68,0.35)" : "rgba(0,0,0,0.05)"}
            stroke="#111"
            onClick={() => toggle("rear_bumper")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />

          <rect
            x="105"
            y="85"
            width="60"
            height="110"
            rx="18"
            fill={value.hood ? "rgba(234,179,8,0.35)" : "rgba(0,0,0,0.03)"}
            stroke="#111"
            onClick={() => toggle("hood")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />
          <rect
            x="255"
            y="85"
            width="60"
            height="110"
            rx="18"
            fill={value.trunk ? "rgba(234,179,8,0.35)" : "rgba(0,0,0,0.03)"}
            stroke="#111"
            onClick={() => toggle("trunk")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />
          <rect
            x="170"
            y="90"
            width="80"
            height="100"
            rx="18"
            fill={value.roof ? "rgba(34,197,94,0.35)" : "rgba(0,0,0,0.02)"}
            stroke="#111"
            onClick={() => toggle("roof")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />

          <rect
            x="140"
            y="60"
            width="70"
            height="25"
            rx="10"
            fill={value.left_front_door ? "rgba(239,68,68,0.35)" : "rgba(0,0,0,0.05)"}
            stroke="#111"
            onClick={() => toggle("left_front_door")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />
          <rect
            x="210"
            y="60"
            width="70"
            height="25"
            rx="10"
            fill={value.left_rear_door ? "rgba(239,68,68,0.35)" : "rgba(0,0,0,0.05)"}
            stroke="#111"
            onClick={() => toggle("left_rear_door")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />

          <rect
            x="140"
            y="195"
            width="70"
            height="25"
            rx="10"
            fill={value.right_front_door ? "rgba(239,68,68,0.35)" : "rgba(0,0,0,0.05)"}
            stroke="#111"
            onClick={() => toggle("right_front_door")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />
          <rect
            x="210"
            y="195"
            width="70"
            height="25"
            rx="10"
            fill={value.right_rear_door ? "rgba(239,68,68,0.35)" : "rgba(0,0,0,0.05)"}
            stroke="#111"
            onClick={() => toggle("right_rear_door")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />

          <circle
            cx="115"
            cy="70"
            r="18"
            fill={value.left_fender ? "rgba(234,179,8,0.35)" : "rgba(0,0,0,0.05)"}
            stroke="#111"
            onClick={() => toggle("left_fender")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />
          <circle
            cx="115"
            cy="210"
            r="18"
            fill={value.right_fender ? "rgba(234,179,8,0.35)" : "rgba(0,0,0,0.05)"}
            stroke="#111"
            onClick={() => toggle("right_fender")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />

          <circle
            cx="305"
            cy="70"
            r="18"
            fill={value.left_quarter ? "rgba(234,179,8,0.35)" : "rgba(0,0,0,0.05)"}
            stroke="#111"
            onClick={() => toggle("left_quarter")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />
          <circle
            cx="305"
            cy="210"
            r="18"
            fill={value.right_quarter ? "rgba(234,179,8,0.35)" : "rgba(0,0,0,0.05)"}
            stroke="#111"
            onClick={() => toggle("right_quarter")}
            style={{ cursor: readonly ? "default" : "pointer" }}
          />
        </svg>
      </div>

      <div className="rounded-lg border bg-gray-50 p-3 text-sm">
        <div className="font-semibold mb-1">Dëmet e zgjedhura</div>
        {selected.length === 0 ? (
          <div className="text-gray-700">—</div>
        ) : (
          <ul className="list-disc pl-5">
            {selected.map((k) => (
              <li key={k}>{LABELS[k]}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
