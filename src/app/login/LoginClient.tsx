"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const next = useMemo(() => sp.get("next") || "/", [sp]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});


    const d = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setErr(d?.error ?? "Gabim gjatë login.");
      return;
    }

    router.replace(next);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Sonic" className="h-12 w-24 object-contain" />
          <div>
            <div className="text-xl font-semibold">sonic-app</div>
            <div className="text-sm text-gray-600">Hyrje në sistem</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Fjalëkalimi"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {err ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-black px-3 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Duke hyrë..." : "Hyr"}
          </button>
        </form>
      </div>
    </div>
  );
}
