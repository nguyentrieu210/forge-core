# UI-REC-01 — BROAD META CI EVIDENCE

Validated head: `a6e2775c7a6df86aeba5a2cb15c6010f60aced43`
Runner: `Linux` / Node 24 / pnpm 9.15.0
Result: **PASS**

```text
$ cd server && pnpm run build

> cloudforge@1.0.0 build /home/runner/work/forge/forge/server
> tsc -p tsconfig.json && node scripts/ensure-tenant-worker-core.mjs

Tenant Worker core emit: dist/apps/tenant-worker/src/index-core.js.map, dist/apps/tenant-worker/src/index-core.js, dist/apps/tenant-worker/src/index-core.d.ts

$ pnpm run verify:first-party-meta

> cloudforge@1.0.0 verify:first-party-meta /home/runner/work/forge/forge/server
> node scripts/verify-first-party-meta.mjs

FIRST_PARTY_META_PASS app=maintenance@1.5.1 doctypes=8 fields=114 external=11
FIRST_PARTY_META_PASS app=projects@1.3.1 doctypes=14 fields=122 external=5
FIRST_PARTY_META_PASS app=support@1.2.1 doctypes=9 fields=63 external=2
FIRST_PARTY_META_PASS app=visits@1.0.0 doctypes=1 fields=5 external=1
FIRST_PARTY_META_PASS app=hrm@1.8.0 doctypes=70 fields=669 external=12
FIRST_PARTY_META_PASS app=vn-accounting@1.6.1 doctypes=13 fields=193 external=17
FIRST_PARTY_META_PASS app=erp-organization-security@1.0.0 doctypes=5 fields=38 external=6
FIRST_PARTY_META_PASS app=manufacturing-qms@1.1.0 doctypes=11 fields=91 external=9

$ pnpm run brief:check

> cloudforge@1.0.0 brief:check /home/runner/work/forge/forge/server
> node scripts/forge-app.mjs briefs/assets.json --dry-run && node scripts/forge-app.mjs briefs/center.json --dry-run && node scripts/forge-app.mjs briefs/alumdoor.json --dry-run && node scripts/forge-app.mjs briefs/alumdoor-v2.json --dry-run && node scripts/verify-alumdoor-meta-completeness.mjs && node scripts/forge-app.mjs briefs/phanbon.json --dry-run

1 compiled   app=assets@1.1.0 doctypes=2 workflows=1 roles=2 fixtures=1 nav=3
2 validated  through the server's own parser

DRY_RUN_PASS assets would install cleanly. Re-run without --dry-run to ship it.
1 compiled   app=center@1.13.0 doctypes=12 workflows=3 roles=7 fixtures=1 nav=20
2 validated  through the server's own parser

DRY_RUN_PASS center would install cleanly. Re-run without --dry-run to ship it.
1 compiled   app=alumdoor@1.27.4 doctypes=65 workflows=1 roles=5 fixtures=54 nav=54
2 validated  through the server's own parser

DRY_RUN_PASS alumdoor would install cleanly. Re-run without --dry-run to ship it.
1 compiled   app=alumdoor@2.2.3 doctypes=74 workflows=1 roles=11 fixtures=57 nav=79
2 validated  through the server's own parser

DRY_RUN_PASS alumdoor would install cleanly. Re-run without --dry-run to ship it.
ALUMDOOR_META_COMPLETENESS_PASS
{
  "doctypes": 74,
  "kinds": {
    "master": 26,
    "tree": 2,
    "child_table": 28,
    "transaction": 18
  },
  "fields": 984,
  "links": 255,
  "childTables": 27,
  "externalDocTypes": 11,
  "reports": 12,
  "charts": 0,
  "surfaces": {
    "quick": 308,
    "expanded": 520,
    "internal": 156
  },
  "nav": 79
}
1 compiled   app=phanbon@1.0.1 doctypes=18 workflows=2 roles=5 fixtures=9 nav=19
2 validated  through the server's own parser

DRY_RUN_PASS phanbon would install cleanly. Re-run without --dry-run to ship it.

$ node --test tests/backend-ui-reconciliation.test.mjs
✔ UI-REC-01 detects current Sales backend-to-metadata drift without duplicating domain authority (16.337188ms)
✔ UI-REC-01 keeps the repaired Sales Order server-preview summary projected (5.00952ms)
✔ UI-REC-01 P0 breadth includes procurement, inventory and Attendance/Payroll metadata (4.399599ms)
✔ UI-REC-01 matrix and summary serialization are deterministic (8.992439ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 96.630625

$ git diff --check
```
