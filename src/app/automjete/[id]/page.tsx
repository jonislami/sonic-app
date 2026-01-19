"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Klient = {
  klientId: string;
  emri: string;
  mbiemri: string | null;
  telefoni: string | null;
};

type Automjet = {
  automjetId: string;
  klientId: string;
  marka: string | null;
  modeli: string | null;
  viti: number | null;
  targa: string | null;
  vin: string | null;
  motori: string | null;
  kmAktuale: string | null;
  klient: Klient;
};

type ServisRow = {
  servisId: string;
  automjetId: string;
  dataServisit: string;
  kmNeServis: string | null;
  pershkrimi: string | null;
  statusi: string;
};

export default function AutomjetDetailPage() {
  const params = useParams<{ id: string }>();
  const automjetId = params.id;

  const router = useRouter(); // ✅ SHTUAR

  const [a, setA] = useState<Automjet | null>(null);
  const [servise, setServise] = useState<ServisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // ====== EDIT AUTOMJET ======
  const [editMarka, setEditMarka] = useState("");
  const [editModeli, setEditModeli] = useState("");
  const [editViti, setEditViti] = useState("");
  const [editTarga, setEditTarga] = useState("");
  const [editVin, setEditVin] = useState("");
  const [editMotori, setEditMotori] = useState("");
  const [editKm, setEditKm] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ DELETE AUTOMJET
  const [deleting, setDeleting] = useState(false);

  // ====== FORM SERVIS I RI ======
  const [dataServisit, setDataServisit] = useState("");
  const [kmNeServis, setKmNeServis] = useState("");
  const [statusi, setStatusi] = useState("Hap");
  const [pershkrimi, setPershkrimi] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);

    // Marrim automjetet dhe e gjejmë këtë automjet (simple approach)
    const aRes = await fetch("/api/automjete");
    const all = (await aRes.json()) as Automjet[];
    setA(all.find((x) => x.automjetId === automjetId) ?? null);

    // Serviset për këtë automjet
    const sRes = await fetch(`/api/automjete/${automjetId}/servise`);
    setServise(await sRes.json());

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [automjetId]);

  // Mbush fushat e editimit kur ngarkohet automjeti
  useEffect(() => {
    if (!a) return;
    setEditMarka(a.marka ?? "");
    setEditModeli(a.modeli ?? "");
    setEditViti(a.viti ? String(a.viti) : "");
    setEditTarga(a.targa ?? "");
    setEditVin(a.vin ?? "");
    setEditMotori(a.motori ?? "");
    setEditKm(a.kmAktuale ?? "");
  }, [a]);

  const title = useMemo(() => {
    if (!a) return "";
    return [a.marka, a.modeli, a.viti].filter(Boolean).join(" ");
  }, [a]);

  // ====== SAVE AUTOMJET ======
  async function saveAutomjet(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);

    const res = await fetch(`/api/automjete/${automjetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marka: editMarka,
        modeli: editModeli,
        viti: editViti,
        targa: editTarga,
        vin: editVin,
        motori: editMotori,
        kmAktuale: editKm,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d?.error ?? "Gabim duke ruajtur automjetin.");
      return;
    }

    await load();
  }

  // ✅ DELETE AUTOMJET
  async function delAutomjet() {
    if (!confirm("A je i sigurt që do ta fshish këtë automjet?")) return;

    setDeleting(true);
    setErr(null);

    const res = await fetch(`/api/automjete/${automjetId}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));

    setDeleting(false);

    if (!res.ok) {
      setErr(d?.error ?? "Gabim gjatë fshirjes së automjetit.");
      return;
    }

    // kthehu te lista e automjeteve
    router.push("/automjete");
    router.refresh();
  }

  // ====== ADD SERVIS ======
  async function addServis(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch(`/api/automjete/${automjetId}/servise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataServisit,
        kmNeServis,
        statusi,
        pershkrimi,
      }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d?.error ?? "Gabim duke shtuar servis.");
      return;
    }

    setDataServisit("");
    setKmNeServis("");
    setStatusi("Hap");
    setPershkrimi("");
    await load();
  }

  // ====== DELETE SERVIS ======
  async function delServis(id: string) {
    if (!confirm("Me fshi servis?")) return;
    const res = await fetch(`/api/servise/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d?.error ?? "S’u fshi");
      return;
    }
    await load();
  }

  if (loading) return <div className="text-sm text-gray-700">Duke ngarku…</div>;
  if (!a) return <div className="text-sm text-red-600">Automjeti nuk u gjet.</div>;

  return (
    <div className="space-y-6 text-gray-900">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title || "Automjet"}</h1>
          <p className="text-sm text-gray-700">
            Klienti: {a.klient.emri} {a.klient.mbiemri ?? ""}{" "}
            {a.klient.telefoni ? `- ${a.klient.telefoni}` : ""}
          </p>
          <p className="text-sm text-gray-700">
            Targa: {a.targa ?? "-"} • VIN: {a.vin ?? "-"} • KM: {a.kmAktuale ?? "-"}
          </p>
        </div>

        {/* ✅ BUTONAT DJATHTAS */}
        <div className="flex gap-2">
          <Link className="w-fit rounded-lg border px-3 py-2 hover:bg-gray-50" href="/automjete">
            Mbrapa
          </Link>

          <button
            className="w-fit rounded-lg border border-red-300 px-3 py-2 text-red-700 hover:bg-red-50 disabled:opacity-60"
            onClick={delAutomjet}
            disabled={deleting}
            type="button"
          >
            {deleting ? "Duke fshirë..." : "Fshi automjetin"}
          </button>
        </div>
      </header>

      {/* EDIT AUTOMJET */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Ndrysho të dhënat e automjetit</h2>

        <form className="mt-3 grid gap-2 md:grid-cols-2" onSubmit={saveAutomjet}>
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Marka"
            value={editMarka}
            onChange={(e) => setEditMarka(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Modeli"
            value={editModeli}
            onChange={(e) => setEditModeli(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Viti"
            value={editViti}
            onChange={(e) => setEditViti(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Targa"
            value={editTarga}
            onChange={(e) => setEditTarga(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2 md:col-span-2"
            placeholder="VIN"
            value={editVin}
            onChange={(e) => setEditVin(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Motori"
            value={editMotori}
            onChange={(e) => setEditMotori(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="KM aktuale"
            value={editKm}
            onChange={(e) => setEditKm(e.target.value)}
          />

          {err ? <div className="text-sm text-red-600 md:col-span-2">{err}</div> : null}

          <button
            className="rounded-lg bg-black px-3 py-2 text-white md:col-span-2 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
          </button>
        </form>
      </section>

      {/* SHTO SERVIS */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Shto servis</h2>

        <form className="mt-3 grid gap-2 md:grid-cols-2" onSubmit={addServis}>
          <input
            className="rounded-lg border px-3 py-2"
            type="date"
            value={dataServisit}
            onChange={(e) => setDataServisit(e.target.value)}
          />
          <select
            className="rounded-lg border px-3 py-2"
            value={statusi}
            onChange={(e) => setStatusi(e.target.value)}
          >
            <option value="Hap">Hap</option>
            <option value="Mbyllur">Mbyllur</option>
          </select>

          <input
            className="rounded-lg border px-3 py-2"
            placeholder="KM në servis"
            value={kmNeServis}
            onChange={(e) => setKmNeServis(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Përshkrim i shkurtër (ops.)"
            value={pershkrimi}
            onChange={(e) => setPershkrimi(e.target.value)}
          />

          {err ? <div className="text-sm text-red-600 md:col-span-2">{err}</div> : null}

          <button className="rounded-lg bg-black px-3 py-2 text-white md:col-span-2">
            Ruaj servis
          </button>
        </form>
      </section>

      {/* HISTORIKU I SERVISEVE */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Historiku i serviseve</h2>

        {servise.length === 0 ? (
          <div className="mt-2 text-sm text-gray-700">S’ka servise ende.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-800">
                <tr>
                  <th className="py-2">Data</th>
                  <th>KM</th>
                  <th>Status</th>
                  <th>Përshkrimi</th>
                  <th className="text-right">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {servise.map((s) => (
                  <tr key={s.servisId} className="border-b align-top">
                    <td className="py-2">{new Date(s.dataServisit).toLocaleDateString()}</td>
                    <td>{s.kmNeServis ?? ""}</td>
                    <td>{s.statusi}</td>
                    <td className="max-w-[520px] whitespace-pre-wrap">{s.pershkrimi ?? ""}</td>
                    <td className="text-right space-x-2">
                      <Link
                        className="rounded-lg border px-2 py-1 hover:bg-gray-50"
                        href={`/servise/${s.servisId}`}
                      >
                        Hape servisin
                      </Link>
                      <button
                        className="rounded-lg border px-2 py-1 hover:bg-gray-50"
                        onClick={() => delServis(s.servisId)}
                        type="button"
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
  );
}
