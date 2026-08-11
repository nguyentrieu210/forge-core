# NEXT TASKS

Ngày cập nhật: **2026-08-11**.

Đây là **active queue** của Forge. Lịch sử đã hoàn thành nằm trong Git/PR/convergence evidence, không lặp lại thành live queue.

## 0. Current state

- 2026-08-11 Inventory + Attendance/Payroll + Sales source convergence: **DONE**.
- Final convergence PR: `#822` — merged to `main@37880fc828bfcab5f9fca19341ee64e4caee3103`.
- Exact pre-merge combined candidate: `dba25942311fd94064f95d7906b5c044347cc440`.
- R6 Pass Convergence run `31465006532`: **SUCCESS** on that exact combined candidate.
- Production promotion/cutover: **NOT PERFORMED by this wave**.

Do not reopen the superseded Sales/UI/runner/control PR chain. New work starts from exact current `main`.

## 1. Release/pilot lane — only when explicitly authorized

If the next goal is to promote the converged product to AlumDoor production/pilot:

1. resolve exact current `main` and choose one immutable release SHA;
2. lock package/app/profile identity and expected migration inventory for that SHA;
3. rerun exact-SHA release evidence required by current release policy if the release SHA differs from the already validated `dba2594...` candidate;
4. verify desired-vs-observed provider state read-only first;
5. prepare production migration/deploy/cutover actions as separately gated operations;
6. require explicit authorization before deploy/redeploy/rollback, production migration, restore/PITR, tenant apply, DNS/route/secret/provider mutation or customer-data write/cutover;
7. after authorized promotion, reconcile Stock/AR/AP/payment/revenue/COGS/manufacturing/GL and record exact deployed release marker/bundle hash.

Do not treat `main` merge as proof of production deployment.

## 2. Open PR rebaseline lane

Exactly three independent PRs remain open after convergence cleanup:

### `#665` — Repository / North Star hygiene

- Re-audit against exact current `main`.
- Salvage only still-needed brand/docs/security-hygiene changes.
- Do not merge the stale 40-commit history wholesale if current main already supersedes parts of it.
- Any credential rotation/history rewrite remains a separate security/destructive decision.

### `#672` — Provisioning doctrine + Skill Matrix

- Reconcile the doctrine against current Skill/North Star/App Factory state.
- Prefer a small docs-only replacement PR from current main if the content remains valid.
- Do not inherit stale status statements from its old baseline.

### `#675` — Omnichannel Marketplace ERP

- Treat as an independent product workstream, not part of AlumDoor convergence.
- Rebase/reconcile from exact current main before claiming compatibility.
- Re-run current Sales/ATP/Stock/Finance authority tests because main now contains newer Sales fulfillment and aluminum reservation contracts.
- Real marketplace OAuth/secrets/webhooks/provider certification and production promotion remain explicit external/live boundaries.

## 3. Post-convergence product audit

Before opening another broad implementation wave:

- audit current `main` rather than branch snapshots;
- verify no duplicate Pricing/Stock/Payroll authority remains active;
- verify Sales Package fulfillment consumes shared reservation/stock lifecycle;
- verify aluminum purchase/stock metadata remains counted-stock + catch-weight canonical;
- verify Attendance correction/payroll approval and locking remain canonical after future shared-runtime changes;
- identify only evidence-backed residual P0/P1 gaps.

If gaps span independent authority hotspots, open a new PROGRAM from exact current main. Do not reuse the closed 2026-08-11 control branches as live baselines.

## 4. Capability maturity discipline

- Canonical capability denominator remains 956 until a new evidence-backed audit materializes a new distribution.
- Do not raise maturity from source presence or test count alone.
- Promote capability maturity only with source + runtime + permission + correction/reconciliation/evidence appropriate to the risk class.
- Do not implement all Missing capabilities merely to improve a score; prioritize customer/release-critical and shared-safety gaps.

## 5. Source-fix rule after convergence

If a new source defect is found:

1. start from exact current main;
2. record failed invariant/capability;
3. make the smallest owner-correct fix;
4. verify affected domain + shared authority boundaries;
5. merge through normal risk boundary;
6. issue a new release candidate SHA if the change affects a pending release;
7. rerun affected exact-SHA evidence.

Never reuse evidence from an older source SHA after a source-changing fix.

## 6. Standing authorization boundaries

The completed `#822` approval covered source convergence/merge. It did **not** authorize:

- production deploy/redeploy/rollback;
- production migration;
- production restore/PITR;
- tenant metadata/profile apply to live customers;
- customer production data import/write/cutover;
- DNS/route/secret/provider mutation;
- destructive queue replay;
- merge/deploy of future non-UI workstreams not included in `#822`.

## 7. Documentation discipline

Use `CURRENT_STATUS.md` for live verified state and this file for the active queue. Old R6/RC/agent boards, prompts and handoffs are provenance unless current GitHub state explicitly makes them active again. Keep final convergence/certification evidence; remove temporary coordination artifacts when they no longer carry audit value.