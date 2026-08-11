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
