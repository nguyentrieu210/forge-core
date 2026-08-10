import test from "node:test";
import assert from "node:assert/strict";
import { deriveLinearSalesBasis } from "../dist/apps-src/alumdoor-worker/src/index.js";

test("linear sales basis recognizes structural Ray but not Ron accessory", () => {
  assert.equal(deriveLinearSalesBasis({ item_name: "RAY SẮT U100", item_code: "NVL-RAY-U100" }), "RAY");
  assert.equal(deriveLinearSalesBasis({ item_name: "RON NHỰA CẠNH RAY", item_code: "RNHUA/LONG-CR" }), undefined);
});

test("linear sales basis recognizes Trục by item code", () => {
  assert.equal(deriveLinearSalesBasis({ item_name: "TRỤC 140", item_code: "TP-TRUC140" }), "TRUC");
});
