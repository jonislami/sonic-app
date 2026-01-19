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
"[project]/OneDrive/Desktop/sonic-garage/src/app/api/inventar/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/sonic-garage/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/sonic-garage/node_modules/next/server.js [app-route] (ecmascript)");
;
;
async function GET(req) {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].inventarPjese.findMany({
        where: q ? {
            OR: [
                {
                    emri: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                {
                    kodi: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                {
                    marka: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                {
                    modeli: {
                        contains: q,
                        mode: "insensitive"
                    }
                }
            ]
        } : {},
        orderBy: {
            inventarId: "desc"
        },
        include: {
            furnizues: true
        }
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(rows.map((p)=>({
            inventarId: p.inventarId.toString(),
            kodi: p.kodi ?? "",
            emri: p.emri,
            marka: p.marka ?? "",
            modeli: p.modeli ?? "",
            sasiaStok: p.sasiaStok,
            cmimiBlerje: p.cmimiBlerje.toString(),
            cmimiShitje: p.cmimiShitje.toString(),
            furnizuesId: p.furnizuesId?.toString() ?? "",
            furnizuesEmri: p.furnizues?.emri ?? ""
        })));
}
async function POST(req) {
    const body = await req.json().catch(()=>({}));
    const emri = String(body?.emri ?? "").trim();
    if (!emri) return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Emri është i detyrueshëm"
    }, {
        status: 400
    });
    const row = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].inventarPjese.create({
        data: {
            kodi: body?.kodi ? String(body.kodi).trim() : null,
            emri,
            marka: body?.marka ? String(body.marka).trim() : null,
            modeli: body?.modeli ? String(body.modeli).trim() : null,
            sasiaStok: body?.sasiaStok ? Number(body.sasiaStok) : 0,
            cmimiBlerje: body?.cmimiBlerje !== "" && body?.cmimiBlerje != null ? Number(body.cmimiBlerje) : 0,
            cmimiShitje: body?.cmimiShitje !== "" && body?.cmimiShitje != null ? Number(body.cmimiShitje) : 0,
            furnizuesId: body?.furnizuesId ? BigInt(String(body.furnizuesId)) : null
        }
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$sonic$2d$garage$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        inventarId: row.inventarId.toString()
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b22b684c._.js.map