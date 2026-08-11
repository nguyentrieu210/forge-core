import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const grid = await readFile(new URL("../src/form/MetadataChildGrid.tsx", import.meta.url), "utf8");
const tableControls = await readFile(new URL("../src/form/table-controls.tsx", import.meta.url), "utf8");

test("Table control routes metadata-owned doctypes through MetadataChildGrid", () => {
  assert.match(tableControls, /MetadataChildGrid as ChildGrid/);
  assert.match(grid, /hasMetadataChildGridPresentation/);
  assert.match(grid, /if \(!ownsPresentation\) return <LegacyChildGrid/);
});

test("metadata child grid contains no domain or doctype branches", () => {
  for (const forbidden of ["Sales Order", "Purchase Order", "Delivery Note", "Alumdoor", "Cửa Đức", "Cửa Úc", "Ray", "Trục"]) {
    assert.equal(grid.includes(forbidden), false, `generic metadata grid must not know ${forbidden}`);
  }
});

test("metadata child grid preserves common row workflow", () => {
  assert.match(grid, /addRow/);
  assert.match(grid, /removeRow/);
  assert.match(grid, /resolveField/);
  assert.match(grid, /registry\.resolve/);
  assert.match(grid, /readOnly=\{Boolean\(readOnly \|\| resolved\.readOnly\)\}/);
});

test("metadata child grid delegates row derivation to declared server preview", () => {
  assert.match(grid, /viewPreviewMethod/);
  assert.match(grid, /services\.callPost<ChildRowPreviewResult>\(previewMethod/);
  assert.match(grid, /changed_field: changedField/);
  assert.match(grid, /child_fields: childFields/);
  assert.match(grid, /previewParentFields/);
});

test("server preview cannot write unknown fields and stale responses are discarded", () => {
  assert.match(grid, /previewVersion\.current\.get\(key\) !== version/);
  assert.match(grid, /if \(childFields\.includes\(fieldname\)\) nextRow\[fieldname\] = undefined/);
  assert.match(grid, /if \(childFields\.includes\(fieldname\)\) nextRow\[fieldname\] = value/);
});
