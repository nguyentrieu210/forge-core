# BACKEND/UI RECONCILIATION — AGENT BOARD

Program: `program/backend-ui-reconciliation-20260811`
Source baseline: `main@cecb19c51855ab3e6a05ce84261d717c630c96b7`
Worker fork point: `program/backend-ui-reconciliation-20260811@c4209b8318ac36110ca84094d905ce724ffae3d5`
Status vocabulary: `BOOTSTRAPPED | RUNNING | BLOCKED | READY | CONVERGING | DONE | SUPERSEDED/CLOSED`

## Current topology

| Agent | Branch | Exact bootstrap head | PR | Mission | Status | Depends / blocker |
|---|---|---|---:|---|---|---|
| UI-REC-01 TRUTH | `agent/ui-rec-01-backend-meta-20260811` | `f6bfb42f3ce4483269a68e0fb3192556ea8a7f4f` | — | Backend/schema ↔ metadata truth + validators | BOOTSTRAPPED | — |
| UI-REC-02 NAV | `agent/ui-rec-02-sidebar-master-20260811` | `5089ffb694ebbcc4b9e281d3db26bcfff8155daa` | — | AlumDoor sidebar/catalog/master data IA | BOOTSTRAPPED | UI-REC-01 findings for final closure |
| UI-REC-03 FORMS | `agent/ui-rec-03-form-list-workspace-20260811` | `3ce2f6c73c78e602c6232eb597ef4c2f749b4214` | — | Form/List/Workspace projection audit and fixes | BOOTSTRAPPED | UI-REC-01; Grid program for child-table acceptance |
| UI-REC-04 COVERAGE | `agent/ui-rec-04-project-coverage-20260811` | `96ceb3168e3d564ca7c199accaf1de996a22049e` | — | Cross-app coverage sweep and remediation routing | BOOTSTRAPPED | UI-REC-01 matrix |
| UI-REC-05 QA | `agent/ui-rec-05-qa-gates-20260811` | `469b535d6226030b417730c2a5b7945c1c984d5d` | — | Static drift gates + E2E/convergence evidence | BOOTSTRAPPED | UI-REC-01/02/03/04 + Grid candidate |

Coordinator/control branch is not counted as a worker. A branch is not called `RUNNING` until it has substantive audit/implementation work beyond the bootstrap handoff commit.

## Ownership

### UI-REC-01 TRUTH

Allowed:
- source/schema/metadata audit tooling;
- machine-readable surface matrix;
- generic validation tests;
- docs under this program.

Forbidden:
- sidebar redesign;
- shared React form/grid UX implementation;
- changing business domain authority to make UI easier.

### UI-REC-02 NAV

Allowed:
- AlumDoor manifest/nav/catalog/master-data declarations;
- source brief generator changes required for navigation;
- generated AlumDoor brief via generator;
- focused navigation/catalog tests.

Forbidden:
- `MetadataChildGrid` / shared grid implementation;
- business controllers;
- unrelated form composition.

### UI-REC-03 FORMS

Allowed:
- form/list/workspace metadata declarations;
- summary/section/tab/quick/full/preview bindings;
- focused generic projection primitive only when business-neutral and proven necessary;
- form/list/workspace tests.

Forbidden:
- Grid program runtime hotspots;
- sidebar ownership;
- client business formulas.

### UI-REC-04 COVERAGE

Allowed:
- cross-app audit reports/matrix enrichment;
- capability routing/priority docs;
- narrow owner-correct fixes only when explicitly assigned after audit.

Default behavior is to file/record a Dependency Request rather than edit another owner's hotspot.

### UI-REC-05 QA

Allowed:
- static coverage gates;
- browser/E2E fixtures;
- CI workflow wiring narrowly scoped to this program;
- exact-candidate convergence evidence.

Forbidden:
- hiding a failing test by implementing runtime/business behavior inside QA code;
- production deployment or tenant metadata apply.

## Dependency Request format

```text
Dependency Request
Owner: UI-REC-XX / GRID-XX / domain owner
Need: <exact contract/output>
Why: <why this owner owns it>
Blocked scope: <what cannot close>
Can continue independently: yes/no
Next independent work: <what will continue>
```

## Convergence order

1. UI-REC-01 materializes current backend/UI truth and static drift classes.
2. UI-REC-02 and UI-REC-03 reconcile AlumDoor declarations from that truth.
3. UI-REC-04 sweeps remaining first-party apps and routes residual gaps.
4. Grid parity candidate is reconciled into the shared UI candidate where required.
5. UI-REC-05 runs static gates + representative browser flows on one exact candidate.
6. Coordinator audits ownership leakage, generated artifacts and diff hygiene.
7. Stop before non-trivial merge/deploy unless explicitly authorized.

## Reporting rule

Do not call a worker `RUNNING` because its branch/handoff exists. `RUNNING` requires substantive audit or implementation commits. Every progress report must include exact current branch/head/PR/status.
