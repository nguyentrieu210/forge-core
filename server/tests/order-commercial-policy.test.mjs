import test from "node:test";
import assert from "node:assert/strict";
import {
  applyOrderCommercialPricingPolicy,
  resolveOrderCommercialPricingPolicy,
} from "../dist/packages/clouderp-selling/src/order-commercial-policy.js";

const RULE = {
  name: "PHỤ THU CỬA NHỎ <8M2",
  data: {
    rule_level: "ORDER",
    effect_type: "ORDER_ADJUSTMENT",
    price_list: "Bảng giá 31/07/2026",
    pricing_scope: "CỬA NHỎ ÁP DỤNG PHỤ THU",
    aggregate_function: "SUM",
    aggregate_field: "billable_area_sqm",
    aggregate_operator: "lt",
    aggregate_value: 8,
    adjustment_basis: "FIXED",
    adjustment_rate: 300000,
    taxable: true,
    discountable: false,
    priority: 100,
  },
};

function context() {
  const items = {
    "DUC-1": { item_group: "Cửa CN Đức" },
    "DUC-2": { item_group: "Cửa CN Đức" },
    "LUOI-1": { item_group: "Cửa Lưới" },
    "MOTOR-1": { item_group: "Motor" },
  };
  return {
    command: { tenant_id: "demo" },
    reader: {
      async listMasterRecordData(_tenant, doctype) {
        return doctype === "Pricing Rule" ? [RULE] : [];
      },
      async getMasterRecordData(_tenant, doctype, name) {
        if (doctype === "Item") return items[name] ?? null;
        if (doctype === "Pricing Scope" && name === "CỬA NHỎ ÁP DỤNG PHỤ THU") {
          return { members: [
            { member_type: "Item Group", item_group: "Cửa CN Đức" },
            { member_type: "Item Group", item_group: "Cửa Lưới" },
          ] };
        }
        return null;
      },
      async getDocument(_tenant, doctype, name) {
        return doctype === "Pricing Rule" && name === RULE.name ? { name, version: 9, data: RULE.data } : null;
      },
    },
  };
}

function line(item_code, billable_area_sqm) {
  return { row_id: item_code, item_code, qty: billable_area_sqm, rate: 1_000_000, billable_area_sqm };
}

function order(items, overrides = {}) {
  return {
    customer: "KH-1",
    customer_group: "Đại lý",
    company: "ALUMDOOR",
    currency: "VND",
    currency_scale: 0,
    company_currency: "VND",
    company_currency_scale: 0,
    conversion_rate: "1.000000",
    conversion_rate_micros: 1_000_000,
    transaction_date: "2026-08-12",
    selling_price_list: "Bảng giá 31/07/2026",
    items,
    taxes: [],
    net_total: "7000000",
    net_total_minor: 7_000_000,
    total_taxes_and_charges: "0",
    total_taxes_and_charges_minor: 0,
    grand_total: "7000000",
    grand_total_minor: 7_000_000,
    rounded_total: "7000000",
    rounded_total_minor: 7_000_000,
    rounding_adjustment: "0",
    rounding_adjustment_minor: 0,
    discount_amount: "0",
    discount_amount_minor: 0,
    surcharge_amount: "0",
    surcharge_amount_minor: 0,
    base_net_total: "7000000",
    base_net_total_minor: 7_000_000,
    base_total_taxes_and_charges: "0",
    base_total_taxes_and_charges_minor: 0,
    base_grand_total: "7000000",
    base_grand_total_minor: 7_000_000,
    ...overrides,
  };
}

test("two eligible rows of 4 m2 each aggregate to 8 m2 and waive freight", async () => {
  const result = await resolveOrderCommercialPricingPolicy(context(), order([line("DUC-1", 4), line("DUC-2", 4)]));
  assert.deepEqual(result, []);
});

test("eligible rows aggregate below 8 m2 and charge 300000 once for the order", async () => {
  const result = await resolveOrderCommercialPricingPolicy(context(), order([line("DUC-1", 3), line("LUOI-1", 4)]));
  assert.equal(result.length, 1);
  assert.equal(result[0].aggregate_value, 7);
  assert.equal(result[0].eligible_line_count, 2);
  assert.equal(result[0].amount_minor, 300000);
  assert.equal(result[0].rule_version, 9);
});

test("unrelated rows do not trigger an empty-scope less-than threshold", async () => {
  const result = await resolveOrderCommercialPricingPolicy(context(), order([line("MOTOR-1", 2)]));
  assert.deepEqual(result, []);
});

test("header freight remains outside line money and increases Alumdoor VAT once", async () => {
  const base = order([line("DUC-1", 3), line("LUOI-1", 4)], {
    vat_rate: 10,
    vat_base_amount: "7000000",
    vat_amount: "700000",
    vat_amount_minor: 700000,
    total_amount: "7000000",
    grand_total: "7700000",
    grand_total_minor: 7_700_000,
    rounded_total: "7700000",
    rounded_total_minor: 7_700_000,
    base_grand_total: "7700000",
    base_grand_total_minor: 7_700_000,
  });
  const result = await applyOrderCommercialPricingPolicy(context(), base);
  assert.equal(result.order_adjustment_amount_minor, 300000);
  assert.equal(result.surcharge_amount_minor, 300000);
  assert.equal(result.net_total_minor, 7_000_000, "header freight must not contaminate line net total");
  assert.equal(result.vat_base_amount, "7300000");
  assert.equal(result.vat_amount, "730000");
  assert.equal(result.grand_total_minor, 8_030_000);
  assert.equal(result.items[0].net_amount_minor, undefined, "order freight is not allocated back into an arbitrary line");
});

test("canonical On Net Total tax receives the taxable order charge", async () => {
  const taxes = [{
    row_id: "VAT", account: "VAT-OUT", rate: 10, charge_type: "On Net Total", add_deduct_tax: "Add",
    tax_amount: "700000", tax_amount_minor: 700000, total: "7700000", total_minor: 7_700_000,
  }];
  const base = order([line("DUC-1", 3), line("LUOI-1", 4)], {
    taxes,
    total_taxes_and_charges: "700000",
    total_taxes_and_charges_minor: 700000,
    grand_total: "7700000",
    grand_total_minor: 7_700_000,
    rounded_total: "7700000",
    rounded_total_minor: 7_700_000,
    base_total_taxes_and_charges: "700000",
    base_total_taxes_and_charges_minor: 700000,
    base_grand_total: "7700000",
    base_grand_total_minor: 7_700_000,
  });
  const result = await applyOrderCommercialPricingPolicy(context(), base);
  assert.equal(result.taxes[0].tax_amount_minor, 730000);
  assert.equal(result.total_taxes_and_charges_minor, 730000);
  assert.equal(result.grand_total_minor, 8_030_000);
});
