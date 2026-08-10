import test from "node:test";
import assert from "node:assert/strict";
import { defaultSalesDiscountPercent, deriveItemColorPolicy, deriveLinearSalesBasis, deriveSalesQuantity, isOrdinaryQuantitySalesItem, isWidthQuantitySalesItem } from "../dist/form/ChildGrid.js";

test("only door items default to 15 percent while ray/trục stay at zero", () => {
  assert.equal(defaultSalesDiscountPercent({ item_code: "TP-AL752N", item_group: "Cửa CN Đức", inventory_mode: "Thành phẩm theo m2" }), 15);
  assert.equal(defaultSalesDiscountPercent({ item_code: "TP-RAYNHOMUC", item_name: "HH RAY NHÔM ÚC", item_group: "Cửa tấm liền Úc", inventory_mode: "Hàng thường" }), 0);
  assert.equal(defaultSalesDiscountPercent({ item_code: "NVL-TRUC34", item_name: "TRỤC PHI 34", item_group: "Cửa tấm liền Úc", inventory_mode: "Hàng thường" }), 0);
  assert.equal(deriveLinearSalesBasis({ item_code: "TRỤC 114_1.8LY" }), "TRUC");
});

test("ray/trục bán Mét derives total billable metres", () => {
  const result = deriveSalesQuantity({
    inventory_mode: "Nhôm cây/lá",
    uom: "Mét",
    length_m: 5.3,
    qty_bar: 3,
  });
  assert.equal(result.policy, "LENGTH_X_PIECES");
  assert.equal(result.derived, true);
  assert.equal(result.quantity, 15.9);
});

test("Ray Hàng thường bán Mét uses Cao × Số lượng", () => {
  const result = deriveSalesQuantity({
    item_name: "RAY SẮT U100",
    inventory_mode: "Hàng thường",
    uom: "Mét",
    height_m: 3.2,
    set_count: 2,
  });
  assert.equal(result.policy, "LENGTH_X_PIECES");
  assert.equal(result.derived, true);
  assert.equal(result.quantity, 6.4);
});

test("Trục Hàng thường bán Mét uses Rộng × Số lượng", () => {
  const result = deriveSalesQuantity({
    item_code: "TP-TRUC140",
    inventory_mode: "Hàng thường",
    uom: "Mét",
    width_m: 4.5,
    set_count: 1,
  });
  assert.equal(result.policy, "LENGTH_X_PIECES");
  assert.equal(result.derived, true);
  assert.equal(result.quantity, 4.5);
});

test("width-based leaf accessories use width times quantity", () => {
  assert.equal(isWidthQuantitySalesItem({ item_code: "TP-BO3LADAY", item_name: "BỘ BA LÁ ĐÁY" }), true);
  assert.equal(isWidthQuantitySalesItem({ item_code: "TP-A282", item_name: "LÁ ĐẦU" }), true);
  const result = deriveSalesQuantity({ item_code: "TP-BO3LADAY", inventory_mode: "Hàng thường", uom: "Mét", width_m: 1.25, set_count: 3 });
  assert.equal(result.quantity, 3.75);
});

test("ordinary sales items enter quantity and mirror it to billable weight", () => {
  assert.equal(isOrdinaryQuantitySalesItem({ item_code: "MOTOR-01", inventory_mode: "Hàng thường" }), true);
  const result = deriveSalesQuantity({ item_code: "MOTOR-01", inventory_mode: "Hàng thường", uom: "Cái", set_count: 4 });
  assert.equal(result.quantity, 4);
  assert.equal(result.derived, true);
});

test("door quantity only trusts the Cutting Policy snapshot", () => {
  const pending = deriveSalesQuantity({
    inventory_mode: "Thành phẩm theo m2",
    door_type: "Cửa Đức",
    uom: "m²",
    width_m: 4,
    height_m: 3,
    set_count: 2,
  });
  assert.equal(pending.quantity, undefined);

  const calculated = deriveSalesQuantity({
    inventory_mode: "Thành phẩm theo m2",
    door_type: "Cửa Đức",
    uom: "m²",
    width_m: 4,
    height_m: 3,
    set_count: 2,
    billable_area_sqm: 23.52,
  });
  assert.equal(calculated.quantity, 23.52);
});

test("ordinary accessories keep direct quantity in their selected UOM", () => {
  const result = deriveSalesQuantity({ inventory_mode: "Hàng thường", uom: "Bộ", qty: 2 });
  assert.equal(result.policy, "PIECES");
  assert.equal(result.derived, true);
  assert.equal(result.quantity, 2);
});

test("sheet/glass quantity stays directly editable until it has an explicit policy", () => {
  assert.deepEqual(deriveSalesQuantity({
    inventory_mode: "Tấm/Kính", uom: "m²", width_m: 2, height_m: 3, qty: 4,
  }), { policy: "DIRECT", derived: false, label: "SL tính tiền" });
});

test("cleared or zero door set count cannot silently calculate one set", () => {
  assert.equal(deriveSalesQuantity({
    inventory_mode: "Thành phẩm theo m2", door_type: "Cửa Đức", uom: "m²",
    set_count: "", billable_area_sqm: 11.91,
  }).quantity, undefined);
  assert.equal(deriveSalesQuantity({
    inventory_mode: "Thành phẩm theo m2", uom: "Bộ", set_count: 0,
  }).quantity, undefined);
});

test("color visibility and requirement follow Item/Profile policy", () => {
  assert.deepEqual(deriveItemColorPolicy("Hàng thường", true, 0), { required: true, visible: true });
  assert.deepEqual(deriveItemColorPolicy("Hàng thường", false, 2), { required: false, visible: true });
  assert.deepEqual(deriveItemColorPolicy("Hàng thường", false, 0), { required: false, visible: false });
  assert.deepEqual(deriveItemColorPolicy("Nhôm cây/lá", false, 0), { required: true, visible: true });
});
