import test from "node:test";
import assert from "node:assert/strict";
import { resolveSalesOption } from "../dist/packages/clouderp-selling/src/sales-option-resolver.js";

function ctx(options, versions = {}) {
  return { command: { tenant_id: "demo" }, reader: {
    async listMasterRecordData(_tenant, doctype) { return doctype === "Sales Option" ? options : []; },
    async getDocument(_tenant, doctype, name) { return doctype === "Sales Option" && versions[name] ? { name, version: versions[name], data: options.find((x) => x.name === name)?.data ?? {} } : null; },
  }};
}
const item = { item_group: "DOOR" };

test("requested option derives technical variants and sales mode", async () => {
  const options = [{ name: "OPT-RAIL", data: { option_code: "WITH_RAIL", option_label: "Visible Label", item_group: "DOOR", price_variant: "WITH_RAIL", discount_basis_variant: "STANDARD", sales_mode: "FULL", priority: 10 } }];
  const result = await resolveSalesOption(ctx(options, { "OPT-RAIL": 6 }), { itemCode: "I-1", itemMaster: item, facts: {}, requestedOption: "OPT-RAIL" });
  assert.equal(result.price_variant, "WITH_RAIL");
  assert.equal(result.discount_basis_variant, "STANDARD");
  assert.equal(result.sales_mode, "FULL");
  assert.equal(result.option_version, 6);
});

test("legacy sales_mode maps only when exactly one option matches", async () => {
  const options = [{ name: "FULL", data: { option_code: "FULL", option_label: "Full", item_group: "DOOR", sales_mode: "Trọn bộ", price_variant: "STANDARD" } }];
  const result = await resolveSalesOption(ctx(options), { itemCode: "I-1", itemMaster: item, facts: {}, legacySalesMode: "Trọn bộ" });
  assert.equal(result.sales_option, "FULL");
});

test("configured item with ambiguous no selection fails instead of guessing", async () => {
  const options = ["A", "B"].map((name) => ({ name, data: { option_code: name, option_label: name, item_group: "DOOR", price_variant: "STANDARD" } }));
  await assert.rejects(() => resolveSalesOption(ctx(options), { itemCode: "I-1", itemMaster: item, facts: {} }), /Phương án bán là bắt buộc/);
});

test("items without configured options remain STANDARD-compatible", async () => {
  const result = await resolveSalesOption(ctx([]), { itemCode: "I-1", itemMaster: item, facts: {}, legacySalesMode: "legacy" });
  assert.equal(result.price_variant, "STANDARD");
  assert.equal(result.discount_basis_variant, "STANDARD");
  assert.equal(result.sales_mode, "legacy");
});
