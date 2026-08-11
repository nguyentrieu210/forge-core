# Sales Pricing Authority — Implementation Plan

**Status:** READY FOR IMPLEMENTATION AFTER DOC REVIEW  
**Date:** 2026-08-11  
**Target base:** exact latest integration head at implementation time  
**Current integration line:** `exp/alumdoor-pricing-policy`  
**Production boundary:** backend/schema/business-rule changes; branch + PR + verify; stop before merge/deploy until explicit approval

## 1. Objective

Converge Forge Sales onto one server-authoritative commercial pipeline before adding deeper bundle/fulfillment behavior.

The implementation must solve the currently observed authority defects first:

1. `Pricing Rule` exists, but the Sales controller also contains AlumDoor-specific discount policy.
2. line `discount_percentage` exists, while aggregate discount money is not yet fully derived from line policy in one authoritative server calculation path.
3. UI sales-item context resolves price separately from Sales Order server pricing and can drift from submit behavior.
4. accepted Quotation -> Sales Order conversion can re-run current pricing instead of freezing the accepted commercial agreement.
5. fulfillment identity is not consistently anchored to a source Sales Order line key throughout the shared ledger path.
6. PR #802 introduces useful price-variant/commercial math concepts but also introduces a second `Sales Adjustment Rule` authority that should not become permanent architecture.

## 2. Implementation strategy

Use three ordered implementation PRs. Do not start a later PR by compensating for an unresolved invariant in an earlier PR.

```text
PR 1  Sales Pricing Authority
  -> one resolver, server line money, Pricing Rule authority, quote freeze

PR 2  Price Variant + Sales Option
  -> multi-variant Item Price, matrix dimension, operator option

PR 3  Sales Package + Fulfillment
  -> physical components, source-line identity, production/delivery/return/warranty/COGS
```

A fourth hardening PR may follow for tax convergence/long-tail if required, but it must not be used to postpone correctness defects from PR 1-3.

---

# PR 1 — Sales Pricing Authority

## 3. PR 1 goal

After PR 1, a single commercial line must be priced the same way in preview, Quotation, Sales Order save and Sales Order submit, and authoritative money must be reproducible without trusting client totals.

## 4. PR 1 scope

### P1-A — Create/normalize one commercial resolver

Target domain seam:

```text
resolveCommercialLine(context)
```

It should consume normalized authoritative facts and return a complete commercial snapshot.

Inputs conceptually include:

```text
item
price_list
uom
priced_qty
posting_date
customer / customer_group
currency
commercial facts
requested/manual override facts only where policy permits
```

Output conceptually includes:

```text
item_price
base_rate
selling_rate
gross_amount
pricing_rule sources
discount basis
discount amount
adjustments
adjustment amount
net before tax
currency/scale
pricing_as_of
```

The resolver belongs to shared Pricing/Selling domain code, not React and not the AlumDoor worker.

### P1-B — Server-authoritative line discount

Refactor totals so each line can carry server-derived:

```text
gross_amount_minor
discount_basis_amount_minor
discount_amount_minor
adjustment_amount_minor
net_amount_minor
```

Rules:

- fixed-point/scaled integers only for authoritative money;
- client-supplied `discount_amount` cannot be the authority for a policy-derived line discount;
- sum of line money reconciles exactly to document totals after deterministic rounding/allocation;
- explicit document-level discount remains a separate supported concept if generic ERP semantics require it.

### P1-C — Remove AlumDoor hard-coded default discount authority

Retire shared-controller behavior that effectively knows:

```text
door -> expected 15%
rail/shaft/other -> expected 0%
```

Migration path:

- express the currently approved policy as `Pricing Rule` records/data;
- condition on stable metadata (`item_group`, explicit product facts, customer group, etc.);
- preserve approval semantics for manual deviations;
- retain legacy compatibility only long enough to migrate/verify, then remove the duplicate authority.

### P1-D — Extend Pricing Rule instead of creating a parallel adjustment authority

Target effect model:

```text
RATE_OVERRIDE
DISCOUNT_PERCENT
DISCOUNT_AMOUNT
ADJUSTMENT
```

