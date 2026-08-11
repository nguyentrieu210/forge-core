# BACKEND ↔ METADATA ↔ UI RECONCILIATION PROGRAM — 2026-08-11

Status: PROGRAM BOOTSTRAP
Control branch: `program/backend-ui-reconciliation-20260811`
Exact source baseline: `main@cecb19c51855ab3e6a05ce84261d717c630c96b7`
Reference vertical: AlumDoor
Dependency: `program/grid-parity-20260811` for child-grid runtime parity. This program may audit and prepare contracts in parallel, but form/grid acceptance cannot be closed before the Grid candidate is reconciled.

## 1. Mission

Reconcile the newly converged backend with every user-facing declaration and surface so Forge no longer has capabilities that exist in schema/controller code but are missing, stale, misleading or unreachable in metadata-driven UI.

Target chain:

```text
backend capability
  -> authoritative schema / DocType
  -> metadata transport
  -> app brief / manifest
  -> sidebar / navigation
  -> list / form / child-grid / matrix / workspace
  -> action / preview / workflow
  -> permission-aware user flow
  -> automated coverage evidence
```

This is not a visual redesign program. It is an authority-projection reconciliation program.

## 2. Confirmed motivating gaps

### 2.1 Backend capability not exposed as operator master data

Sales convergence introduced or strengthened generic commercial authorities such as `Sales Option` and `Sales Package`, while current AlumDoor catalog/navigation does not expose all required masters for operator configuration.

### 2.2 Server output can exist without metadata projection

The Sales Order summary regression proved that a server preview may already return canonical values while the Form metadata omits those fields, causing the generic runtime to drop the output. PR #825 repaired one instance; this program must turn that class of drift into an automated failure.

### 2.3 Schema and presentation can drift independently

After convergence, Sales, Inventory and Attendance/Payroll gained newer authority contracts. Generated briefs, child presentation policies, sidebar declarations and forms must be checked against exact current backend fields rather than old UI snapshots.

### 2.4 Child-grid migration exposed a broader projection problem

Grid parity is handled by the dedicated Grid program. This program owns the surrounding projection truth: which fields belong to quick/full/internal surfaces, which DocTypes are reachable, and whether forms/lists/actions match backend contracts.

## 3. Non-negotiable architecture rules

1. **Backend authority wins.** Code + migration + controller + exact tests beat stale prose or generated UI snapshots.
2. **Metadata-first.** Do not add React DocType branching when metadata/manifest can express the behavior.
3. **No duplicate domain authority.** Sales pricing, Stock Ledger, GL/Payment Ledger, Payroll and manufacturing authorities remain canonical.
4. **Generated artifacts are not hand-edited** when a source generator exists.
5. **Permission is server authoritative.** UI visibility is UX only.
6. **Preview is projection, not authority.** UI may preview canonical server calculations; it must not recreate commercial/stock/payroll algorithms.
7. **Internal snapshots remain internal.** Version keys, source-line hashes, package snapshots, formula traces, ledger identifiers and server-only fields are not normal operator columns unless explicitly justified.
8. **No production mutation.** Branch/PR/source work only. No tenant metadata apply, migration, deploy, DNS/secret/provider or customer-data change under this bootstrap.

## 4. Target outputs

### 4.1 Machine-readable backend/UI surface inventory

Canonical planned artifact:

`docs/agents/backend-ui-reconciliation/BACKEND_UI_SURFACE_MATRIX.json`

Each row should record at least:

```text
capability / doctype
owner app/package
master | transaction | child | report | action
schema source
fields and link targets
state / submit / cancel semantics
controller / named actions / preview methods
permissions
migration provenance
manifest exposure
sidebar/catalog exposure
list surface
form surface
child-grid/matrix surface
action/workflow exposure
status classification
evidence
```

### 4.2 Drift classifications

Use this vocabulary:

