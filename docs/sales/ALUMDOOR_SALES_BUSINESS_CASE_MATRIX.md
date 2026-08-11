# AlumDoor Sales Business Case Matrix

**Status:** BUSINESS CASE CONTRACT / implementation reference  
**Date:** 2026-08-11  
**Scope:** known AlumDoor sales cases gathered from current brief, code, real-data pricing tests and owner decisions

## 1. Purpose

This document prevents individual AlumDoor requirements from becoming isolated hard-coded branches. Every business case is mapped to the canonical Sales authorities defined in `SALES_COMMERCIAL_ARCHITECTURE.md`.

Status vocabulary:

- **CONFIRMED** — business direction explicitly locked in the current work.
- **CURRENT-CODE** — behavior exists in current code/data but still needs to be converted to the target authority.
- **CANDIDATE** — research/prototype behavior that must not be promoted as business truth without explicit evidence/confirmation.
- **TARGET** — implementation requirement derived from the architecture.

## 2. Customer pricing model

### BC-PRICE-01 — Dealer and Retail are independent prices

**Status:** CONFIRMED

Business rule:

- `Đại lý` and `Bán lẻ` are independent Price Lists/business prices.
- Dealer price is **not** calculated as Retail minus a fixed percentage.
- A discount policy, if any, is applied after the correct Price List/base price is selected.

Target mapping:

```text
Customer.price_group
  -> default selling Price List
  -> Item Price
```

Required invariant:

```text
Customer group / Price List mismatch must fail or require an explicit authorized override.
```

Do not create combination Price Lists such as:

```text
Đại lý Có ray
Đại lý Không ray
Bán lẻ Có ray
Bán lẻ Không ray
```

The product option is a Price Variant/Sales Option dimension.

---

## 3. Cửa Đức — Có ray / Không ray

### BC-DE-01 — Cửa Đức không ray

**Status:** CONFIRMED

Operator choice:

```text
Phương án bán = Không ray
```

Target resolution:

```text
Sales Option = NO_RAIL
  -> price_variant = NO_RAIL
  -> sales_package = door-only package (or no package if the door line itself is the only physical obligation)
```

Pricing:

```text
Price List + Item + UOM + NO_RAIL -> Item Price
```

Fulfillment:

- no rail is promised by this commercial option;
- a separately purchased rail remains an independent Sales Order line.

Manufacturing:

- door manufacturing uses the door Item's BOM independently from the Sales Option.

### BC-DE-02 — Cửa Đức có ray

**Status:** CONFIRMED

Operator choice:

```text
Phương án bán = Có ray
```

Target resolution:

```text
Sales Option = WITH_RAIL
  -> price_variant = WITH_RAIL
  -> sales_package = door + rail package
```

Pricing:

```text
Price List + Item + UOM + WITH_RAIL -> Item Price
```

Fulfillment:

- door + correct rail obligation are created from the package snapshot;
- rail quantity is derived from package quantity basis and canonical geometry facts, not from a literal `+1 rail` assumption unless the package itself declares a fixed quantity.

### BC-DE-03 — Real-data baseline vs with-rail evidence

**Status:** CURRENT-CODE / migration evidence

The current real-data pricing test contains at least one known item (`TP-TD-AL752N`) with separate source prices for baseline and with-rail selling. The existing prototype used:

```text
baseline rate = 1,626,000 / m²
with-rail rate = 1,701,000 / m²
```

This is evidence that the variant dimension is real. It is **not** a reason to keep separate Price Lists named by rail state in the target model.

Migration target:

```text
same customer Price List
same Item
same UOM
variant NO_RAIL / WITH_RAIL
separate Item Price records
```

Any dealer/retail rates not proven by source data must be loaded as independent records, never derived by an assumed percentage.

---

## 4. Cửa Úc — Trọn bộ / Tách món

### BC-AU-01 — Trọn bộ

**Status:** CONFIRMED

Operator choice:

```text
Phương án bán = Trọn bộ
```

Target resolution:

```text
sales_mode = Trọn bộ
price_variant = configured full-set variant
sales_package = configured Australian full-set package
```

Package may contain, depending on actual product configuration:

- door/finished door component;
- rail;
- shaft/trục;
- motor;
- accessories.

The package definition, not shared TypeScript, owns the exact component list.

### BC-AU-02 — Tách món

**Status:** CONFIRMED

Operator choice:

```text
Phương án bán = Tách món
```

Target behavior:

- Cutting Policy uses the split-item sales basis where it affects billable geometry;
- the customer may buy the door/component independently;
- rail/shaft/motor/accessories purchased separately are independent Sales Order lines with their own Item Price/Pricing Rule behavior;
- no full-set Sales Package is silently expanded.

