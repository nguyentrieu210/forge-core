# Sales Golden Flow & Test Plan

**Status:** ACCEPTANCE CONTRACT  
**Date:** 2026-08-11  
**Scope:** shared Sales/Pricing convergence + AlumDoor reference flows

## 1. Purpose

This document defines the evidence required before the Sales architecture can move from implementation to RC. Test count alone is not evidence. The required proof is deterministic end-to-end behavior, failure handling, correction semantics, permission enforcement and reconciliation on the exact integration head.

The test plan is organized in layers:

1. pricing authority invariants;
2. quotation/order commercial freeze;
3. price variant and operator option;
4. Sales Package fulfillment;
5. manufacturing boundary;
6. delivery/billing/return/warranty/COGS;
7. security/tenant/retry/migration;
8. AlumDoor Golden Flows.

## 2. Global invariants

### INV-01 — One pricing answer

For the same authoritative input facts, master versions and `as_of` time:

```text
UI preview == Quotation calculation == Sales Order save == Sales Order submit
```

No path may maintain its own independent pricing semantics.

### INV-02 — Server owns money

Authoritative:

```text
gross
discount basis
discount amount
adjustments
net
tax
grand total
```

must be server-derived using fixed-point/scaled integer semantics.

Client-submitted totals are either ignored/rebuilt or validated against the canonical result. A tampered client amount must not change the posted commercial result.

### INV-03 — Pricing Rule is unique commercial policy authority

No parallel hard-coded or DocType-based policy may decide the same discount/surcharge outcome.

### INV-04 — No vertical literals in shared engine

Shared Pricing/Selling evaluator may know generic facts/operators/effect types but not business literals such as:

```text
Cửa Đức
Cửa Úc
ray
vân gỗ
465000
15% default door discount
```

Vertical records/configuration can contain those values.

### INV-05 — Quantity separation

Tests must distinguish:

```text
priced_qty
physical_fulfillment_qty
production_qty
stock_qty
```

Changing a commercial measurement basis must not silently alter physical production/stock quantity unless an explicit business rule says it should.

### INV-06 — Frozen accepted commercial agreement

After Quotation acceptance, master changes do not alter downstream Sales Order commercial snapshot without explicit Reprice/amend action.

### INV-07 — Fulfillment binds to source line

Delivery/billing/return/warranty progress is keyed by source commercial line and package component where applicable, not only `item_code`.

### INV-08 — Historical reversal uses historical snapshot

Cancel/return/reversal never re-evaluates today's Price List, Pricing Rule, Sales Package or BOM to reverse an old transaction.

---

# 3. Pricing Authority tests — PR 1

## PA-01 — Base Item Price resolution

Given:

- active Price List;
- active Item Price matching Item/UOM/currency;
- no Pricing Rule;

Expect:

- exact base rate;
- exact Item Price identity in snapshot;
- no discount/adjustment;
- deterministic amount from priced quantity.

## PA-02 — Missing Item Price fails closed

Given selected managed Price List and no matching price:

Expect explicit validation/reference failure. Never use zero or unrelated legacy price silently.

## PA-03 — Duplicate active matching Item Price fails closed

Given two active records matching the same canonical intersection:

Expect validation error naming the ambiguous intersection.

## PA-04 — Pricing Rule discount

Given a matching `DISCOUNT_PERCENT` rule:

Expect:

- server calculates discount basis and amount;
- snapshot records rule identity/version;
- client percentage/amount tampering cannot alter result.

## PA-05 — Fixed discount amount

Given `DISCOUNT_AMOUNT` effect:

Expect deterministic amount and boundary validation so discount cannot produce invalid negative net unless explicit generic policy supports it.

## PA-06 — Rate override precedence

Given matching base Item Price and rate-override Pricing Rule:

Expect deterministic rule selection by specificity/priority contract.

Tied exclusive rules must fail closed.

## PA-07 — Adjustment by area

Given an `ADJUSTMENT / AREA_SQM` rule:

Expect fixed-point amount = configured rate x canonical area fact.

## PA-08 — Adjustment by length

Given `ADJUSTMENT / LENGTH_M`:

Expect amount = configured rate x canonical length fact.

## PA-09 — Adjustment by set count

Given `ADJUSTMENT / SET_COUNT`:

Expect amount = configured rate x canonical set count.

## PA-10 — Adjustment fixed

