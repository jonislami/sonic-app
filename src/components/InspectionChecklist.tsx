"use client";

import { INSPECTION_TEMPLATE, InspectionStatus } from "@/lib/inspection-template";

export type ChecklistState = Record<string, InspectionStatus>;

export default function InspectionChecklist({
  value,
  onChange,
}: {
  value: ChecklistState;
  onChange: (next: ChecklistState) => void;
}) {
  function setStatus(key: string, status: InspectionStatus) {
    onChange({ ...value, [key]: status });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-3 bg-gray-50 text-sm">
        <div className="font-semibold">Legjenda</div>
        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-2"><span className="h-4 w-4 bg-green-500 inline-block rounded" /> OK</div>
          <div className="flex items-center gap-2"><span className="h-4 w-4 bg-yellow-400 inline-block rounded" /> Vëmendje</div>
          <div className="flex items-center gap-2"><span className="h-4 w-4 bg-red-500 inline-block rounded" /> Urgjente</div>
        </div>
      </div>

      {INSPECTION_TEMPLATE.map((group) => (
        <div key={group.title}>
          <div className="mb-2 font-semibold">{group.title}</div>
          {group.items.map((item) => {
            const v = value[item.key];
            return (
              <div key={item.key} className="grid grid-cols-[1fr_34px_34px_34px] items-center gap-2 py-1">
                <div className="text-sm">{item.label}</div>

                <button
                  onClick={() => setStatus(item.key, "OK")}
                  className={`h-6 w-6 rounded border ${v === "OK" ? "bg-green-500" : "bg-white"}`}
                  title="OK"
                />
                <button
                  onClick={() => setStatus(item.key, "WARN")}
                  className={`h-6 w-6 rounded border ${v === "WARN" ? "bg-yellow-400" : "bg-white"}`}
                  title="Vëmendje"
                />
                <button
                  onClick={() => setStatus(item.key, "FAIL")}
                  className={`h-6 w-6 rounded border ${v === "FAIL" ? "bg-red-500" : "bg-white"}`}
                  title="Urgjente"
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
