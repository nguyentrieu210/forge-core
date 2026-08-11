import test from "node:test";
import assert from "node:assert/strict";
import { buildResidualPurchaseValidationRequest } from "../dist/apps-src/alumdoor-worker/src/aluminum-validation-bridge.js";

function envWithItems(items) {
  return {
    PLATFORM: {
      async fetch(request) {
        const url = new URL(request.url);
        const parts = url.pathname.replace(/^\/+/, "").split("/");
        if (parts[0] !== "resource" || parts.length < 3) return Response.json({ message: "not found" }, { status: 404 });
        const doctype = decodeURIComponent(parts[1]);
        const name = decodeURIComponent(parts.slice(2).join("/"));
        if (doctype !== "Item" || !items[name]) return Response.json({ message: "not found" }, { status: 404 });
        return Response.json({ data: items[name] });
      },
    },
  };
}

function request(items) {
  return new Request("https://alumdoor.test/hooks/validate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cloudforge-callback": "https://platform.test/",
      "x-cloudforge-tenant": "alu",
    },
    body: JSON.stringify({
      doctype: "Purchase Order",
      name: "PO-MIXED",
      action: "create",
      payload: {
        supplier: "SUP-1",
        company: "ALUMDOOR",
        currency: "VND",
        transaction_date: "2026-08-11",
        items,
      },
    }),
  });
}

test("mixed Purchase Order residual validation removes only canonical aluminum rows", async () => {
  const source = request([
    { row_id: "A", item_code: "AL71", qty: 100, qty_bar: 20, uom: "Kg" },
    { row_id: "B", item_code: "PHUKIEN", qty: 2, uom: "Cái" },
  ]);
  const residual = await buildResidualPurchaseValidationRequest(source, envWithItems({
    AL71: { inventory_mode: "Nhôm cây/lá" },
    PHUKIEN: { inventory_mode: "Hàng thường" },
  }));
  assert.ok(residual);
  const body = await residual.json();
  assert.deepEqual(body.payload.items.map((row) => row.row_id), ["B"]);
  assert.equal(body.payload.supplier, "SUP-1");
  assert.equal(body.doctype, "Purchase Order");
});

test("no residual request is produced for an aluminum-only purchase document", async () => {
  const residual = await buildResidualPurchaseValidationRequest(request([
    { row_id: "A", item_code: "AL71", qty: 100, qty_bar: 20, uom: "Kg" },
  ]), envWithItems({ AL71: { inventory_mode: "Nhôm cây/lá" } }));
  assert.equal(residual, null);
});

test("ordinary-only document is preserved entirely when the bridge is called", async () => {
  const residual = await buildResidualPurchaseValidationRequest(request([
    { row_id: "B1", item_code: "PHUKIEN", qty: 2, uom: "Cái" },
    { row_id: "B2", item_code: "MOTOR", qty: 1, uom: "Cái" },
  ]), envWithItems({
    PHUKIEN: { inventory_mode: "Hàng thường" },
    MOTOR: { inventory_mode: "Hàng thường" },
  }));
  assert.ok(residual);
  const body = await residual.json();
  assert.deepEqual(body.payload.items.map((row) => row.row_id), ["B1", "B2"]);
});
