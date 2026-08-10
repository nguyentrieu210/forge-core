import test from "node:test";
import assert from "node:assert/strict";
import { alumdoorOrderTotals } from "../dist/packages/clouderp-selling/src/controllers.js";

/**
 * Đơn thật đã in sai: 12 m2 × 1.626.000 = 19.512.000, chiết khấu 15% = 2.926.800.
 * Bản in ra "Tiền phải thu 19.512.000" — đúng bằng tiền hàng CHƯA trừ chiết khấu — vì
 * controller không hề thấy chiết khấu, còn "Tổng tiền hàng" và VAT thì bỏ trắng.
 */
const ORDER = { netTotalMinor: 16_585_200, discountAmountMinor: 2_926_800, surchargeMinor: 0, currencyScale: 0 };

test("Tổng tiền hàng là số TRƯỚC chiết khấu, không phải net_total", () => {
  const totals = alumdoorOrderTotals({ ...ORDER, vatRate: 0 });
  assert.equal(totals.total_amount, "19512000");
  assert.equal(totals.vat_amount, "0");
  assert.equal(totals.extraMinor, 0, "không VAT, không phụ thu thì không cộng thêm gì");
});

test("VAT tính trên tiền hàng đã trừ chiết khấu CỘNG phụ thu", () => {
  const totals = alumdoorOrderTotals({ ...ORDER, vatRate: 10, surchargeMinor: 100_000 });
  // Phụ thu không chịu chiết khấu nhưng chịu VAT: gốc thuế = 16.585.200 + 100.000.
  assert.equal(totals.vat_base_amount, "16685200");
  assert.equal(totals.vat_amount, "1668520", "KHÔNG phải 10% của riêng tiền hàng");
  assert.equal(totals.vat_amount_minor, 1_668_520);
  assert.equal(totals.extraMinor, 1_668_520 + 100_000, "cộng vào tổng: phụ thu + VAT");
});

test("phụ thu 0 thì gốc thuế đúng bằng tiền hàng sau chiết khấu", () => {
  const totals = alumdoorOrderTotals({ ...ORDER, vatRate: 10 });
  assert.equal(totals.vat_base_amount, "16585200");
  assert.equal(totals.vat_amount, "1658520");
});

test("tỷ lệ VAT hỏng hoặc ngoài khoảng không làm lệch tiền phải thu", () => {
  for (const [rate, expected] of [[undefined, 0], [null, 0], ["", 0], ["bậy", 0], [-5, 0], [150, 100]]) {
    assert.equal(alumdoorOrderTotals({ ...ORDER, vatRate: rate }).vat_rate, expected, `vat_rate=${String(rate)}`);
  }
  // Chuỗi số vẫn phải dùng được: form gửi lên "5" chứ không phải 5.
  assert.equal(alumdoorOrderTotals({ ...ORDER, vatRate: "5" }).vat_amount, "829260");
});

test("đơn không chiết khấu vẫn ra đúng tiền hàng", () => {
  const totals = alumdoorOrderTotals({ netTotalMinor: 540_000, discountAmountMinor: 0, vatRate: 5, surchargeMinor: 0, currencyScale: 0 });
  assert.equal(totals.total_amount, "540000");
  assert.equal(totals.vat_amount, "27000");
});
