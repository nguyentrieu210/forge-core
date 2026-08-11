# Sales Commercial Implementation Status

**Branch:** `feat/sales-commercial-complete-20260811`  
**Started:** 2026-08-11  
**Status:** IN IMPLEMENTATION — do not merge/deploy

This integration branch stacks the locked `docs/sales/*` contract, PR1 server-authoritative pricing, PR2 price variants/Sales Options, then completes Sales Package, source-line fulfillment, invoice snapshot reuse, metadata-driven operator UI and Golden Flow verification.

## Current implementation gates

- Pricing authority: implemented on stacked PR1.
- Price Variant + Sales Option: implemented on stacked PR2.
- Sales Package: resolver/schema/snapshot composition implemented.
- Source-line fulfillment store: validated and committed.
- Delivery source-line/package validation + Sales Invoice frozen SO pricing: validating now.
- Operator split/full-set UI and Golden Flows: next downstream gates.
- Local `5173` smoke: pending exact integration SHA after all code/test gates are green.

Production merge/deploy remains a separate approval gate.
