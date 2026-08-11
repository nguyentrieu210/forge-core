import test from "node:test";
import assert from "node:assert/strict";
import { validateBackendUiContract } from "../scripts/lib/backend-ui-contract-validator.mjs";

function baseDoctype(overrides = {}) {
  return {
    name: "Order",
    kind: "transaction",
    is_child: false,
    fields: [
      { fieldname: "customer", fieldtype: "Link", options: "Customer", required: true, valueSource: "user", editMode: "editable", surface: "quick" },
      { fieldname: "total", fieldtype: "Currency", valueSource: "formula", editMode: "readonly", surface: "expanded", serverEnforced: true },
      { fieldname: "snapshot", fieldtype: "JSON", valueSource: "system", editMode: "hidden", surface: "internal", hidden: true, serverEnforced: true },
    ],
    viewPolicy: {
      list: { enabled: true, columns: ["customer", "total"] },
      form: { enabled: true, fields: ["customer", "total"] },
      quickEntry: { enabled: true, fields: ["customer"] },
    },
    ...overrides,
  };
}

test("generic validator accepts a closed, reachable metadata contract", () => {
  const findings = validateBackendUiContract({
    doctypes: [baseDoctype(), { name: "Customer", kind: "master", fields: [], viewPolicy: {} }],
    nav: [{ key: "Order", kind: "doctype", permission_doctype: "Order" }],
    previewContracts: [{ doctype: "Order", method: "orders.preview", outputs: ["total"] }],
    closedWorldLinks: true,
  });
  assert.deepEqual(findings, []);
});

test("generic validator catches Link/Table target and duplicate field drift", () => {
  const order = baseDoctype({
    fields: [
      { fieldname: "customer", fieldtype: "Link", options: "Missing Customer", required: true, valueSource: "user", editMode: "editable", surface: "quick" },
      { fieldname: "customer", fieldtype: "Data", valueSource: "user", editMode: "editable", surface: "expanded" },
      { fieldname: "items", fieldtype: "Table", options: "Missing Row", surface: "expanded" },
    ],
    viewPolicy: { list: { columns: ["customer"] }, form: { fields: ["customer", "items"] }, quickEntry: { fields: ["customer"] } },
  });
  const findings = validateBackendUiContract({ doctypes: [order], closedWorldLinks: true });
  assert.equal(findings.filter((entry) => entry.classification === "SCHEMA_DRIFT").length, 3);
});

test("generic validator catches dead view metadata, internal leakage and required unreachable fields", () => {
  const order = baseDoctype({
    fields: [
      { fieldname: "required_note", fieldtype: "Data", required: true, valueSource: "user", editMode: "editable", surface: "expanded" },
      { fieldname: "snapshot", fieldtype: "JSON", valueSource: "system", editMode: "hidden", surface: "internal", hidden: true, serverEnforced: true },
    ],
    viewPolicy: {
      list: { enabled: true, columns: ["snapshot", "ghost"] },
      form: { enabled: true, fields: [] },
      quickEntry: { enabled: false, fields: [] },
    },
  });
  const findings = validateBackendUiContract({ doctypes: [order] });
  assert.ok(findings.some((entry) => entry.classification === "DEAD_METADATA" && entry.field === "ghost"));
  assert.ok(findings.some((entry) => entry.classification === "INTERNAL_LEAK" && entry.field === "snapshot"));
  assert.ok(findings.some((entry) => entry.classification === "FORM_INCOMPLETE" && entry.field === "required_note"));
});

test("generic validator catches broken navigation and action permission targets", () => {
  const findings = validateBackendUiContract({
    doctypes: [baseDoctype()],
    externalDocTypes: ["Customer"],
    nav: [
      { key: "Missing Master", kind: "doctype" },
      { key: "screen:ops", kind: "experience", permission_doctype: "Missing Permission" },
    ],
    actions: [{ name: "approve", permission_doctype: "Missing Permission" }],
  });
  assert.ok(findings.some((entry) => entry.classification === "DEAD_METADATA" && entry.nav_key === "Missing Master"));
  assert.ok(findings.some((entry) => entry.classification === "PERMISSION_MISMATCH"));
  assert.ok(findings.some((entry) => entry.classification === "ACTION_UNWIRED"));
});

test("generic validator catches server preview outputs missing from metadata", () => {
  const findings = validateBackendUiContract({
    doctypes: [baseDoctype()],
    externalDocTypes: ["Customer"],
    previewContracts: [{ doctype: "Order", method: "orders.preview", outputs: ["total", "tax_total"] }],
  });
  assert.deepEqual(
    findings.filter((entry) => entry.classification === "FORM_INCOMPLETE").map((entry) => entry.field),
    ["tax_total"],
  );
});
