# UI-REC-01 — BACKEND ↔ META TRUTH

Branch: `agent/ui-rec-01-backend-meta-20260811`
Fork point: `program/backend-ui-reconciliation-20260811@c4209b8318ac36110ca84094d905ce724ffae3d5`
Status: BOOTSTRAPPED
Risk: STANDARD audit/tooling; escalate if a real schema/migration defect is found.

## Mission

Materialize the exact current mapping from backend capability/schema/controller contracts to metadata declarations and build permanent validators for drift classes that can be proven statically.

## Read first

1. exact branch/main state;
2. `skills/forge-enterprise-completion/SKILL.md`;
3. `CURRENT_STATUS.md`, `NEXT_TASKS.md`, `PROJECT_CONTEXT.md`;
4. `docs/agents/backend-ui-reconciliation/PROGRAM.md`;
5. `docs/agents/backend-ui-reconciliation/BACKEND_UI_SURFACE_MATRIX_CONTRACT.md`;
6. current migrations, app source, frappe-model/frappe-api meta transport, AlumDoor brief generators;
7. current Grid program only to understand the boundary — do not edit Grid runtime.

## Owned outcomes

1. `BACKEND_UI_SURFACE_MATRIX.json` with evidence-backed rows.
2. `BACKEND_UI_SURFACE_MATRIX_SUMMARY.md` with P0/P1 findings.
3. Generic validators/tests for:
   - field/type/link/child target drift;
   - dead metadata references;
   - preview output fields missing from metadata;
   - required-but-unreachable fields where statically provable;
   - broken manifest/nav/action targets where statically provable;
   - internal/server field leakage candidates.
4. Dependency Requests to NAV/FORMS/GRID/domain owners rather than cross-editing their hotspots.

## Audit order

P0 first:

```text
Sales commercial
Procurement
Inventory/ATP
Attendance/Payroll
permissions/actions
```

Then Manufacturing, Finance, Service and remaining first-party apps.

## Allowed zones

- audit/validator tooling under server scripts/tests;
- metadata parser/transport tests when needed;
- program docs/matrix artifacts.

Do not redesign sidebar, forms or grid interactions.

## Acceptance

- matrix is reproducible from exact current source;
- every P0 finding has concrete source evidence and an owner;
- no maturity promotion from source presence alone;
- validators fail closed without assuming every backend field should be visible;
- no business formula/runtime duplication;
- branch stays unmerged/un-deployed pending convergence.

## Startup prompt

`Đọc docs/agents/backend-ui-reconciliation/UI-REC-01-TRUTH.md, PROGRAM.md, BACKEND_UI_SURFACE_MATRIX_CONTRACT.md và Forge Enterprise Completion Skill. Audit exact current branch/main. Materialize backend↔metadata surface truth, prioritize Sales/Procurement/Inventory/Attendance-Payroll, add generic static drift validators, record evidence and Dependency Requests. Không sửa sidebar/form/grid để lách ownership. Không merge/deploy.`
