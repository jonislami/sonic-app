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
"[project]/OneDrive/Desktop/sonic-garage/src/app/api/dashboard/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/sonic-garage/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/sonic-garage/node_modules/next/server.js [app-route] (ecmascript)");
;
;
function ymRange(ym) {
    if (!/^\d{4}-\d{2}$/.test(ym)) return null;
    const [Y, M] = ym.split("-").map(Number);
    const start = new Date(Y, M - 1, 1);
    const end = new Date(Y, M, 1);
    return {
        start,
        end
    };
}
async function GET(req) {
    const url = new URL(req.url);
    const ym = (url.searchParams.get("ym") ?? "").trim();
    const range = ymRange(ym);
    if (!range) return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "ym duhet p.sh. 2026-01"
    }, {
        status: 400
    });
    const { start, end } = range;
    // ============ Të hyra nga faturat (total rreshta)
    const teHyraAgg = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].faktureRresht.aggregate({
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
    const teHyra = Number(teHyraAgg._sum.totali?.toString() ?? 0);
    // ============ Kosto pjesësh (DALJE)
    const dalje = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].inventarLevizje.findMany({
        where: {
            data: {
                gte: start,
                lt: end
            },
            tipi: "DALJE"
        },
        select: {
            sasia: true,
            cmimi: true
        }
    });
    const kostoPjesesh = dalje.reduce((s, x)=>s + Number(x.cmimi.toString()) * Number(x.sasia), 0);
    const fitimBruto = teHyra - kostoPjesesh;
    // ============ Shpenzime tjera
    const shpenzimeAgg = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].shpenzim.aggregate({
        _sum: {
            shuma: true
        },
        where: {
            data: {
                gte: start,
                lt: end
            }
        }
    });
    const shpenzimeTjera = Number(shpenzimeAgg._sum.shuma?.toString() ?? 0);
    const fitimNeto = fitimBruto - shpenzimeTjera;
    // ============ Borxhet (fatura me pagesa)
    const faturat = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].fakture.findMany({
        where: {
            statusi: {
                not: "Anuluar"
            }
        },
        include: {
            rreshta: true,
            pagesa: true,
            klient: true
        },
        orderBy: {
            data: "desc"
        },
        take: 200
    });
    let borxhiTotal = 0;
    const borxheTop = faturat.map((f)=>{
        const total = f.rreshta.reduce((s, r)=>s + Number(r.totali.toString()), 0);
        const paguar = f.pagesa.reduce((s, p)=>s + Number(p.shuma.toString()), 0);
        const borxh = total - paguar;
        return {
            faktureId: f.faktureId.toString(),
            nrFakture: f.nrFakture,
            klient: `${f.klient.emri} ${f.klient.mbiemri ?? ""}`.trim(),
            borxh
        };
    }).filter((x)=>x.borxh > 0.001).sort((a, b)=>b.borxh - a.borxh).slice(0, 6);
    borxhiTotal = borxheTop.reduce((s, x)=>s + x.borxh, 0);
    // ============ Servise Hap (quick list)
    const serviseHap = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].servis.findMany({
        where: {
            statusi: "Hap"
        },
        orderBy: {
            dataServisit: "desc"
        },
        take: 8,
        include: {
            automjet: {
                include: {
                    klient: true
                }
            }
        }
    });
    const servise = serviseHap.map((s)=>({
            servisId: s.servisId.toString(),
            dataServisit: s.dataServisit.toISOString(),
            pershkrimi: s.pershkrimi ?? "",
            automjet: `${s.automjet.marka ?? ""} ${s.automjet.modeli ?? ""} ${s.automjet.viti ?? ""}`.trim(),
            targa: s.automjet.targa ?? "",
            klient: `${s.automjet.klient.emri} ${s.automjet.klient.mbiemri ?? ""}`.trim()
        }));
    // ============ Low-stock (top 10)
    const inv = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].inventarPjese.findMany({
        orderBy: {
            sasiaStok: "asc"
        },
        take: 10,
        select: {
            inventarId: true,
            emri: true,
            sasiaStok: true
        }
    });
    const lowStock = inv.filter((x)=>x.sasiaStok <= 2).map((x)=>({
            inventarId: x.inventarId.toString(),
            emri: x.emri,
            sasiaStok: x.sasiaStok
        }));
    return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ym,
        cards: {
            teHyra: teHyra.toFixed(2),
            kostoPjesesh: kostoPjesesh.toFixed(2),
            shpenzimeTjera: shpenzimeTjera.toFixed(2),
            fitimNeto: fitimNeto.toFixed(2),
            borxhiTopTotal: borxhiTotal.toFixed(2)
        },
        servise,
        lowStock,
        borxheTop: borxheTop.map((x)=>({
                ...x,
                borxh: x.borxh.toFixed(2)
            }))
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a83ce56a._.js.map