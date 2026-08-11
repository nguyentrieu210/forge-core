import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const grid = await readFile(new URL("../src/form/MetadataChildGrid.tsx", import.meta.url), "utf8");
const smart = await readFile(new URL("../src/form/metadata-child-grid-smart.ts", import.meta.url), "utf8");
const tableControls = await readFile(new URL("../src/form/table-controls.tsx", import.meta.url), "utf8");

test("Table control routes only metadata-owned doctypes through the smart renderer", () => {
  assert.match(tableControls, /MetadataChildGrid as ChildGrid/);
  assert.match(grid, /hasMetadataChildGridPresentation\(props\.childMeta\)/);
  assert.match(grid, /<SmartMetadataChildGrid \{\.\.\.props\} \/>/);
  assert.match(grid, /<LegacyChildGrid \{\.\.\.props\} \/>/);
});

test("metadata routing keeps legacy fallback outside the hook-owning smart component", () => {
  const wrapperStart = grid.indexOf("export function MetadataChildGrid");
  const smartStart = grid.indexOf("function SmartMetadataChildGrid");
  assert.ok(wrapperStart >= 0 && smartStart > wrapperStart);
  const wrapper = grid.slice(wrapperStart, smartStart);
  const smartComponent = grid.slice(smartStart);
  assert.equal(/\buse(State|Effect|Memo|Ref)\s*\(/.test(wrapper), false);
  assert.match(wrapper, /hasMetadataChildGridPresentation\(props\.childMeta\)/);
  assert.match(wrapper, /<SmartMetadataChildGrid \{\.\.\.props\} \/>/);
  assert.match(wrapper, /<LegacyChildGrid \{\.\.\.props\} \/>/);
  assert.equal(smartComponent.includes("return <LegacyChildGrid"), false);
  assert.match(smartComponent, /\buse(State|Effect|Memo|Ref)\s*\(/);
});

test("generic metadata grid contains no vertical or business-rule branches", () => {
  for (const forbidden of ["Sales Order", "Purchase Order", "Delivery Note", "Alumdoor", "Cửa Đức", "Cửa Úc", "Pricing Rule", "Item Price", "deriveSalesQuantity"]) {
    assert.equal(grid.includes(forbidden), false, `generic metadata grid must not know ${forbidden}`);
    assert.equal(smart.includes(forbidden), false, `generic smart-grid primitive must not know ${forbidden}`);
  }
});

test("permission-safe controls and spreadsheet paths use resolveField authority", () => {
  assert.match(grid, /registry\.resolve\(resolved\.field\.fieldtype\)/);
  assert.match(grid, /readOnly=\{Boolean\(readOnly \|\| resolved\.readOnly \|\| resolved\.masked\)\}/);
  assert.match(grid, /masked=\{resolved\.masked\}/);
  assert.match(grid, /dynamicLinkTarget\(resolved\.field, row\)/);
  assert.match(grid, /if \(!resolved\.visible \|\| resolved\.readOnly \|\| resolved\.masked\) continue/);
});

test("manual, paste and fill converge on one server preview seam", () => {
  assert.match(grid, /const commitEdits =/);
  assert.match(grid, /const setCell = .*commitEdits/);
  assert.match(grid, /pasteIntoGrid/);
  assert.match(grid, /const fillDown =/);
  assert.match(grid, /commitEdits\(edits\)/);
  assert.match(grid, /previewTargets\.forEach/);
  assert.match(grid, /services\.callPost<ChildRowPreviewResult>\(previewMethod/);
  assert.match(grid, /changed_field: changedField/);
  assert.match(grid, /child_fields: childFields/);
});

test("server preview is stale-safe, allowlisted and hydration does not dirty persisted rows", () => {
  assert.match(grid, /previewVersion\.current\.get\(key\) !== version/);
  assert.match(grid, /childFields\.includes\(fieldname\)/);
  assert.match(grid, /firstHydration \? "__hydrate__" : "__parent__"/);
  assert.match(grid, /!firstHydration\)/);
  assert.match(grid, /if \(applyValues\)/);
  assert.match(grid, /field_overrides/);
});

test("duplicate clones editable values only and re-enters server preview", () => {
  assert.match(grid, /const cloneEditableRow =/);
  assert.match(grid, /if \(!resolved\.visible \|\| resolved\.readOnly \|\| resolved\.masked \|\| field\.surface === "internal" \|\| field\.editMode === "hidden"\) continue/);
  assert.match(grid, /void runPreview\(firstCopyIndex \+ offset, copy, changedField\)/);
});

test("fill-down only fills blank selected targets", () => {
  assert.match(grid, /if \(!isBlank\(row\[field\.fieldname\]\)\) return/);
  assert.match(grid, /selectedSet\.has\(smartGridRowKey\(row, rowIndex\)\)/);
});

test("smart spreadsheet parser covers quoted TSV, headers, locale numbers and cell errors", () => {
  assert.match(smart, /export function parseSmartGridTsv/);
  assert.match(smart, /export function planSmartGridPaste/);
  assert.match(smart, /export function parseSmartGridPastedValue/);
  assert.match(smart, /const comma = value\.lastIndexOf\(","\)/);
  assert.match(smart, /const dot = value\.lastIndexOf\("\."\)/);
  assert.match(smart, /if \(comma >= 0 && dot >= 0\)/);
  assert.match(smart, /value\.split\(thousands\)\.join\(""\)\.replace\(decimal, "\."\)/);
  assert.match(grid, /setCellErrors/);
  assert.match(grid, /Giá trị dán không hợp lệ/);
});

test("adaptive columns, internal suppression and schema-versioned layout are generic", () => {
  assert.match(smart, /export function applicableSmartGridColumns/);
  assert.match(smart, /field\.surface === "internal"/);
  assert.match(smart, /field\.editMode === "hidden"/);
  assert.match(smart, /LAYOUT_TYPES\.has\(field\.fieldtype\)/);
  assert.match(smart, /resolveField/);
  assert.match(smart, /export function smartGridLayoutKey/);
  assert.match(smart, /explicitVersion/);
  assert.match(smart, /view\?\.(version|policyVersion|schemaVersion)/);
});

test("metadata-owned grid keeps mature operator tools", () => {
  for (const evidence of [
    "Tùy chỉnh cột",
    "Thêm nhiều",
    "Nhân bản dòng đã chọn",
    "Xóa dòng đã chọn",
    "Hoàn tác xóa dòng",
    "Điền xuống dòng đã chọn",
    "Mở toàn màn hình",
    "Chi tiết",
  ]) assert.equal(grid.includes(evidence), true, `missing operator tool: ${evidence}`);
  assert.match(grid, /resizeColumn/);
  assert.match(grid, /moveColumnSetting/);
  assert.match(grid, /layout\.pinned/);
  assert.match(grid, /saveSmartGridLayout/);
});

test("keyboard navigation can append a writable row at the grid edge", () => {
  assert.match(grid, /const handleCellKey =/);
  assert.match(grid, /event\.key === "Enter"/);
  assert.match(grid, /event\.key === "Tab"/);
  assert.match(grid, /appendAndFocus/);
});

test("column settings never offer internal or masked candidates", () => {
  assert.match(grid, /field\.surface === "internal" \|\| field\.editMode === "hidden"/);
  assert.match(grid, /return resolved\.visible && !resolved\.masked/);
});

test("mobile cards, detail and fullscreen remain first-class", () => {
  assert.match(grid, /md:hidden/);
  assert.match(grid, /setDetailRow/);
  assert.match(grid, /setFullscreen/);
  assert.match(grid, /data-smart-child-grid="true"/);
});