### BC-AU-03 — Size-based billing boundary

**Status:** CANDIDATE — must be business-confirmed before production

The current experimental adjustment code contains a rule concept where Australian doors below/above an area boundary may use different billing behavior, and exactly-on-boundary is deliberately unresolved rather than guessed.

Target requirement if retained:

- the boundary and behavior are configuration/business-rule data;
- exact-boundary behavior is explicit;
- server fails closed for an unresolved boundary;
- no hard-coded `4 m²` business truth remains in generic shared runtime.

### BC-AU-04 — Medium-size surcharge

**Status:** CANDIDATE / prototype evidence

The experimental branch contains a size-based surcharge concept for an Australian door interval. If business confirms it, it maps to:

```text
Pricing Rule
condition: product facts + area interval
effect: ADJUSTMENT
basis: SET_COUNT
rate: configured amount
```

It does not belong in BOM or Item Price.

---

## 5. Cửa Đài Loan — Trọn bộ / Tách món

### BC-TW-01 — Trọn bộ

**Status:** CONFIRMED

Target resolution:

```text
Sales Option = FULL_SET
  -> sales_mode = Trọn bộ
  -> price_variant = configured full-set variant
  -> sales_package = configured Taiwan-door package
```

Package owns physical components. Cutting Policy owns geometry/billable basis. BOM owns manufacturing consumption.

### BC-TW-02 — Tách món

**Status:** CONFIRMED

Target resolution:

```text
Sales Option = SPLIT
  -> sales_mode = Tách món
  -> configured price variant
  -> no full-set expansion
```

Separately sold rail/shaft/accessories remain normal sale Items.

### BC-TW-03 — Manual-pull formula exception

**Status:** CURRENT-CODE

Current Cutting Policy already supports a specific manual-pull sales basis. This remains a **geometry/measurement** concern and must not migrate into Pricing Rule or Sales Package.

---

## 6. Ray / Trục / linear Items

### BC-LINEAR-01 — Ray sells by length

**Status:** CURRENT-CODE / TARGET

Current Sales quantity behavior recognizes linear Items and can price by length. Target architecture keeps this under canonical quantity/UOM calculation:

```text
length per bar x number of bars -> priced quantity when selling UOM is length
```

No shared code should identify rail by Vietnamese string matching as a permanent business rule. Item/measurement metadata must expose the relevant sales quantity mode.

### BC-LINEAR-02 — Trục sells by width/length basis

**Status:** CURRENT-CODE / TARGET

The product-specific geometry determines the linear quantity; price resolution then consumes the resulting priced quantity. Geometry and pricing remain separate.

---

## 7. Discount

### BC-DISC-01 — Current 15% door policy

**Status:** CURRENT-CODE, NOT TARGET AUTHORITY

Current Sales controller contains an AlumDoor-specific expected-discount policy, historically treating selected door Items as 15% and other Items such as rail/shaft as 0% unless approved.

Target migration:

```text
Pricing Rule record(s)
  -> conditions based on stable Item/Item Group/customer facts
  -> DISCOUNT_PERCENT effect
```

The amount is calculated server-side.

Required removal:

- no shared controller function that knows `door = 15%`;
- no permanent string-based rail/shaft classification for discount.

### BC-DISC-02 — UI shows discount money, not necessarily percentage

**Status:** CONFIRMED UX direction

Operator-facing line projection should support:

```text
Tiền CK
```

while hidden/audit snapshot retains:

- rule source;
- percentage or fixed amount effect;
- discount basis rate/amount;
- final discount amount.

### BC-DISC-03 — Discount basis can differ from selling variant

**Status:** TARGET / proven by prototype use case

The architecture must support a line sold at one price variant while discount is calculated from another configured/baseline basis when the business policy requires it.

This relationship must be explicit and snapshotted; it must not be inferred from names such as `Có ray`.

---

## 8. Surcharge / commercial adjustment

### BC-ADJ-01 — Wood-grain finish

**Status:** CURRENT PROTOTYPE CONCEPT; amount/business applicability requires configured data

Target:

```text
finish fact = WOOD_GRAIN
Pricing Rule -> ADJUSTMENT / AREA_SQM
```

The checkbox/select on the form only changes the product/finish fact. It does not contain the amount formula.

### BC-ADJ-02 — Special rail color

**Status:** CURRENT PROTOTYPE CONCEPT

Target:

```text
configured rail/product facts + finish/color fact
Pricing Rule -> ADJUSTMENT / LENGTH_M
```

### BC-ADJ-03 — Powder coating / profile-specific surcharge

**Status:** CURRENT PROTOTYPE CONCEPT

Target:

```text
profile/product facts + finish process fact
Pricing Rule -> ADJUSTMENT / LENGTH_M or configured basis
```