Target adjustment basis:

```text
FIXED
PRICED_QTY
AREA_SQM
LENGTH_M
SET_COUNT
```

Target generic condition support should be sufficient for current AlumDoor facts without encoding AlumDoor literals in the evaluator.

The existing `Pricing Rule` fields remain compatible. Migration extends rather than replaces the authority.

### P1-E — Fold useful PR #802 adjustment evaluator concepts into Pricing Rule

Salvage from PR #802/prototype:

- fixed-point quantity x money arithmetic;
- typed operators `eq/neq/in/not_in/lt/lte/gt/gte`;
- exclusive groups and deterministic priority;
- taxable/discountable effect metadata;
- applied-rule snapshot and version tracing;
- independent discount-basis rate.

Do **not** promote as final authority:

```text
Sales Adjustment Rule
Sales Adjustment Condition
```

If migration `0117_pricing_variants_adjustment_rules.sql` is reused, split/rewrite it so the final migration only creates target contracts. Do not merge a temporary second authority and promise to remove it later.

### P1-F — One pricing path for UI preview

The existing `sales-item-context` pricing lookup must stop being an independent pricing calculator.

Target options:

1. call a named server capability that delegates to `resolveCommercialLine`, or
2. return only non-money context and let the canonical pricing projection supply money.

Acceptance:

```text
same input + same as_of + same authoritative master versions
=> preview rate/discount/adjustment/net exactly equals save/submit result
```

### P1-G — Accepted quotation commercial freeze

At or after customer acceptance, Quotation persists the commercial snapshot.

Quotation -> Sales Order conversion copies the snapshot instead of silently repricing.

Add an explicit `Reprice` action only if needed, with:

- permission;
- reason;
- before/after snapshot;
- audit event;
- current-as-of time;
- approval if the result changes an already agreed order.

### P1-H — Customer -> Price List invariant

Target source:

```text
Customer default selling Price List
or Customer Group fallback
```

AlumDoor `Đại lý` / `Lẻ` remains a customer master classification/snapshot, not a salesperson-entered arbitrary pricing switch.

Server validation must detect inconsistent combinations such as:

```text
customer classified as Dealer
sales document using unauthorized Retail Price List
```

An authorized override, if business needs one, must be explicit and audited.

## 5. PR 1 target code areas

Exact paths must be re-audited on the implementation head. Expected ownership:

```text
server/packages/clouderp-pricing/**
server/packages/clouderp-selling/**
server/migrations/tenant/**
server/tests/** pricing/sales tests
server/apps-src/alumdoor-worker/** only where the preview adapter must delegate
```

Avoid changing moving metadata generator files until the current metadata session is settled unless the PR explicitly owns that handoff:

```text
server/scripts/build-alumdoor-v2-brief.mjs
server/briefs/alumdoor-v2.json
client/packages/views/** child-grid convergence
```

If those files are still concurrently owned, record a Dependency Request and complete backend/domain work independently.

## 6. PR 1 acceptance gates

Mandatory before ready-for-review:

- shared server TypeScript build passes;
- pricing package targeted tests pass;
- selling totals/controller targeted tests pass;
- migration replay/idempotency passes if schema changes;
- no client-computed policy discount required for authoritative total;
- no AlumDoor door/rail literal used to select shared discount policy;
- preview/save/submit parity test;
- accepted quotation conversion preserves snapshot despite master price/rule change;
- manual override approval test;
- fixed-point rounding tests;
- tenant/permission tests for rule reads/override action;
- exact-head runner evidence.

---

# PR 2 — Price Variant + Sales Option

## 7. PR 2 goal

Solve customer-selectable commercial configuration without multiplying Price Lists or exposing several internal fields that can contradict each other.

## 8. PR 2 scope

### P2-A — Item Price variant dimension

Canonical lookup:

```text
Price List + Item + UOM + Price Variant
```

Compatibility:

```text
blank legacy variant -> STANDARD
```

Fail closed:

- requested non-standard variant must not silently fall back to STANDARD;
- more than one active matching record is a validation error.

### P2-B — Price Variant matrix support

Target matrix semantics:

```text
row axis    = Price Variant x UOM
column axis = Price List
cell        = rate
```

No pricing/AlumDoor literals in generic matrix renderer.

Server-authoritative compound read/commit remains the target; do not preserve the current client-side multi-document partial-save behavior as a final contract.

### P2-C — Sales Option configuration

Operator sees one field:

```text
Phương án bán
```

The selected option deterministically derives hidden facts such as:

```text
sales_mode
price_variant
sales_package reference (when available)
```

Storage decision:

- prefer an Item child configuration initially if variants are Item-specific;
- promote to a shared master only if cross-item reuse/versioning requirements justify it.

Do not create a global DocType solely because a dropdown needs options.

### P2-D — Quotation and Sales Order snapshot

Persist:

```text
sales_option
price_variant
item_price source/version where available
commercial snapshot
```

Accepted quotation remains frozen as defined in PR 1.

## 9. PR 2 AlumDoor acceptance cases

At minimum:

- Cửa Đức `Không ray` resolves the correct variant price;
- Cửa Đức `Có ray` resolves the correct variant price;
- Dealer/Retail price remains independent;
- wrong/missing variant price fails closed;
- user cannot create inconsistent `Phương án bán` vs hidden price variant by modifying client payload;
- line UI may show `Tiền CK` without exposing percentage;
- old STANDARD Items continue to work.

---

# PR 3 — Sales Package + Fulfillment

## 10. PR 3 goal

Represent full-set/split-item and with-rail physical obligations without misusing manufacturing BOM.

## 11. PR 3 scope

### P3-A — Sales Package contracts

Shared generic entity pair:

```text
Sales Package
Sales Package Item
```

Required concerns:

- package code/name;
- applicability;
- revision/effective dates/status;
- component rows;
- quantity basis/factor;
- deterministic checksum/snapshot;
- no vertical literals in shared engine.

Quantity bases initially required:

```text
FIXED
HEIGHT
WIDTH
CUT_WIDTH
AREA
SET_COUNT
LEAF_COUNT
```

Only add bases backed by a real second use or proven business requirement.

### P3-B — Package snapshot on commercial line

At Sales Order commercial freeze persist:

```text
package id
revision/version
checksum
component_snapshot[]
```

Do not re-expand current package metadata during Delivery/Return for an old order.

### P3-C — Source-line fulfillment identity

Extend canonical fulfillment identity to include:

```text
sales_order
sales_order_line_key
package_component_key
item_code
qty
```

All progress/reversal logic must use the source line/component identity.

### P3-D — Demand classification

For each physical component:

```text
available stock -> reservation/fulfillment
purchase needed -> procurement demand
manufacturable -> production/work order -> Item BOM
```

Sales Package does not embed BOM rows.

### P3-E — Delivery/Invoice model

Customer-facing commercial line can remain one line while Delivery posts physical components.

Required reconciliation:

```text
commercial obligation
== sum delivered component obligations according to package snapshot
```

Invoice/revenue remains attached to the commercial line unless business explicitly prices components separately.

### P3-F — Return/Warranty/COGS

Return:

- reverse actual delivered component from the original package snapshot;
- preserve source-line/component provenance.

Warranty:

- trace order line -> delivery -> component -> production/purchase origin when available.

COGS:

```text
package-line COGS = sum actual component valuation postings
```

Margin report reconciles revenue parent vs component COGS.

---

# 12. Migration plan

## 12.1 Rules

Every schema/business migration must be:

- append-only where possible;
- idempotent/replayable;
- tenant-safe;
- backwards-readable;
- non-destructive to historical monetary documents;
- accompanied by a migration test.

## 12.2 Price Variant migration

Compatibility rule:

```text
legacy missing/blank price_variant = STANDARD
```

Do not rewrite all historical Item Price records merely to materialize `STANDARD` unless required by a proven uniqueness/index migration.

If uniqueness/indexing requires materialization, migration must prove no duplicate active intersection will be created.

## 12.3 Pricing Rule extension

Prefer extending existing `Pricing Rule` metadata and evaluator rather than creating a replacement DocType.