- `OK`
- `ORPHAN_BACKEND` — backend capability has no usable UI/config surface where one is required;
- `ORPHAN_UI` — UI declaration points to absent/retired backend behavior;
- `SCHEMA_DRIFT` — field/type/required/read-only/link/options/state mismatch;
- `NAV_MISSING` — usable capability exists but intended navigation/catalog entry is absent;
- `FORM_INCOMPLETE` — operator-required field/action/summary is not reachable;
- `LIST_INCOMPLETE` — list cannot identify/filter/operate the records expected for that DocType;
- `GRID_INCOMPLETE` — child/matrix presentation misses current contract; Grid runtime parity itself belongs to the Grid program;
- `ACTION_UNWIRED` — named backend action exists but user flow cannot invoke it;
- `PERMISSION_MISMATCH` — UI and server role expectations diverge;
- `DEAD_METADATA` — declaration no longer maps to live schema/action;
- `INTERNAL_LEAK` — server/internal snapshot is shown as ordinary business UI;
- `LEGACY_SPECIAL_CASE` — shared runtime still branches on business identity without current architectural justification.

## 5. Workstreams

### UI-REC-01 — BACKEND ↔ META TRUTH

Owns the source-of-truth inventory and validators.

Responsibilities:

- enumerate current app/package DocTypes, fields, child targets, actions, previews and permissions;
- reconcile migrations/schema/controllers with metadata transport and briefs;
- build `BACKEND_UI_SURFACE_MATRIX.json` and human summary;
- detect missing fields, dead fields, wrong field types, broken Link targets, preview-output drops and required-but-unreachable inputs;
- create generic validation/tests where the contract can be proven statically.

Preferred zones:

```text
server/migrations/** (read/audit; change only if a real schema defect is found)
server/apps-src/**
server/packages/frappe-model/**
server/packages/frappe-api/**
server/scripts/lib/compile-*.mjs
server/tests/*meta* / focused reconciliation validators
docs/agents/backend-ui-reconciliation/**
```

Must not redesign sidebar or shared React forms.

### UI-REC-02 — ALUMDOOR SIDEBAR / MASTER DATA IA

Owns navigation and master-data discoverability for AlumDoor.

Responsibilities:

- derive sidebar/catalog from current capability truth;
- expose missing operator masters such as Sales Option / Sales Package when confirmed by UI-REC-01;
- remove or hide dead/superseded entries;
- organize navigation by operational domain without duplicating backend authority;
- preserve role-aware visibility;
- keep navigation declarative in app manifest/brief, not hard-coded React.

Target information architecture families:

```text
Điều hành
Bán hàng
Mua hàng
Kho
Sản xuất
Chấm công & ca
Lương
Công nợ / Kế toán
Bảo hành / Dịch vụ
Báo cáo
Danh mục
Hệ thống
```

Preferred zones:

```text
server/briefs/alumdoor*.json via generators
server/scripts/build-alumdoor-v2-brief.mjs
AlumDoor app manifests / nav declarations
focused navigation/catalog tests
```

Must not edit shared grid renderer or domain controllers.

### UI-REC-03 — FORM / LIST / WORKSPACE PROJECTION

Owns user-facing metadata projection outside Grid implementation.

Responsibilities:

- audit primary forms and lists for Sales, Procurement, Inventory, Manufacturing, Attendance/Payroll, Finance and service flows;
- classify fields as primary / secondary / internal;
- ensure section/tab/main/aside/summary composition reflects operator workflow;
- ensure quick-entry/full-page precedence is correct;
- ensure server preview fields are materialized and reactive dependencies are declared;
- ensure action buttons/workflow transitions are reachable;
- ensure list identity, useful filters, status and bulk behavior are sufficient;
- coordinate with Grid program for child tables rather than reimplementing grid interaction.

Preferred zones:

```text
server brief/profile generators and view-policy declarations
focused form/list/workspace metadata tests
client generic runtime only if a business-neutral projection primitive is genuinely missing
```