Given `ADJUSTMENT / FIXED`:

Expect exactly one configured fixed charge for the declared scope.

Line vs Order scope must be explicit.

## PA-11 — Effective dates

Test before, during and after validity interval.

No future/expired rule may apply outside its interval.

## PA-12 — Currency mismatch

Rule/Item Price currency inconsistent with document currency must fail explicitly or use an approved conversion contract; never silently treat values as the document currency.

## PA-13 — Independent discount basis

Given:

```text
selling rate  = variant A
basis rate    = variant B/baseline
quantity      = Q
discount      = P%
```

Expect:

```text
gross = A x Q
discount basis = B x Q
discount amount = P% x basis
net = gross - discount + adjustments
```

## PA-14 — Manual override approval

Unauthorized salesperson submits a rate/discount differing from policy:

- save draft may preserve override according to UX policy;
- submit is denied when approval required.

Authorized Sales Manager/System Manager can approve/submit and audit stores override reason/provenance.

## PA-15 — Preview parity

For every pricing fixture, compare canonical resolver response with UI preview adapter response and submitted document snapshot. All monetary fields must match exactly.

---

# 4. Quotation / Sales Order tests

## QO-01 — Draft recalculation

Changing customer, date, dimensions or Sales Option on a draft recalculates through the canonical resolver.

## QO-02 — Customer group is sourced from Customer master

Client cannot arbitrarily submit a conflicting Dealer/Retail classification for a new/changed customer.

## QO-03 — Price List mapping

Customer/default pricing configuration resolves expected Price List.

Conflicting unauthorized Price List fails.

## QO-04 — Accepted Quotation freezes snapshot

Steps:

1. create Quotation under Price/Rule version A;
2. accept/customer-agree;
3. change Item Price and Pricing Rule to version B;
4. convert to Sales Order.

Expect Sales Order monetary snapshot equals accepted version A.

## QO-05 — Explicit Reprice

From an allowed draft/amend state:

- invoke Reprice;
- current version B is applied;
- before/after values and reason are audited;
- no silent reprice occurs without action.

## QO-06 — Formula snapshot preservation

Quotation -> Sales Order preserves formula policy/version, geometry and derived facts required by production/cutting.

## QO-07 — Duplicate conversion prevention

Converting the same accepted Quotation twice must fail/idempotently return the existing order according to the canonical conversion contract; never create two fulfillment obligations.

---

# 5. Price Variant / Sales Option tests — PR 2

## PV-01 — Legacy STANDARD compatibility

Legacy Item Price without variant resolves only when the requested variant is `STANDARD`/blank compatibility mode.

## PV-02 — Non-standard fail closed

Request `WITH_RAIL`; only STANDARD exists.

Expect missing-variant error. Never silently fall back.

## PV-03 — Same Price List + Item + UOM supports multiple variants

Create active `NO_RAIL` and `WITH_RAIL` prices.

Expect each option resolves its own rate without ambiguity.

## PV-04 — Dealer/Retail independence

Changing Retail Item Price must not alter Dealer Item Price.

No percentage derivation between Price Lists is performed unless an explicit Pricing Rule says so.

## PV-05 — Sales Option deterministic mapping

Given option `WITH_RAIL`:

Expect server-derived hidden configuration matches the option definition.

Client attempts to submit contradictory `price_variant` or `sales_mode` are ignored/rejected according to contract.

## PV-06 — Item applicability

A Sales Option configured for another Item/group cannot be applied to this line.

## PV-07 — Matrix sparse create/update/OCC

Variant x UOM x Price List cells:

- create missing price;
- update existing;
- stale version conflict preserves operator draft;
- disabled Price List/price cannot be edited as active without allowed action.

---

# 6. Sales Package tests — PR 3

## SP-01 — Package fixed component

Package parent x2 with fixed component factor 1 produces component obligation x2.

## SP-02 — Height-based rail

Given canonical height H and set count S:

component quantity derived from declared `HEIGHT` basis/factor must be deterministic.

Do not infer height from item name/code.

## SP-03 — Width/cut-width component

Verify package can consume canonical width/cut-width fact where business configuration requires it.

## SP-04 — Set-count component

Motor/accessory configured `SET_COUNT` produces exact count per set.

## SP-05 — Package revision freeze

Steps:

1. Sales Order snapshots package revision 4;
2. package master becomes revision 5 with changed components;
3. Delivery from old order.