Existing rules with simple `rate` or `discount_percentage` must continue to resolve identically after migration.

## 12.4 Historical Sales documents

Do not fabricate provenance.

For old documents with no pricing snapshot:

```text
pricing_provenance = LEGACY / UNKNOWN
```

or equivalent explicit compatibility state.

Never backfill `pricing_rule_version` by looking at today's rule and pretending it was used historically.

## 12.5 Package migration

Only new/explicitly migrated Orders receive package snapshots. Historical orders without proof remain legacy lines and continue through their proven old fulfillment path until a controlled migration is defined.

---

# 13. Concurrency / branch ownership

At the time these docs were created, `exp/alumdoor-pricing-policy` is active and has concurrent metadata/inventory work. Therefore implementation branches must start from the exact latest integration head at branch creation time.

Recommended ownership boundaries:

### PR 1

Own:

```text
clouderp-pricing
clouderp-selling pricing/totals contracts
pricing migrations/tests
preview adapter only as required
```

Avoid:

```text
AlumDoor brief/import generator
child-grid metadata convergence
inventory reservation files
```

### PR 2

Own:

```text
Item Price variant schema/resolver
pricing matrix read/commit domain contract
Sales Option metadata once generator ownership is free
```

### PR 3

Own:

```text
Sales Package domain
fulfillment identity
production/delivery integration
```

Any shared file collision is a Dependency Request, not a reason to overwrite another branch's work.

---

# 14. Dependency Requests

## DR-SALES-01 — Metadata generator handoff

**Need:** canonical place to add Sales Option / variant projection fields to Quotation and Sales Order Items.  
**Blocked scope:** final UI wiring in PR 2.  
**Can continue independently:** yes, backend pricing contracts can be completed first.

## DR-SALES-02 — Generic pricing matrix convergence

**Need:** generic Matrix metadata/runtime must support an additional business-neutral row dimension and atomic/explicit compound commit.  
**Blocked scope:** removal of current Item Price specialist compatibility route.  
**Can continue independently:** yes, server Item Price variant resolver and flat/bulk fallback can ship behind compatibility path.

## DR-SALES-03 — Fulfillment entry source-line contract

**Need:** shared fulfillment ledger/query contract to persist source line and package component identity.  
**Blocked scope:** PR 3 final Delivery/Return reconciliation.  
**Can continue independently:** Sales Package schema/expansion tests can be built first.

## DR-SALES-04 — Tax convergence

**Need:** decide migration from AlumDoor header VAT compatibility to generic effective-dated tax authority.  
**Blocked scope:** final removal of AlumDoor VAT compatibility.  
**Can continue independently:** pricing/discount/package implementation must keep tax boundary clean and not create more manual tax paths.

---

# 15. PR #802 disposition

PR #802 must remain draft/research until reconciled with this architecture.

Before any promotion:

1. compare exact PR #802 head with latest integration head;
2. extract reusable commits/concepts where clean;
3. remove or rewrite migration that creates the parallel `Sales Adjustment Rule` authority;
4. preserve price-variant and commercial fixed-point tests where still valid;
5. do not merge #802 merely to avoid losing work;
6. verify the replacement implementation on its own exact head.

---

# 16. Definition of Done for the full Sales convergence

The program is done only when all are true on one integration head:

- one commercial resolver powers preview and authoritative saves;
- line money is server-derived and reconciles to document totals;
- Pricing Rule is the only conditional commercial-adjustment authority;
- no AlumDoor-specific discount/surcharge amounts are hard-coded in shared runtime;
- Dealer/Retail are independent Price Lists;
- Price Variant supports Có ray/Không ray without extra Price Lists;
- Sales Option prevents contradictory internal selections;
- Sales Package owns physical full-set components;
- BOM remains manufacturing authority;
- fulfillment is keyed by source Sales line + package component;
- accepted Quotation remains commercially frozen;
- Delivery/Invoice/Return/Warranty/COGS reconcile to the frozen snapshot;
- migration replay, permission, tenant, fixed-point, retry/idempotency and Golden Flow evidence pass;
- no merge/deploy occurs before explicit approval for the backend/schema/business-rule changes.