Forbidden:

- business formulas in React;
- shared grid implementation owned by GRID-02;
- sidebar ownership of UI-REC-02.

### UI-REC-04 — PROJECT-WIDE COVERAGE SWEEP

Owns cross-app breadth and consistency.

Scope includes first-party domains such as:

```text
CRM / Sales
Procurement
Inventory / WMS
Manufacturing / QMS
Finance / VN Accounting
HRM
Attendance / Payroll
Projects / Service
AlumDoor
other installed first-party app packages
```

Responsibilities:

- consume UI-REC-01 matrix and identify gaps outside AlumDoor;
- ensure common patterns are solved at platform/domain layer, not copied into verticals;
- identify duplicate/dead UI declarations and legacy special cases;
- produce a prioritized P0/P1/P2 remediation queue with owners;
- do not implement every missing capability merely to improve a count.

### UI-REC-05 — QA / COVERAGE GATES

Owns exact-candidate evidence and permanent drift prevention.

Required classes of gate:

```text
schema <-> metadata field parity
broken Link target detection
preview output <-> metadata projection parity
required field reachability
internal-field leakage
manifest/nav target existence
role/permission visibility contract
dead action/method references
form/list smoke
grid dependency handoff to Grid parity suite
browser E2E for representative actor flows
mobile/tablet/desktop evidence where relevant
```

Representative actor flows:

```text
Sales user
Purchasing user
Warehouse user
Production user
HR / Attendance manager
Payroll user / approver
Accountant
Owner / Director
System Manager
```

## 6. Dependency graph

```text
GRID PARITY PROGRAM --------------------------┐
                                             |
UI-REC-01 Backend/Meta Truth ----------------┼----> UI-REC-05 QA/Gates
        |                                    |
        +--> UI-REC-02 Sidebar/Master -------+
        |
        +--> UI-REC-03 Form/List/Workspace --+
        |
        +--> UI-REC-04 Cross-app Sweep ------+
```

UI-REC-01 may run immediately.
UI-REC-02 may audit immediately and implement declarations that do not depend on unresolved Grid behavior.
UI-REC-03 may audit immediately but must not certify child-table usability until Grid convergence exists.
UI-REC-04 may inventory immediately; remediation should route to the proper owner.
UI-REC-05 may bootstrap static gates immediately; browser/convergence certification waits on exact candidate heads.

## 7. Priority order

P0:

1. Sales commercial projection and master configuration.
2. Purchase/receipt operator surfaces.
3. Inventory/ATP/stock operational surfaces.
4. Attendance/Payroll operational surfaces.
5. Any broken permission/action/required-field path.

P1:

6. Manufacturing.
7. Finance/AR/AP/payment projection.
8. Warranty/service.
9. Remaining AlumDoor master/reference screens.

P2:

10. Cross-app consistency/cleanup not blocking real workflows.

## 8. Convergence and merge boundary

- All worker branches are forked from the exact control head after program docs are materialized.
- Workers must not merge each other ad hoc.
- Shared contract changes converge in dependency order: truth/validators -> declarations -> presentation -> QA.
- Generated brief changes must originate from source generators.
- Grid runtime changes converge through the Grid program, then are consumed here as a dependency.
- No non-trivial source merge to `main` or production deploy/install is authorized merely by this bootstrap.

## 9. Definition of done

This program is complete when:

1. backend/UI surface truth is materialized and reproducible;
2. all P0 operator masters are reachable;
3. AlumDoor sidebar/catalog reflects current capabilities without dead entries;
4. primary forms/lists/workspaces project current backend fields and server previews correctly;
5. required inputs are reachable and internal snapshots do not leak;
6. representative cross-app gaps are classified and routed;
7. CI detects the drift classes that caused the current regressions;
8. exact convergence candidate passes static + browser evidence;
9. Grid dependency is reconciled rather than duplicated;
10. no production mutation occurs without separate explicit authorization.
