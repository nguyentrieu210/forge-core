import test from "node:test";
import assert from "node:assert/strict";
import { defaultAlumdoorDiscountPercent } from "../dist/packages/clouderp-selling/src/controllers.js";

test("only door items default to 15 percent", () => {
  assert.equal(defaultAlumdoorDiscountPercent({ item_code: "TP-AL752N", item_group: "Cửa CN Đức", inventory_mode: "Thành phẩm theo m2" }), 15);
  assert.equal(defaultAlumdoorDiscountPercent({ item_code: "TEST-CUA-DUC", door_type: "Cửa Đức" }), 15);
});

test("ray and trục stay at zero even when their group is a door group", () => {
  assert.equal(defaultAlumdoorDiscountPercent({ item_code: "TP-RAYNHOMUC", item_name: "HH RAY NHÔM ÚC", item_group: "Cửa tấm liền Úc", inventory_mode: "Hàng thường" }), 0);
  assert.equal(defaultAlumdoorDiscountPercent({ item_code: "NVL-TRUC34", item_name: "TRỤC PHI 34", item_group: "Cửa tấm liền Úc", inventory_mode: "Hàng thường" }), 0);
  assert.equal(defaultAlumdoorDiscountPercent({ item_code: "TRỤC 114_1.8LY", item_group: "Cửa tấm liền Úc", inventory_mode: "Hàng thường" }), 0);
  assert.equal(defaultAlumdoorDiscountPercent({ item_code: "RNHUA/LONG-CR", item_name: "RON NHỰA CẠNH RAY", item_group: "Phụ kiện", inventory_mode: "Hàng thường" }), 0);
});
