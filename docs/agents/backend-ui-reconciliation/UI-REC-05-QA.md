# UI-REC-05 — QA / COVERAGE GATES

Branch: `converge/ui-rec-05-qa-20260811`
Fork point: `program/backend-ui-reconciliation-20260811@a0eb087fabb6245f9ddddecbcf18ad927825383b`
Status: BOOTSTRAP_GATE_GREEN / WAITING_CONVERGENCE_INPUTS
Risk: tests/CI by default; shared workflow/runtime changes require normal review.

## Mission

Turn backend↔metadata↔UI drift into permanent automated failures and certify one exact convergence candidate across static contracts and representative browser flows.

## Converged implementation

REC-05 provides:

- `server/scripts/verify-ui-reconciliation-candidate.mjs` — exact-SHA guard, required-input contract, surface-matrix structural checks and production/provider diff boundary;
- `.github/workflows/ui-rec-05-convergence.yml` — bootstrap validation on REC-05 convergence PRs and full convergence lanes only when the exact program control branch is proposed to `main`;
- reuse of REC-01 backend/meta validators, REC-02 navigation tests, REC-03 projection tests and Grid convergence tests when those artifacts are present on the candidate;
- runtime typecheck/bundle plus existing Procurement and Attendance desktop/mobile Playwright lanes on the converged candidate.

This clean convergence head was cut from the control branch after UI-REC-01 PR `#831` was merged into it as `a0eb087fabb6245f9ddddecbcf18ad927825383b`. The old worker history is not force-rebased into the control branch.

## Bootstrap execution evidence

Worker PR `#835` produced two green bootstrap executions before the clean convergence head was cut:

- run `31475353720` on `6c4b3a99307426ac3b1902995ff6a73a60d57940`: **SUCCESS**;
- run `31475449149` on `c5a5614e3c3de8061a6a67aa0418f3aed9ec249d`: **SUCCESS**.

Both runs passed locked dependency install, CloudForge build, exact-head assertion, candidate/diff boundary guard, first-party metadata verification, AlumDoor metadata completeness and generic metadata/runtime contract tests. Full `converged` steps were intentionally skipped because those heads were worker/convergence inputs rather than the program-control candidate.

## Dependency Requests before full certification

### DR-UI-REC-05-01 — UI-REC-03 final projection coverage

Owner: UI-REC-03.

PR `#829` remains draft and currently materializes Attendance/Payroll parent-form projection only. REC-05 cannot certify required Sales + Procurement/Stock parent-form/list scope until that owner completes or explicitly routes the residual projection work.

### DR-UI-REC-05-02 — Grid exact candidate

Owner: Grid program / GRID-04.

PR `#833` was superseded before execution. REC-05 requires one exact Grid candidate containing shared runtime plus intended AlumDoor child-grid metadata and green Grid parity evidence before child-grid/browser certification.

### DR-UI-REC-05-03 — Sales browser lane

Owner: UI reconciliation convergence / Sales UI QA.

Current `client/e2e-forge` exposes reusable Procurement and Attendance configurations, but no dedicated Sales commercial browser lane was found during audit. Static Sales backend/meta/preview gates are wired through REC-01; browser Sales certification remains explicitly open rather than inferred from server tests.

### DR-UI-REC-05-04 — REC-04 routed P0

Owner: Procurement/domain UI + navigation owner.

UI-REC-04 is `READY_FOR_ROUTING` and reports a P0 Procurement Source-to-Pay operator navigation gap. Exact convergence must either close that gap in the owner branch or record an evidence-backed reason it is not release-blocking for the selected candidate.

## Required static gates

```text
schema field/type/link/child target parity
metadata target existence
preview output -> declared metadata projection
required-field reachability where statically provable
internal/server field leakage
manifest/nav target existence
dead action/method references
role/permission declaration mismatch candidates
generated-source/output consistency
forbidden business literals in generic renderer where applicable
```

Do not create false rules such as `every backend field must be visible` or `every DocType must have a menu entry`.

## Required representative flows

### Sales

```text
open customer/item masters
create Quotation or Sales Order
select representative door/item
Sales Option path available when configured
server preview updates commercial outputs
save/submit path remains authoritative
```

### Procurement / Stock

```text
create PO
child-grid operator workflow via Grid candidate
receipt path
current dimensional/count/catch-weight fields behave according to metadata/backend
```

### Attendance / Payroll

```text
attendance operational screen opens by role
correction request/review path visible
payroll period/slip actions visible according to role/state
```

### Master data / navigation

```text
intended AlumDoor catalog entries reachable
missing/dead target regression blocked
role-restricted entries hidden where appropriate
```

## Exact-candidate rule

Certification is bound to one immutable convergence SHA. Any source-changing fix after certification invalidates affected evidence and requires rerun.

## Ownership rule

QA must not solve runtime/business failures by hiding tests or adding substitute logic. Issue a Dependency Request to UI-REC-01/02/03/04, GRID owner or domain owner and keep independent QA work moving.

## Acceptance

- all planned drift classes have either an automated gate or an explicit reason they require runtime/manual evidence;
- representative actor/browser flows pass on exact candidate;
- Grid parity evidence is consumed, not duplicated;
- build/typecheck/targeted tests/diff hygiene are recorded;
- no unsupported production-ready claim;
- no deploy/install/tenant mutation;
- no source merge to `main` until normal program acceptance/authorization is satisfied.