Expect Delivery uses revision-4 component snapshot.

## SP-06 — Missing package fact fails closed

A component needs `HEIGHT`, but source line lacks a valid canonical height.

Expect package expansion validation error; never substitute 0 or 1.

## SP-07 — Disabled/expired package

New order cannot choose inactive/expired package; existing frozen order remains fulfillable from its snapshot.

## SP-08 — Package does not create revenue children

Physical child rows are fulfillment obligations. No duplicate commercial revenue is created unless explicitly configured as independently priced child lines.

---

# 7. Manufacturing boundary tests

## MF-01 — Package component available from stock

No BOM/Work Order is created merely because the Item appears in a Sales Package.

## MF-02 — Manufacturable component

If component demand requires production, production layer resolves that component Item's BOM.

## MF-03 — Sales Package edit does not mutate BOM

Changing package composition must not alter manufacturing BOM records.

## MF-04 — BOM edit does not mutate accepted package snapshot

Old order fulfillment composition remains frozen even if component manufacturing BOM changes.

## MF-05 — Billable quantity does not become production quantity accidentally

Regression test for dimensional doors:

- vary customer commercial measurement basis;
- same physical door facts remain constant;
- production/stock output changes only if an explicit manufacturing rule requires it.

---

# 8. Delivery / billing / return tests

## FL-01 — Same Item, different source rows

Sales Order:

```text
row A: same Item, color/size A
row B: same Item, color/size B
```

Deliver row A only.

Expect row B remaining quantity unchanged.

## FL-02 — Partial package delivery

Deliver subset of package components according to permitted delivery policy.

Expect remaining component obligations computed from frozen package snapshot.

If package is configured `all-or-nothing`, partial delivery must fail explicitly.

## FL-03 — Billing progress uses source line

Billing one commercial line does not mark a repeated same-Item line as billed.

## FL-04 — Cancel Delivery reverses exact fulfillment

Cancellation reverses original component/source-line quantities and original stock value postings; no current package re-expansion.

## FL-05 — Return component

Return one delivered component.

Expect exact original source-line/package-component provenance and stock reversal/return semantics.

## FL-06 — Return after package master change

Return still uses original snapshot.

## FL-07 — Warranty trace

Warranty claim can resolve exact Sales Order line and actual delivered component.

## FL-08 — COGS roll-up

For a package commercial line:

```text
line COGS == sum posted stock valuation of its delivered components
```

Repeated items from other lines/packages must not leak into the roll-up.

---

# 9. AlumDoor Golden Flows

## GF-01 — Cửa Đức Không ray

1. Customer selected -> Dealer/Retail Price List resolved.
2. Select Cửa Đức Item.
3. Select `Không ray`.
4. Enter valid dimensions/set count.
5. Cutting Policy derives billable quantity.
6. `NO_RAIL` Item Price resolves.
7. Pricing Rule applies configured discount/adjustment.
8. Server produces `Tiền CK`, `Phụ thu`, `Thành tiền`.
9. Accept Quotation and convert to Sales Order.
10. Master price changes after acceptance.
11. Sales Order preserves accepted money.
12. Fulfillment contains no rail obligation from this option.

Evidence:

- resolver trace;
- Quotation/SO snapshot equality;
- no rail package component;
- amount reconciliation.

## GF-02 — Cửa Đức Có ray

Same as GF-01 except:

- Sales Option = `Có ray`;
- price variant = configured WITH_RAIL;
- package snapshot includes correct rail obligation;
- Delivery posts rail physical stock in addition to the door obligation.

If discount basis differs from selling variant, prove both rates and computed discount amount in snapshot.

## GF-03 — Cửa Úc Trọn bộ

1. Select Australian door.
2. `Trọn bộ`.
3. Cutting Policy chooses correct billable geometry basis.
4. full-set variant price resolves.
5. any confirmed size/finish Pricing Rules apply.
6. package snapshot expands configured door/rail/shaft/motor/accessories.
7. production demand uses BOM only for components that require manufacturing.
8. Delivery decrements physical components.
9. Invoice may remain one customer-facing commercial line.
10. COGS rolls up components to the commercial line.

## GF-04 — Cửa Úc Tách món

1. `Tách món` selection.
2. split measurement basis applies where configured.
3. no full-set package expansion.
4. separately added rail/shaft Items are independent commercial lines.
5. Delivery/billing progress stays line-specific.