### BC-ADJ-04 — Fixed transport/service surcharge

**Status:** CANDIDATE / unresolved scope

If business confirms a fixed transport charge, its scope must be explicit:

```text
LINE or ORDER
```

Do not guess whether the charge is per line, per order, per delivery or per trip. An unresolved scope fails closed in configuration/tests.

---

## 9. Quotation -> Sales Order

### BC-QUOTE-01 — Copy geometry snapshot

**Status:** CURRENT-CODE / correct direction

Current conversion already copies many formula facts and versions from Quotation to Sales Order. Preserve this behavior.

### BC-QUOTE-02 — Accepted price must freeze

**Status:** TARGET

Once quotation is customer-agreed/accepted:

- do not automatically resolve today's Item Price/Pricing Rule during conversion;
- copy the accepted commercial snapshot;
- explicit authorized `Reprice` is the only path to current policy.

Required audit for Reprice:

```text
reason
actor
timestamp
before snapshot
after snapshot
source rules/prices
```

---

## 10. Delivery / partial fulfillment

### BC-FUL-01 — Same Item on multiple order rows

**Status:** TARGET / current metadata already anticipates it

Two lines may share the same `item_code` but differ in:

- color;
- dimensions;
- option;
- package revision;
- warehouse.

Therefore delivery/billing state must use `sales_order_line_key`, not only Item code.

### BC-FUL-02 — Package fulfillment

**Status:** TARGET

A customer-facing commercial parent may expand into physical components for stock delivery.

Example concept:

```text
Commercial: Australian door full set x1
Physical:
  door x1
  rail x derived qty
  shaft x derived qty
  motor x1
  accessories x configured qty
```

Delivery decrements physical components. Revenue remains on the commercial parent unless components are independently sold/priced.

### BC-FUL-03 — Partial delivery

**Status:** TARGET

The system must reconcile remaining physical component obligations and commercial line progress without double-counting components or treating one repeated Item row as another.

---

## 11. Manufacturing

### BC-MFG-01 — Sales bundle is not BOM

**Status:** CONFIRMED ARCHITECTURE

A rail delivered beside a door is a Sales Package component unless it is physically consumed to manufacture the door.

### BC-MFG-02 — Manufacturable package component

**Status:** TARGET

If a package component is itself manufacturable:

```text
Sales Package component
  -> demand classification
  -> Work/Production Order
  -> component Item's BOM
```

Sales Package does not copy BOM rows.

---

## 12. Return / warranty / COGS

### BC-RET-01 — Return exact component

**Status:** TARGET

Return reverses the actually delivered source-line/package-component obligation. It does not expand the current Sales Package version again.

### BC-WAR-01 — Warranty trace

**Status:** TARGET

Warranty must be able to trace:

```text
Sales Order line
-> Delivery
-> actual physical component
-> production/purchase provenance when available
```

### BC-COGS-01 — Package margin

**Status:** TARGET

For a package sold as one commercial line:

```text
Revenue = commercial parent
COGS = sum(actual delivered physical component valuation)
Margin = Revenue - COGS
```

---

## 13. Quantity invariants

Every dimensional case must explicitly identify all four quantities:

| Quantity | Used by | Example concern |
| --- | --- | --- |
| `billable/priced_qty` | pricing/revenue | m² after commercial measurement policy |
| `physical_fulfillment_qty` | delivery obligation | rail length, door count, motor count |
| `production_qty` | manufacturing | number/area of finished goods to produce |
| `stock_qty` | stock ledger | canonical stock-UOM quantity |

A test must fail if customer-group pricing geometry changes physical stock output without an explicit business rule that justifies it.

## 14. Minimal operator UX target

Primary Sales Order row columns:

```text
Mặt hàng
Phương án bán
Rộng
Cao
Số bộ
SL tính tiền
Đơn giá
Tiền CK
Phụ thu
Thành tiền
```

Advanced/internal snapshot fields are hidden or expandable:

```text
sales_mode
price_variant
item_price
pricing_rule snapshot
discount basis
sales_package + revision/checksum
formula policy + version
stock/production quantities
```

The operator must not manually keep these hidden fields consistent.

## 15. Acceptance rule for new AlumDoor cases

A new sales requirement may be implemented without a new engine only if it can be classified as one of:

- geometry/quantity fact -> Cutting/Measurement Policy;
- base rate -> Item Price;
- conditional money effect -> Pricing Rule;
- user-selectable product commercial configuration -> Sales Option;
- physical delivery composition -> Sales Package;
- manufacturing consumption -> BOM.

If a requirement does not fit, document the gap before adding a new authority. Do not create a new DocType merely because a screen needs another field.
