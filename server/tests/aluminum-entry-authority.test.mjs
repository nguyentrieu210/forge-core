import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const entry = await readFile(new URL("../apps-src/alumdoor-worker/src/entry.ts", import.meta.url), "utf8");

test("deployed Alumdoor entrypoint routes FIFO through tracked purchase closure", () => {
  assert.match(entry, /handleTrackedPurchaseFifoRequest/);
  assert.match(entry, /alumdoor\.purchase\.fifo_receipt/);
  assert.match(entry, /alumdoor\.purchase\.bulk_fifo_receipt/);
  assert.doesNotMatch(entry, /return handlePurchaseFifoRequest\(request, env, true\)/);
  assert.doesNotMatch(entry, /return handleBulkPurchaseFifoRequest\(request, env, true\)/);
});

test("Purchase Receipt post-commit event cannot mutate legacy Aluminium Lot through deployed entrypoint", () => {
  assert.match(entry, /type\.startsWith\("purchase_receipt\."\)/);
  assert.match(entry, /skipped_legacy_aluminium_lot_sync/);
  assert.match(entry, /authority: "Batch \+ Stock Ledger"/);
  assert.doesNotMatch(entry, /syncLotsFromReceipt/);
});

test("sales inventory actions expose plan, reservation and shortage material request", () => {
  assert.match(entry, /alumdoor\.inventory\.plan_sales_order/);
  assert.match(entry, /alumdoor\.inventory\.reserve_sales_order/);
  assert.match(entry, /alumdoor\.inventory\.material_request_from_shortage/);
});