## GF-05 — Cửa Đài Loan Trọn bộ

Same package/fulfillment proof as GF-03 using Taiwan-door configuration; verify any manual-pull geometry exception remains within Cutting Policy, not pricing/package code.

## GF-06 — Cửa Đài Loan Tách món

Same separation proof as GF-04.

## GF-07 — Sơn vân gỗ

1. Select finish fact = wood grain.
2. No client hard-coded amount.
3. Pricing Rule matches configured product/finish facts.
4. adjustment computed from canonical area.
5. change rule rate for a new effective date.
6. old accepted quote retains old amount; new quote receives new amount.

## GF-08 — Ray màu / linear surcharge

1. linear Item with length quantity;
2. configured finish/color fact;
3. Pricing Rule adjustment by LENGTH_M;
4. stock UOM conversion remains independent from priced length;
5. no Item-name string matching controls money.

---

# 10. Failure-path Golden Flows

## GF-F01 — Missing price variant

User chooses `Có ray` but active WITH_RAIL price is missing.

Expected visible error with Item/Price List/UOM/variant context. No fallback and no zero price.

## GF-F02 — Ambiguous Pricing Rules

Two equally winning exclusive rules match.

Expected fail closed and identify both rules.

## GF-F03 — Tampered discount amount

Client submits a different `discount_amount` from server calculation.

Expected authoritative result unaffected or request rejected; never accept tampered money.

## GF-F04 — Conflicting hidden option fields

Client says:

```text
sales_option = WITH_RAIL
price_variant = NO_RAIL
```

Expected server derives/rejects contradiction from the authoritative Sales Option definition.

## GF-F05 — Unauthorized Price List

Salesperson changes Dealer customer to Retail Price List without permission.

Expected permission/business validation failure.

## GF-F06 — Reprice accepted quote without explicit action

Direct conversion after master changes must preserve old price. No automatic current-price refresh.

## GF-F07 — Package component insufficient stock

The stock/reservation/production domain must expose shortage and follow its canonical promise/reservation rules; Sales Package expansion itself must not fake availability.

## GF-F08 — Retry/idempotency

Retry the same conversion/submit/commit command.

Expected exactly-once business effect; no duplicated order, rule snapshot, component obligation or ledger entry.

---

# 11. Security / tenant / permission evidence

Mandatory tests:

- tenant A cannot read/use tenant B Price List/Item Price/Pricing Rule/Sales Package;
- Sales User can read allowed pricing projections but cannot mutate policy master unless permitted;
- Sales Manager approval path works server-side;
- spoofed roles/customer group/tenant in payload do not override trusted context;
- package expansion only uses tenant-owned Item/master records;
- Reprice requires declared permission.

---

# 12. Migration evidence

For every migration PR:

1. clean database apply;
2. replay same migration;
3. existing legacy Price/Rule documents remain readable;
4. historical Sales documents retain exact stored totals;
5. no duplicate active Item Price intersection introduced;
6. no fabricated historical pricing provenance;
7. downgrade is not required, but correction/runbook for failed migration must be documented before production.

---

# 13. Performance / scale evidence

Minimum checks:

- pricing resolver avoids N network round-trips per rule/cell where a bounded list/projection can be used;
- one Sales document reads coherent rule/master versions within the calculation request;
- large Item Price matrix remains bounded and sparse, no N x M cell reads;
- package expansion for normal order sizes is bounded;
- exact runner records timing/regression markers when the full suite is executed.

---

# 14. Required exact-head evidence before each PR can leave draft

Each implementation PR must record:

```text
branch
head SHA
base SHA
migration(s)
targeted test command(s)
result counts
full server suite result when blast radius requires it
metadata/compiler result if metadata changed
web typecheck/build if UI changed
self-hosted/local runner run ID when used
known blockers / deferred Dependency Requests
```

No statement such as `CI green` is allowed without an actual check/run attached to the exact head.

---

# 15. Promotion gate

Sales convergence reaches RC only after GF-01 through GF-08 plus relevant failure/security/migration cases pass on one integration head.

It reaches Hardened only after additional production-boundary evidence exists for:

- real operator workflow;
- correction/return cases;
- reconciliation;
- performance/large data;
- observability/release rollback;
- no unresolved authority overlap.
