import test from "node:test";
import assert from "node:assert/strict";
import { resolveCommercialPricingPolicy } from "../dist/packages/clouderp-pricing/src/commercial-policy.js";

function context(rules, versions = {}, scopes = {}) {
  return {
    command: { tenant_id: "demo" },
    reader: {
      async listMasterRecordData(_tenant, doctype) {
        return doctype === "Pricing Rule" ? rules : [];
      },
      async getDocument(_tenant, doctype, name) {
        if (doctype !== "Pricing Rule" || versions[name] === undefined) return null;
        return { name, version: versions[name], data: rules.find((row) => row.name === name)?.data ?? {} };
      },
      async getMasterRecordData(_tenant, doctype, name) {
        if (doctype !== "Pricing Scope") return null;
        return scopes[name] ?? null;
      },
    },
  };
}

const baseInput = {
  itemCode: "DOOR-1",
  priceList: "DEALER",
  postingDate: "2026-08-11",
  currency: "VND",
  currencyScale: 0,
  qtyMicros: 10_000_000,
  pricedQtyMicros: 10_000_000,
  partyType: "Customer",
  party: "KH-1",
  customerGroup: "Đại lý",
  facts: {
    item_group: "Cửa CN Đức",
    finish_class: "WOOD_GRAIN",
    billable_area_sqm: 5.2,
  },
  areaSqm: 5.2,
  setCount: 1,
};

test("Pricing Rule is the single source for discount and adjustment effects", async () => {
  const rules = [
    {
      name: "RULE-DISCOUNT",
      data: {
        price_list: "DEALER",
        customer_group: "Đại lý",
        item_group: "Cửa CN Đức",
        discount_percentage: 15,
        priority: 100,
      },
    },
    {
      name: "RULE-WOOD",
      data: {
        effect_type: "ADJUSTMENT",
        adjustment_basis: "AREA_SQM",
        adjustment_rate: 465000,
        exclusive_group: "FINISH",
        priority: 100,
        conditions: [{ field: "finish_class", operator: "eq", value: "WOOD_GRAIN" }],
        taxable: true,
      },
    },
  ];

  const result = await resolveCommercialPricingPolicy(context(rules, {
    "RULE-DISCOUNT": 4,
    "RULE-WOOD": 7,
  }), baseInput);

  assert.equal(result.discount_percentage, "15.000000");
  assert.equal(result.adjustments.length, 1);
  assert.equal(result.adjustments[0].amount_minor, 2_418_000);
  assert.equal(result.adjustments[0].rule_version, 7);
  assert.equal(result.snapshots.find((row) => row.rule_name === "RULE-DISCOUNT")?.rule_version, 4);
});

test("equal-priority equally-specific discount rules fail closed", async () => {
  const rules = ["A", "B"].map((name) => ({
    name,
    data: { price_list: "DEALER", customer_group: "Đại lý", discount_percentage: 15, priority: 10 },
  }));
  await assert.rejects(
    () => resolveCommercialPricingPolicy(context(rules), baseInput),
    /Multiple Pricing Rules tie for discount/,
  );
});

test("exclusive adjustment group chooses the deterministic higher priority rule", async () => {
  const rules = [
    { name: "LOW", data: { effect_type: "ADJUSTMENT", adjustment_basis: "FIXED", adjustment_rate: 100000, exclusive_group: "X", priority: 1 } },
    { name: "HIGH", data: { effect_type: "ADJUSTMENT", adjustment_basis: "FIXED", adjustment_rate: 300000, exclusive_group: "X", priority: 2 } },
  ];
  const result = await resolveCommercialPricingPolicy(context(rules), baseInput);
  assert.deepEqual(result.adjustments.map((row) => row.rule_name), ["HIGH"]);
  assert.equal(result.adjustments[0].amount_minor, 300000);
});

test("a pricing scope matches its item groups and safely rejects an inactive scope", async () => {
  const rules = [
    { name: "WOOD-GRAIN", data: { effect_type: "ADJUSTMENT", adjustment_basis: "AREA_SQM", adjustment_rate: 465000, pricing_scope: "DOOR-WOOD" } },
    { name: "INACTIVE", data: { effect_type: "ADJUSTMENT", adjustment_basis: "FIXED", adjustment_rate: 1, pricing_scope: "INACTIVE-SCOPE" } },
  ];
  const result = await resolveCommercialPricingPolicy(context(rules, {}, {
    "DOOR-WOOD": { members: [{ member_type: "Item Group", item_group: "Cửa CN Đức" }] },
    "INACTIVE-SCOPE": { disabled: true, members: [{ member_type: "Item", item_code: "DOOR-1" }] },
  }), baseInput);
  assert.deepEqual(result.adjustments.map((row) => row.rule_name), ["WOOD-GRAIN"]);
  assert.equal(result.adjustments[0].amount_minor, 2_418_000);
});
