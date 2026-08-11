import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const seed = await readFile(new URL("../scripts/seed-purchase-qa-local.mjs", import.meta.url), "utf8");
const fifo = await readFile(new URL("../../client/e2e-forge/auth-tests/purchase-fifo-lifecycle.spec.ts", import.meta.url), "utf8");

test("local authenticated QA seed uses counted aluminum stock plus Kg catch weight", () => {
  assert.match(seed, /stock_uom:\s*"Cây"/);
  assert.match(seed, /default_purchase_uom:\s*"Kg"/);
  assert.match(seed, /has_batch_no:\s*1/);
  assert.match(seed, /has_catch_weight:\s*1/);
  assert.match(seed, /weight_uom:\s*"Kg"/);
  assert.match(seed, /purchase_stock_qty_field:\s*"qty_bar"/);
  assert.match(seed, /purchase_allocation_qty_field:\s*"qty_bar"/);
  assert.match(seed, /purchase_allocation_uom:\s*"Cây"/);
  assert.match(seed, /uom_conversions:\s*\[\]/);
});

test("authenticated FIFO E2E asserts tracked Batch Bundle receipt rather than Kg stock", () => {
  assert.match(fifo, /stock_uom:\s*"Cây"/);
  assert.match(fifo, /stock_qty:\s*bars/);
  assert.match(fifo, /createdResult\.batches/);
  assert.match(fifo, /createdResult\.bundles/);
  assert.match(fifo, /serial_and_batch_bundle/);
  assert.match(fifo, /Batch \+ Serial and Batch Bundle \+ Stock Ledger/);
  assert.doesNotMatch(fifo, /conversion_factor:\s*1/);
});
