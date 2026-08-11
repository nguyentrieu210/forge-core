import test from "node:test";
import assert from "node:assert/strict";
import { resolveCommercialLine } from "../dist/packages/clouderp-selling/src/commercial-line-resolver.js";

function context() {
  const itemPrices = [
    { name: "RETAIL:DOOR-1:m2", data: { price_list: "RETAIL", item_code: "DOOR-1", uom: "m2", currency: "VND", rate: 1_626_000, disabled: 0 } },
    { name: "RETAIL:DOOR-1:m2:WITH_RAIL", data: { price_list: "RETAIL", item_code: "DOOR-1", uom: "m2", price_variant: "WITH_RAIL", currency: "VND", rate: 1_701_000, disabled: 0 } },
  ];
  const rules = [{ name: "DISC-15", data: { price_list: "RETAIL", item_code: "DOOR-1", discount_percentage: 15, priority: 10 } }];
  return { command: { tenant_id: "demo" }, reader: {
    async getMasterRecordData(_tenant, doctype, name) {
      if (doctype === "Currency" && name === "VND") return { currency_scale: 0 };
      if (doctype === "Item Price") return itemPrices.find((row) => row.name === name)?.data ?? null;
      return null;
    },
    async listMasterRecordData(_tenant, doctype) {
      if (doctype === "Item Price") return itemPrices;
      if (doctype === "Pricing Rule") return rules;
      return [];
    },
    async getDocument() { return null; },
  }};
}

test("WITH_RAIL may sell at its own rate while discount basis remains STANDARD", async () => {
  const line = await resolveCommercialLine(context(), {
    itemCode: "DOOR-1",
    priceList: "RETAIL",
    documentCurrency: "VND",
    postingDate: "2026-08-11",
    uom: "m2",
    priceVariant: "WITH_RAIL",
    discountBasisVariant: "STANDARD",
    pricedQty: 10,
    partyType: "Customer",
    party: "KH-1",
    customerGroup: "Lẻ",
    facts: {},
  });
  assert.equal(line.price_variant, "WITH_RAIL");
  assert.equal(line.selling_rate_minor, 1_701_000);
  assert.equal(line.discount_basis_variant, "STANDARD");
  assert.equal(line.discount_basis_rate_minor, 1_626_000);
  assert.equal(line.gross_amount_minor, 17_010_000);
  assert.equal(line.discount_amount_minor, 2_439_000);
  assert.equal(line.net_before_tax_minor, 14_571_000);
});
