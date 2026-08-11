import test from "node:test";
import assert from "node:assert/strict";
import {
  hasMetadataChildGridPresentation,
  metadataChildGridColumns,
  metadataChildGridHiddenColumns,
} from "../dist/form/child-grid-presentation.js";

function field(fieldname, surface, overrides = {}) {
  return {
    fieldname,
    label: fieldname,
    fieldtype: "Data",
    ...(surface ? { surface } : {}),
    ...overrides,
  };
}

function meta(overrides = {}) {
  return {
    name: "Any Child DocType",
    module: "Any Module",
    fields: [
      field("item_code", "quick"),
      field("color", "quick"),
      field("qty", "quick"),
      field("rate", "quick"),
      field("discount_basis_rate", "expanded"),
      field("policy_version", "internal"),
    ],
    permissions: [],
    ...overrides,
  };
}

test("enabled viewPolicy owns exact compact/full column order without doctype knowledge", () => {
  const input = meta({
    viewPolicy: {
      form: { enabled: true, columns: ["item_code", "color", "qty", "rate", "discount_basis_rate", "policy_version"] },
      quickEntry: { enabled: true, columns: ["item_code", "color", "qty", "rate"] },
    },
  });

  assert.equal(hasMetadataChildGridPresentation(input), true);
  assert.deepEqual(metadataChildGridColumns(input, false).map((x) => x.fieldname), ["item_code", "color", "qty", "rate"]);
  assert.deepEqual(metadataChildGridColumns(input, true).map((x) => x.fieldname), ["item_code", "color", "qty", "rate", "discount_basis_rate"]);
});

test("surface policy can drive quick, expanded and internal columns without explicit view lists", () => {
  const input = meta();
  assert.deepEqual(metadataChildGridColumns(input, false).map((x) => x.fieldname), ["item_code", "color", "qty", "rate"]);
  assert.deepEqual(metadataChildGridColumns(input, true).map((x) => x.fieldname), ["item_code", "color", "qty", "rate", "discount_basis_rate"]);
  assert.deepEqual(metadataChildGridHiddenColumns(input, metadataChildGridColumns(input, true), false), ["discount_basis_rate"]);
});

test("internal fields never become business columns even if an authored form list names them", () => {
  const input = meta({ viewPolicy: { form: { enabled: true, columns: ["item_code", "policy_version", "qty"] } } });
  assert.deepEqual(metadataChildGridColumns(input, true).map((x) => x.fieldname), ["item_code", "qty"]);
});

test("compiler-default child viewPolicy and surfaces do not silently switch renderer", () => {
  const input = {
    name: "Compiler Default Child",
    module: "Any Module",
    fields: [
      field("item_code", "quick", { reqd: 1, editMode: "editable" }),
      field("note", "expanded", { editMode: "editable" }),
      field("server_snapshot", "internal", { hidden: 1, editMode: "hidden" }),
    ],
    viewPolicy: {
      form: { enabled: false, fields: ["item_code", "note"] },
      quickEntry: { enabled: false, fields: ["item_code"] },
    },
    permissions: [],
  };
  assert.equal(hasMetadataChildGridPresentation(input), false);
  assert.equal(metadataChildGridColumns(input, false), null);
});

test("legacy metadata returns null so renderer can preserve exact current UI during migration", () => {
  const input = {
    name: "Legacy Child",
    module: "Legacy",
    fields: [field("item_code"), field("qty"), field("rate")],
    permissions: [],
  };
  assert.equal(hasMetadataChildGridPresentation(input), false);
  assert.equal(metadataChildGridColumns(input, false), null);
  assert.equal(metadataChildGridHiddenColumns(input, input.fields, false), null);
});
