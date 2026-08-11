import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { compileBrief } from "../scripts/lib/compile-brief.mjs";
import {
  applyAlumdoorChildPresentation,
  alumdoorGoldenChildGridPolicies,
} from "../scripts/lib/alumdoor-child-presentation.mjs";

function sourceBrief() {
  return JSON.parse(fs.readFileSync(new URL("../briefs/alumdoor-v2.json", import.meta.url), "utf8"));
}

function compiledDoctype(pkg, name) {
  const value = pkg.doctypes.find((doctype) => doctype.name === name);
  assert.ok(value, `missing compiled ${name}`);
  return value;
}

function names(view) {
  return view?.columns ?? view?.fields ?? [];
}

function explicitOverride(field) {
  const layout = ["Heading", "Section Break", "Column Break", "HTML", "Tab Break", "Fold", "Button"].includes(field.fieldtype);
  const derived = field.hidden
    ? "internal"
    : !layout && field.required && !field.read_only
      ? "quick"
      : "expanded";
  return field.surface !== derived;
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
  }
});

test("golden Sales and Purchase compact/full policies survive compilation", () => {
  const brief = sourceBrief();
  applyAlumdoorChildPresentation(brief);
  const pkg = compileBrief(brief);

  const sales = compiledDoctype(pkg, "Sales Order Item");
  assert.deepEqual(names(sales.viewPolicy.quickEntry), alumdoorGoldenChildGridPolicies.salesCompact.filter((fieldname) => sales.fields.some((field) => field.fieldname === fieldname && field.surface !== "internal")));
  assert.deepEqual(names(sales.viewPolicy.form), alumdoorGoldenChildGridPolicies.salesFull.filter((fieldname) => sales.fields.some((field) => field.fieldname === fieldname)));

  const po = compiledDoctype(pkg, "Purchase Order Item");
  assert.deepEqual(names(po.viewPolicy.quickEntry), alumdoorGoldenChildGridPolicies.purchaseCompact.filter((fieldname) => po.fields.some((field) => field.fieldname === fieldname)));
  assert.deepEqual(names(po.viewPolicy.form), alumdoorGoldenChildGridPolicies.purchaseOrderFull.filter((fieldname) => po.fields.some((field) => field.fieldname === fieldname)));

  const receipt = compiledDoctype(pkg, "Purchase Receipt Item");
  assert.deepEqual(names(receipt.viewPolicy.quickEntry), alumdoorGoldenChildGridPolicies.purchaseCompact.filter((fieldname) => receipt.fields.some((field) => field.fieldname === fieldname)));
  assert.deepEqual(names(receipt.viewPolicy.form), alumdoorGoldenChildGridPolicies.purchaseReceiptFull.filter((fieldname) => receipt.fields.some((field) => field.fieldname === fieldname)));
});

test("all migrated child doctypes carry at least one explicit surface override", () => {
  const brief = sourceBrief();
  applyAlumdoorChildPresentation(brief);
  const pkg = compileBrief(brief);
  const children = pkg.doctypes.filter((doctype) => doctype.is_child === true);
  const missing = children.filter((doctype) => !doctype.fields.some(explicitOverride)).map((doctype) => doctype.name);
  assert.deepEqual(missing, [], `children without explicit presentation ownership: ${missing.join(", ")}`);
});
