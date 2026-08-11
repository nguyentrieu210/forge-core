import test from "node:test";
import assert from "node:assert/strict";
import { STANDARD_PRICE_VARIANT, normalizePriceVariant, resolveServerPrice } from "../dist/packages/clouderp-pricing/src/index.js";

function priceRow(name, overrides = {}) {
  return { name, price_list: "BANG-GIA", item_code: "ITEM-1", uom: "m2", currency: "VND", rate: "1626000", disabled: 0, ...overrides };
}
function pricingContext(itemPrices, pricingRules = []) {
  return { command: { tenant_id: "demo" }, reader: {
    async getMasterRecordData(_tenant, doctype, name) {
      if (doctype === "Currency" && name === "VND") return { currency_scale: 0 };
      if (doctype === "Item Price") return itemPrices.find((entry) => entry.name === name)?.data ?? null;
      return null;
    },
    async listMasterRecordData(_tenant, doctype) {
      if (doctype === "Item Price") return itemPrices;
      if (doctype === "Pricing Rule") return pricingRules;
      return [];
    },
  }};
}
const listed = (...rows) => rows.map((data) => ({ name: data.name, data }));
const request = (overrides = {}) => ({ itemCode: "ITEM-1", qtyMicros: 1_000_000, postingDate: "2026-08-11", priceList: "BANG-GIA", documentCurrency: "VND", uom: "m2", partyType: "Customer", party: "KH-1", ...overrides });

test("legacy Item Price without price_variant remains canonical STANDARD", async () => {
  const result = await resolveServerPrice(pricingContext(listed(priceRow("IP-STANDARD"))), request());
  assert.equal(result.price_variant, STANDARD_PRICE_VARIANT);
  assert.equal(result.item_price, "IP-STANDARD");
  assert.equal(result.rate, "1626000");
});

test("same Price List + Item + UOM carries independent variants", async () => {
  const rows = listed(priceRow("IP-STANDARD"), priceRow("IP-WITH-RAIL", { price_variant: "WITH_RAIL", rate: "1701000" }));
  const standard = await resolveServerPrice(pricingContext(rows), request());
  const withRail = await resolveServerPrice(pricingContext(rows), request({ priceVariant: "WITH_RAIL" }));
  assert.equal(standard.rate, "1626000");
  assert.equal(withRail.rate, "1701000");
  assert.equal(withRail.price_variant, "WITH_RAIL");
});

test("non-standard requested variant never falls back to STANDARD", async () => {
  await assert.rejects(resolveServerPrice(pricingContext(listed(priceRow("IP-STANDARD"))), request({ priceVariant: "WITH_RAIL" })), /does not exist for variant WITH_RAIL/);
});

test("duplicate active records fail closed inside one variant", async () => {
  const rows = listed(priceRow("R1", { price_variant: "WITH_RAIL" }), priceRow("R2", { price_variant: "WITH_RAIL" }), priceRow("S"));
  await assert.rejects(resolveServerPrice(pricingContext(rows), request({ priceVariant: "WITH_RAIL" })), /Multiple active Item Price records match/);
  assert.equal((await resolveServerPrice(pricingContext(rows), request())).item_price, "S");
});

test("legacy pricing-rule mutation remains optional for commercial composition", async () => {
  const prices = listed(priceRow("IP-STANDARD"));
  const rules = listed({ name: "RULE-15", price_list: "BANG-GIA", item_code: "ITEM-1", discount_percentage: 15, priority: 10, disabled: 0 });
  const legacy = await resolveServerPrice(pricingContext(prices, rules), request());
  const raw = await resolveServerPrice(pricingContext(prices, rules), request({ applyPricingRules: false }));
  assert.equal(legacy.rate_minor, 1382100);
  assert.equal(raw.rate_minor, 1626000);
  assert.equal(raw.pricing_rule, undefined);
});

test("variant identifiers are canonical technical codes", () => {
  assert.equal(normalizePriceVariant(undefined), "STANDARD");
  assert.equal(normalizePriceVariant("with_rail"), "WITH_RAIL");
  assert.throws(() => normalizePriceVariant("Có ray"), /variant must use/);
});
