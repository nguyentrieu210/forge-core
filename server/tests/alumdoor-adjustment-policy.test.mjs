import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  alumdoorExperimentalAdjustmentRules,
  calculateCommercialLine,
  evaluateSalesAdjustmentRules,
  resolveAustralianBillingMode,
} from "../dist/packages/clouderp-selling/src/adjustment-policy.js";

const audit = JSON.parse(fs.readFileSync(new URL("../imports/alumdoor-full-2026-07-28.audit.json", import.meta.url), "utf8"));
const rules = alumdoorExperimentalAdjustmentRules(0);

function evaluate(facts, quantities = {}) {
  return evaluateSalesAdjustmentRules({ facts: { ...facts, ...quantities }, ...quantities }, rules);
}

test("real Alumdoor import remains the pricing-policy source fixture", () => {
  assert.equal(audit.imported_items, 277);
  assert.equal(audit.imported_list_prices, 275);
  assert.equal(audit.imported_rail_prices, 17);
  assert.equal(audit.rail_gift_rows_preserved_in_description.length, 17);
  assert.equal(audit.micro_surcharge_rows_preserved_in_description.length, 8);
  assert.equal(audit.excluded_price_adjustments.length, 9);
  assert.ok(audit.rail_gift_rows_preserved_in_description.includes("TP-TD-AL752N"));
  assert.ok(audit.micro_surcharge_rows_preserved_in_description.some((row) => row.item_code === "TP-UC KT 4D" && row.amount === 1_800_000));
  assert.ok(audit.excluded_price_adjustments.some((row) => row.source_code === "TRU-TP_KHONGLAC_JG" && row.amount === -350_000));
});

test("Cua Duc gift-rail sale keeps 15 percent discount on no-gift basis", () => {
  const realGiftEligibleItem = "TP-TD-AL752N";
  assert.ok(audit.rail_gift_rows_preserved_in_description.includes(realGiftEligibleItem));
  const result = calculateCommercialLine({
    priced_qty: 10,
    selling_rate_minor: 1_800_000,
    discount_basis_rate_minor: 1_600_000,
    discount_percentage: 15,
  });
  assert.equal(result.gross_amount_minor, 18_000_000);
  assert.equal(result.discount_basis_amount_minor, 16_000_000);
  assert.equal(result.discount_amount_minor, 2_400_000);
  assert.equal(result.net_before_tax_minor, 15_600_000);
});

test("wood-grain door surcharge is 465000 VND per square metre", () => {
  const result = evaluate({ door_type: "Cửa Úc", finish_class: "WOOD_GRAIN", area_per_set_sqm: 5.2 }, { area_sqm: 5.2, set_count: 1 });
  const woodgrain = result.applied.find((row) => row.rule_code === "WOOD_GRAIN_DOOR");
  assert.ok(woodgrain);
  assert.equal(woodgrain.amount_minor, 2_418_000);
});

test("Australian door over 4 and under 7 adds 300000 VND per set", () => {
  const result = evaluate({ door_type: "Cửa Úc", area_per_set_sqm: 5.2 }, { area_sqm: 10.4, set_count: 2 });
  const size = result.applied.find((row) => row.rule_code === "AU_MEDIUM_SET");
  assert.ok(size);
  assert.equal(size.amount_minor, 600_000);
  assert.equal(resolveAustralianBillingMode(5.2), "PER_M2");
});

test("Australian door below 4 square metres switches to per-set billing", () => {
  assert.equal(resolveAustralianBillingMode(3.999999), "PER_SET");
  assert.equal(resolveAustralianBillingMode(4), "UNRESOLVED_BOUNDARY");
  assert.equal(resolveAustralianBillingMode(4.000001), "PER_M2");
});

test("wood-grain rail charges 55000 per metre without also charging other-color rule", () => {
  const result = evaluate({ rail_type: "RAY_HOP_TD", finish_class: "WOOD_GRAIN" }, { length_m: 6 });
  assert.deepEqual(result.applied.map((row) => row.rule_code), ["RAIL_WOOD_GRAIN"]);
  assert.equal(result.applied[0].amount_minor, 330_000);
});

test("other-color rail charges 15000 per metre", () => {
  const result = evaluate({ rail_type: "RAY_HOP_TD_U100", finish_class: "OTHER_COLOR" }, { length_m: 6 });
  assert.deepEqual(result.applied.map((row) => row.rule_code), ["RAIL_OTHER_COLOR"]);
  assert.equal(result.applied[0].amount_minor, 90_000);
});

test("V4/V5 powder surcharge can stack with a separate rail finish group", () => {
  const result = evaluate({
    rail_type: "RAY_DON_TD",
    finish_class: "WOOD_GRAIN",
    profile_series: "V5",
    powder_coated: true,
  }, { length_m: 6 });
  assert.deepEqual(result.applied.map((row) => row.rule_code), ["RAIL_WOOD_GRAIN", "V4_V5_POWDER"]);
  assert.equal(result.applied.reduce((sum, row) => sum + row.amount_minor, 0), 420_000);
});

test("small-door transport is deliberately unresolved until charge scope is confirmed", () => {
  const result = evaluate({ door_type: "Cửa Đức", area_per_set_sqm: 7.5 }, { area_sqm: 7.5, set_count: 1 });
  assert.ok(result.unresolved_rules.includes("SMALL_DOOR_TRANSPORT"));
  assert.equal(result.applied.some((row) => row.rule_code === "SMALL_DOOR_TRANSPORT"), false);
});

test("surcharges are excluded from the discount basis but included in line net", () => {
  const adjustments = evaluate({ door_type: "Cửa Úc", finish_class: "WOOD_GRAIN", area_per_set_sqm: 5.2 }, { area_sqm: 5.2, set_count: 1 }).applied;
  const result = calculateCommercialLine({
    priced_qty: 5.2,
    selling_rate_minor: 1_000_000,
    discount_basis_rate_minor: 1_000_000,
    discount_percentage: 15,
    adjustments,
  });
  assert.equal(result.gross_amount_minor, 5_200_000);
  assert.equal(result.discount_amount_minor, 780_000);
  assert.equal(result.surcharge_amount_minor, 2_718_000); // 465k/m2 + 300k/set for Cua Uc 4-7.
  assert.equal(result.net_before_tax_minor, 7_138_000);
});
