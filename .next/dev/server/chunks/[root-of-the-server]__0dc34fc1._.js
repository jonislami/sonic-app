module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/OneDrive/Desktop/sonic-garage/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/OneDrive/Desktop/sonic-garage/node_modules/@prisma/client)");
;
const prisma = globalThis.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        "error",
        "warn"
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalThis.prisma = prisma;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/OneDrive/Desktop/sonic-garage/src/app/api/raporte/ditore/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/sonic-garage/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/sonic-garage/node_modules/next/server.js [app-route] (ecmascript)");
;
;
function dayRange(d) {
    const now = new Date();
    const base = d ? new Date(`${d}T00:00:00`) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(base);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const iso = start.toISOString().slice(0, 10);
    return {
        start,
        end,
        iso
    };
}
// Pagesa të aplikuara + bakshish (overpay) brenda range
async function calcAppliedAndTip(start, end) {
    const pays = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].fakturePagesa.findMany({
        where: {
            dataPageses: {
                gte: start,
                lt: end
            },
            fakture: {
                statusi: {
                    not: "Anuluar"
                }
            }
        },
        select: {
            faktureId: true,
            shuma: true,
            dataPageses: true
        },
        orderBy: [
            {
                faktureId: "asc"
            },
            {
                dataPageses: "asc"
            }
        ]
    });
    if (pays.length === 0) return {
        pagesaAplikuar: 0,
        bakshishNgaPagesat: 0
    };
    const faktureIds = Array.from(new Set(pays.map((p)=>p.faktureId.toString()))).map((x)=>BigInt(x));
    const totals = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].faktureRresht.groupBy({
        by: [
            "faktureId"
        ],
        where: {
            faktureId: {
                in: faktureIds
            }
        },
        _sum: {
            totali: true
        }
    });
    const totalMap = new Map();
    for (const t of totals)totalMap.set(t.faktureId.toString(), Number(t._sum.totali?.toString() ?? 0));
    const paidBefore = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].fakturePagesa.groupBy({
        by: [
            "faktureId"
        ],
        where: {
            faktureId: {
                in: faktureIds
            },
            dataPageses: {
                lt: start
            }
        },
        _sum: {
            shuma: true
        }
    });
    const paidBeforeMap = new Map();
    for (const p of paidBefore)paidBeforeMap.set(p.faktureId.toString(), Number(p._sum.shuma?.toString() ?? 0));
    let pagesaAplikuar = 0;
    let bakshishNgaPagesat = 0;
    const runningPaid = new Map();
    for (const pid of faktureIds)runningPaid.set(pid.toString(), paidBeforeMap.get(pid.toString()) ?? 0);
    for (const pay of pays){
        const id = pay.faktureId.toString();
        const total = totalMap.get(id) ?? 0;
        const already = runningPaid.get(id) ?? 0;
        const remaining = Math.max(0, total - Math.min(total, already));
        const shumaPay = Number(pay.shuma.toString());
        const applied = Math.min(shumaPay, remaining);
        const tip = Math.max(0, shumaPay - applied);
        pagesaAplikuar += applied;
        bakshishNgaPagesat += tip;
        runningPaid.set(id, already + shumaPay);
    }
    return {
        pagesaAplikuar,
        bakshishNgaPagesat
    };
}
async function GET(req) {
    try {
        const url = new URL(req.url);
        const d = url.searchParams.get("d") ?? undefined;
        const { start, end, iso } = dayRange(d);
        // Të hyra (Fatura) = rreshta faturash të asaj dite (krijim fature)
        const faturatTotalAgg = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].faktureRresht.aggregate({
            _sum: {
                totali: true
            },
            where: {
                fakture: {
                    data: {
                        gte: start,
                        lt: end
                    },
                    statusi: {
                        not: "Anuluar"
                    }
                }
            }
        });
        const teHyraFatura = Number(faturatTotalAgg._sum.totali?.toString() ?? 0);
        // Pagesa aplikuar + bakshish (overpay)
        const { pagesaAplikuar, bakshishNgaPagesat } = await calcAppliedAndTip(start, end);
        // Shpenzime (listë + total)
        const shpenzimeRows = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].shpenzim.findMany({
            where: {
                data: {
                    gte: start,
                    lt: end
                }
            },
            orderBy: {
                data: "desc"
            }
        });
        const shpenzimeList = shpenzimeRows.map((x)=>({
                shpenzimId: String(x.shpenzimId ?? x.id ?? ""),
                data: x.data ? new Date(x.data).toISOString() : null,
                pershkrimi: String(x.pershkrimi ?? x.lloji ?? x.emri ?? "Shpenzim"),
                kategoria: x.kategoria ? String(x.kategoria) : null,
                shenim: x.shenim ? String(x.shenim) : null,
                shuma: Number(x.shuma?.toString?.() ?? x.shuma ?? 0)
            }));
        const shpenzimeTjera = shpenzimeList.reduce((s, r)=>s + (Number(r.shuma) || 0), 0);
        // ✅ DALJE inventari me cmimi blerje + cmimi shitje + fitim
        const daljeRows = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].inventarLevizje.findMany({
            where: {
                data: {
                    gte: start,
                    lt: end
                },
                tipi: "DALJE"
            },
            orderBy: {
                data: "desc"
            },
            select: {
                levizjeId: true,
                data: true,
                sasia: true,
                shenim: true,
                inventar: {
                    select: {
                        inventarId: true,
                        emri: true,
                        kodi: true,
                        marka: true,
                        modeli: true,
                        cmimiBlerje: true,
                        cmimiShitje: true
                    }
                }
            }
        });
        const daljeList = daljeRows.map((x)=>{
            const sasia = Number(x.sasia ?? 0);
            const cmimiBlerje = Number(x.inventar?.cmimiBlerje?.toString?.() ?? 0);
            const cmimiShitje = Number(x.inventar?.cmimiShitje?.toString?.() ?? 0);
            const kosto = Number((sasia * cmimiBlerje).toFixed(2));
            const shitje = Number((sasia * cmimiShitje).toFixed(2));
            const fitim = Number((shitje - kosto).toFixed(2));
            return {
                levizjeId: String(x.levizjeId),
                data: x.data ? new Date(x.data).toISOString() : null,
                sasia,
                cmimiBlerje,
                cmimiShitje,
                kosto,
                shitje,
                fitim,
                shenim: x.shenim ? String(x.shenim) : null,
                pjese: {
                    inventarId: String(x.inventar?.inventarId ?? ""),
                    emri: String(x.inventar?.emri ?? "Pjesë"),
                    kodi: x.inventar?.kodi ? String(x.inventar.kodi) : null,
                    marka: x.inventar?.marka ? String(x.inventar.marka) : null,
                    modeli: x.inventar?.modeli ? String(x.inventar.modeli) : null
                }
            };
        });
        const daljeKostoTotal = Number(daljeList.reduce((s, x)=>s + (Number(x.kosto) || 0), 0).toFixed(2));
        const daljeShitjeTotal = Number(daljeList.reduce((s, x)=>s + (Number(x.shitje) || 0), 0).toFixed(2));
        const daljeFitimTotal = Number(daljeList.reduce((s, x)=>s + (Number(x.fitim) || 0), 0).toFixed(2));
        // Borxh (info) – vetëm për faturat e asaj dite
        const borxhInfo = Math.max(0, teHyraFatura - pagesaAplikuar);
        // Cash i ditës (pagesa aplikuar + bakshish)
        const teHyraCash = pagesaAplikuar + bakshishNgaPagesat;
        // Fitim neto (cash - kosto - shpenzime)
        const fitimNeto = teHyraCash - daljeKostoTotal - shpenzimeTjera;
        return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            date: iso,
            teHyraFatura: Number(teHyraFatura.toFixed(2)),
            pagesaAplikuar: Number(pagesaAplikuar.toFixed(2)),
            bakshish: Number(bakshishNgaPagesat.toFixed(2)),
            teHyraCash: Number(teHyraCash.toFixed(2)),
            // kosto pjesësh = kosto blerje nga dalje
            kostoPjesesh: daljeKostoTotal,
            shpenzimeTjera: Number(shpenzimeTjera.toFixed(2)),
            fitimNeto: Number(fitimNeto.toFixed(2)),
            borxhInfo: Number(borxhInfo.toFixed(2)),
            shpenzimeList,
            // ✅ inventar dalje list + totale
            daljeList,
            daljeKostoTotal,
            daljeShitjeTotal,
            daljeFitimTotal
        });
    } catch (e) {
        console.error("GET /api/raporte/ditore error:", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Gabim te raporti ditor",
            detail: String(e?.message ?? e)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0dc34fc1._.js.map