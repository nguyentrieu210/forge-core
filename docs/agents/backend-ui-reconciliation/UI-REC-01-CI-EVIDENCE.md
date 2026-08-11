# UI-REC-01 — EXACT-HEAD CI EVIDENCE

Validated head: `ea95a6f50375a1d73ef345a64c63f4ef137ea846`
Runner: `Linux` / Node 24
Result: **PASS**

```text
$ node --check server/scripts/audit-backend-ui-surfaces.mjs

$ node --test server/tests/backend-ui-reconciliation.test.mjs
✔ UI-REC-01 detects current Sales backend-to-metadata drift without duplicating domain authority (28.378002ms)
✔ UI-REC-01 keeps the repaired Sales Order server-preview summary projected (6.262964ms)
✔ UI-REC-01 P0 breadth includes procurement, inventory and Attendance/Payroll metadata (4.727045ms)
✔ UI-REC-01 matrix and summary serialization are deterministic (10.089754ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 123.527062

$ validate committed matrix JSON
BACKEND_UI_SURFACE_MATRIX_JSON_PASS

$ git diff --check
```
