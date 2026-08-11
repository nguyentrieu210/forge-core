# Forge Sales Commercial Architecture — Documentation Index

**Status:** Architecture locked for implementation planning  
**Date:** 2026-08-11  
**Scope:** Forge shared Selling/Pricing core + AlumDoor reference vertical  
**Code changes:** None in this documentation branch

## Purpose

This folder freezes the commercial architecture before further Sales implementation. The goal is to stop solving AlumDoor cases as isolated UI fields or controller branches and instead converge on one reusable Sales model that preserves Forge's metadata-first, authoritative-backend and vertical-without-runtime-fork principles.

The documents here are implementation contracts. If code, migration or tests later prove a contract wrong, exact code + migration + tests win and these documents must be updated in the same PR.

## Canonical documents

| Document | Purpose |
| --- | --- |
| [`SALES_COMMERCIAL_ARCHITECTURE.md`](./SALES_COMMERCIAL_ARCHITECTURE.md) | Canonical authority map, domain boundaries, commercial/fulfillment/manufacturing data flow, snapshot rules and anti-patterns. |
| [`ALUMDOOR_SALES_BUSINESS_CASE_MATRIX.md`](./ALUMDOOR_SALES_BUSINESS_CASE_MATRIX.md) | Maps every known AlumDoor sales case to the canonical primitives: Cutting Policy, Item Price, Pricing Rule, Sales Option, Sales Package and BOM. |
| [`SALES_PRICING_AUTHORITY_IMPLEMENTATION_PLAN.md`](./SALES_PRICING_AUTHORITY_IMPLEMENTATION_PLAN.md) | Ordered implementation plan, PR boundaries, migration strategy, compatibility, dependency requests and stop gates. |
| [`SALES_GOLDEN_FLOW_AND_TEST_PLAN.md`](./SALES_GOLDEN_FLOW_AND_TEST_PLAN.md) | Golden flows, invariants, failure/correction paths and exact acceptance evidence required before promotion. |

## Architecture decision summary

The Sales model is intentionally split into six authorities:

1. **Measurement / Cutting Policy** — determines geometry and billable quantity facts.
2. **Item Price** — stores base commercial price for `Price List + Item + UOM + Price Variant`.
3. **Pricing Rule** — is the single authority for commercial adjustments: rate override, discount and surcharge/adjustment.
4. **Sales Option** — is the operator-facing choice that deterministically selects the commercial/fulfillment configuration.
5. **Sales Package** — defines physical components that must be fulfilled for a commercial line.
6. **BOM** — defines manufacturing consumption required to produce a manufacturable item.

These authorities must not be collapsed into one another.

## Explicit non-decisions / rejected directions

- Do **not** hard-code `Cửa Đức`, `Cửa Úc`, `vân gỗ`, `15%`, rail prices or surcharge amounts in shared Selling/Pricing runtime.
- Do **not** create four Price Lists such as `Đại lý có ray`, `Đại lý không ray`, `Bán lẻ có ray`, `Bán lẻ không ray`; the rail/full-set dimension belongs to price variant/sales option.
- Do **not** use manufacturing BOM as the sales fulfillment bundle merely because several components are sold together.
- Do **not** let a Pricing Rule silently decide physical delivery composition.
- Do **not** keep both `Pricing Rule` and `Sales Adjustment Rule` as competing commercial-policy authorities.
- Do **not** trust client-calculated discount amount, surcharge amount or final amount as authoritative money.
- Do **not** automatically re-price an accepted quotation when converting it to a Sales Order.

## Relationship to PR #802

`feat/alumdoor-price-variant-adjustment-rules` / PR #802 is treated as a **research/prototype branch**, not the target architecture.

Reusable concepts from that work:

- `price_variant` resolution;
- fixed-point commercial arithmetic;
- independent discount-basis price snapshot;
- commercial-line snapshot concepts;
- useful focused tests.

Target change before implementation promotion:

- fold adjustment-rule semantics into the existing shared `Pricing Rule` authority;
- do not merge `Sales Adjustment Rule` / `Sales Adjustment Condition` as a second permanent commercial-policy system;
- rebase implementation work on the exact latest integration head before verification.

## Execution order

The implementation order is deliberately dependency-first:

1. **PR 1 — Sales Pricing Authority**: one server pricing resolver, line discount calculated server-side, remove AlumDoor discount hard-code, Pricing Rule becomes the only commercial adjustment authority, accepted quotation freezes commercial snapshot.
2. **PR 2 — Price Variant + Sales Option**: `Price List + Item + UOM + Price Variant`, matrix support, operator-facing sales option, deterministic mapping to price variant/sales mode.
3. **PR 3 — Sales Package + Fulfillment**: package component snapshot, source-line-key fulfillment, Production/Delivery/Return/Warranty/COGS integration.

No later PR may compensate for an unresolved earlier invariant.

## Production boundary

All planned work changes backend/schema/business rules. Therefore each implementation slice requires branch + PR + exact verification and must stop before merge/deploy until explicitly approved.
