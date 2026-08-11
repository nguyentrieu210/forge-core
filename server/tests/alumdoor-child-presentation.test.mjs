import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { compileBrief } from "../scripts/lib/compile-brief.mjs";
import { attachBriefUiViewPolicies } from "../scripts/lib/brief-ui-view-policy.mjs";
import {
  applyAlumdoorChildPresentation,
  alumdoorGoldenChildGridPolicies,
} from "../scripts/lib/alumdoor-child-presentation.mjs";

function sourceBrief() {
  return JSON.parse(fs.readFileSync(new URL("../briefs/alumdoor-v2.json", import.meta.url), "utf8"));
}

function compileWithUiPolicies(brief) {
  return attachBriefUiViewPolicies(brief, compileBrief(brief));
}

function compiledDoctype(pkg, name) {
  const value = pkg.doctypes.find((doctype) => doctype.name === name);
  assert.ok(value, `missing compiled ${name}`);
  return value;
}

function names(view) {
  return view?.columns ?? view?.fields ?? [];
}

test("presentation helper migrates every Alumdoor child DocType without changing field order", () => {
  const brief = sourceBrief();
  const before = new Map(brief.doctypes.filter((dt) => dt.child === true).map((dt) => [dt.name, dt.fields.map((field) => typeof field === "string" ? field.split(":")[0].trim() : field.fieldname)]));
  const result = applyAlumdoorChildPresentation(brief);
  assert.equal(result.migrated, 28);
  assert.equal(result.doctypes.length, 28);
  for (const dt of brief.doctypes.filter((value) => value.child === true)) {
    assert.deepEqual(dt.fields.map((field) => field.fieldname), before.get(dt.name), `${dt.name} field order changed`);
    assert.ok(dt.fields.every((field) => ["quick", "expanded", "internal"].includes(field.surface)), `${dt.name} has missing surface`);
    assert.ok(Array.isArray(dt.form?.fields) && dt.form.fields.length > 0, `${dt.name} missing authored form fields`);
    assert.ok(Array.isArray(dt.quickEntry?.fields) && dt.quickEntry.fields.length > 0, `${dt.name} missing authored quick-entry fields`);
  }
});

test("golden Sales and Purchase compact/full policies survive canonical UI-policy attachment", () => {
  const brief = sourceBrief();
  applyAlumdoorChildPresentation(brief);
  const pkg = compileWithUiPolicies(brief);

  const sales = compiledDoctype(pkg, "Sales Order Item");
  assert.equal(sales.viewPolicy.form.enabled, true);
  assert.equal(sales.viewPolicy.quickEntry.enabled, true);
  assert.deepEqual(names(sales.viewPolicy.quickEntry), alumdoorGoldenChildGridPolicies.salesCompact.filter((fieldname) => sales.fields.some((field) => field.fieldname === fieldname && field.surface !== "internal")));
  assert.deepEqual(names(sales.viewPolicy.form), alumdoorGoldenChildGridPolicies.salesFull.filter((fieldname) => sales.fields.some((field) => field.fieldname === fieldname)));

  const po = compiledDoctype(pkg, "Purchase Order Item");
  assert.deepEqual(names(po.viewPolicy.quickEntry), alumdoorGoldenChildGridPolicies.purchaseCompact.filter((fieldname) => po.fields.some((field) => field.fieldname === fieldname)));
  assert.deepEqual(names(po.viewPolicy.form), alumdoorGoldenChildGridPolicies.purchaseOrderFull.filter((fieldname) => po.fields.some((field) => field.fieldname === fieldname)));

  const receipt = compiledDoctype(pkg, "Purchase Receipt Item");
  assert.deepEqual(names(receipt.viewPolicy.quickEntry), alumdoorGoldenChildGridPolicies.purchaseCompact.filter((fieldname) => receipt.fields.some((field) => field.fieldname === fieldname)));
  assert.deepEqual(names(receipt.viewPolicy.form), alumdoorGoldenChildGridPolicies.purchaseReceiptFull.filter((fieldname) => receipt.fields.some((field) => field.fieldname === fieldname)));
});

test("all 28 child doctypes explicitly own form and quick-entry presentation after attachment", () => {
  const brief = sourceBrief();
  applyAlumdoorChildPresentation(brief);
  const pkg = compileWithUiPolicies(brief);
  const children = pkg.doctypes.filter((doctype) => doctype.is_child === true);
  assert.equal(children.length, 28);
  const missing = children
    .filter((doctype) => !doctype.viewPolicy?.form?.enabled || !doctype.viewPolicy?.quickEntry?.enabled)
    .map((doctype) => doctype.name);
  assert.deepEqual(missing, [], `children without explicit presentation ownership: ${missing.join(", ")}`);
});
