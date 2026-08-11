import assert from "node:assert/strict";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  alumdoorExperimentalAdjustmentRules,
  calculateCommercialLine,
  evaluateSalesAdjustmentRules,
} from "../dist/packages/clouderp-selling/src/adjustment-policy.js";

const dbPath = process.env.LAB_DB;
if (!dbPath) throw new Error("LAB_DB is required");

const audit = JSON.parse(fs.readFileSync("imports/alumdoor-full-2026-07-28.audit.json", "utf8"));
const importSql = fs.readFileSync("imports/alumdoor-full-2026-07-28.sql", "utf8");
const uomCorrectionSql = fs.readFileSync("imports/alumdoor-uom-correction-2026-07-28.sql", "utf8");
const priceUomBackfillSql = fs.readFileSync("imports/alumdoor-item-price-uom-backfill-2026-07-28.sql", "utf8");
const db = new DatabaseSync(dbPath);

const one = (sql, ...params) => db.prepare(sql).get(...params);
const all = (sql, ...params) => db.prepare(sql).all(...params);
const parsePayload = (row) => JSON.parse(String(row.payload_json));

try {
  // Reconstruct the corrected catalogue on a disposable copy of the real local D1.
  db.exec(importSql);
  db.exec(uomCorrectionSql);
  db.exec(priceUomBackfillSql);

  const itemCount = Number(one("SELECT COUNT(*) AS c FROM documents WHERE tenant_id='alu' AND doctype='Item'").c);
  const priceCount = Number(one("SELECT COUNT(*) AS c FROM documents WHERE tenant_id='alu' AND doctype='Item Price'").c);
  console.log(`REAL_ITEM_COUNT=${itemCount}`);
  console.log(`REAL_ITEM_PRICE_COUNT=${priceCount}`);
  console.log(`AUDIT_EXPECTED=${JSON.stringify(audit.expected_final_counts)}`);
  assert.equal(itemCount, audit.expected_final_counts.items, "real imported Item count");
  assert.equal(priceCount, audit.expected_final_counts.item_prices, "real imported Item Price count");

  const item = (code) => {
    const row = one(
      "SELECT name,payload_json FROM documents WHERE tenant_id='alu' AND doctype='Item' AND name=?",
      code,
    );
    assert.ok(row, `real Item ${code} must exist`);
    return { name: String(row.name), data: parsePayload(row) };
  };

  const price = (code, priceList) => {
    const row = one(
      `SELECT name,payload_json FROM documents
       WHERE tenant_id='alu' AND doctype='Item Price'
         AND json_extract(payload_json,'$.item_code')=?
         AND json_extract(payload_json,'$.price_list')=?`,
      code,
      priceList,
    );
    assert.ok(row, `real ${priceList} Item Price for ${code} must exist`);
    return { name: String(row.name), data: parsePayload(row) };
  };

  const realCodes = ["TP-TD-AL752N", "TP-UC KT 4D", "TP-UC MTN 4.6D"];
  for (const code of realCodes) {
    const row = item(code);
    console.log(`REAL_ITEM=${JSON.stringify({
      name: row.name,
      item_name: row.data.item_name,
      item_group: row.data.item_group,
      door_type: row.data.door_type,
      inventory_mode: row.data.inventory_mode,
      default_sales_uom: row.data.default_sales_uom,
      stock_uom: row.data.stock_uom,
      description: row.data.description,
    })}`);
  }

  const prices = all(
    `SELECT name,payload_json FROM documents
     WHERE tenant_id='alu' AND doctype='Item Price'
       AND json_extract(payload_json,'$.item_code') IN ('TP-TD-AL752N','TP-UC KT 4D','TP-UC MTN 4.6D')
     ORDER BY name`,
  ).map((row) => {
    const data = parsePayload(row);
    return {
      name: String(row.name),
      item_code: data.item_code,
      price_list: data.price_list,
      uom: data.uom,
      rate: data.rate,
      currency: data.currency,
    };
  });
  console.log(`REAL_PRICES=${JSON.stringify(prices)}`);
  for (const code of realCodes) {
    assert.ok(prices.some((entry) => entry.item_code === code), `real Item Price for ${code} must exist`);
  }
  assert.ok(prices.every((entry) => entry.uom), "corrected real Item Prices must carry an explicit sales UOM");

  // The source compiler maps the two source columns directly to these two price lists:
  // "Gia niem yet" is the baseline, while "Gia co ray" is explicitly the full set with rail.
  // Every source row marked "Co ray tang" must therefore have both rates available.
  for (const code of audit.rail_gift_rows_preserved_in_description) {
    const baseline = price(code, "Giá niêm yết").data;
    const withRail = price(code, "Giá có ray").data;
    assert.equal(baseline.uom, withRail.uom, `${code} gift and baseline prices must use the same UOM`);
    assert.ok(Number(baseline.rate) > 0 && Number(withRail.rate) > 0, `${code} gift/baseline rates must be positive`);
  }

  const targetRailCodes = [
    "TP-RAYHOP",               // RAY HOP TD U76
    "TP-RAY HỘP TD U100",     // RAY HOP TD U100
    "TP-TD87A1 GS",           // RAY DON TD U76
    "NVL-TOLE1.2x190-KRON",   // RAY SAT U70 KHONG RON
  ];
  const targetRails = targetRailCodes.map((code) => ({ name: code, data: item(code).data }));
  console.log(`REAL_TARGET_RAILS=${JSON.stringify(targetRails.map(({ name, data }) => ({
    name,
    item_name: data.item_name,
    item_group: data.item_group,
    default_sales_uom: data.default_sales_uom,
    stock_uom: data.stock_uom,
    uom_conversions: data.uom_conversions,
  })))}`);
  assert.ok(targetRails.every(({ data }) => data.default_sales_uom === "Mét"), "all four target rails must sell by metre");
  assert.equal(targetRails.find(({ name }) => name === "TP-RAYHOP")?.data.stock_uom, "Kg");
  assert.equal(targetRails.find(({ name }) => name === "TP-RAY HỘP TD U100")?.data.stock_uom, "Kg");
  assert.equal(targetRails.find(({ name }) => name === "TP-TD87A1 GS")?.data.stock_uom, "Kg");

  const gift = item("TP-TD-AL752N").data;
  assert.ok(
    audit.rail_gift_rows_preserved_in_description.includes("TP-TD-AL752N"),
    "real gift-rail source marker must exist",
  );
  assert.match(String(gift.description ?? ""), /Có ray tặng/u);
  const baselinePrice = price("TP-TD-AL752N", "Giá niêm yết").data;
  const giftPrice = price("TP-TD-AL752N", "Giá có ray").data;
  assert.equal(Number(baselinePrice.rate), 1_626_000);
  assert.equal(Number(giftPrice.rate), 1_701_000);
  assert.equal(baselinePrice.uom, "m2");
  assert.equal(giftPrice.uom, "m2");

  // Exact real-data example: sell the gift-rail price, but discount 15% on baseline price.
  const giftLine = calculateCommercialLine({
    priced_qty: 10,
    selling_rate_minor: Number(giftPrice.rate),
    discount_basis_rate_minor: Number(baselinePrice.rate),
    discount_percentage: 15,
  });
  assert.equal(giftLine.gross_amount_minor, 17_010_000);
  assert.equal(giftLine.discount_basis_amount_minor, 16_260_000);
  assert.equal(giftLine.discount_amount_minor, 2_439_000);
  assert.equal(giftLine.net_before_tax_minor, 14_571_000);

  const au = item("TP-UC KT 4D").data;
  const group = String(au.item_group ?? "").normalize("NFC").toLocaleLowerCase("vi");
  const doorType = au.door_type || (group.includes("úc") ? "Cửa Úc" : "");
  assert.equal(doorType, "Cửa Úc", "real Australian item must resolve as Cửa Úc");

  const adjustments = evaluateSalesAdjustmentRules(
    {
      facts: {
        door_type: doorType,
        finish_class: "WOOD_GRAIN",
        area_per_set_sqm: 5.2,
      },
      area_sqm: 5.2,
      set_count: 1,
    },
    alumdoorExperimentalAdjustmentRules(0),
  );
  const woodgrain = adjustments.applied.find((row) => row.rule_code === "WOOD_GRAIN_DOOR");
  const medium = adjustments.applied.find((row) => row.rule_code === "AU_MEDIUM_SET");
  assert.equal(woodgrain?.amount_minor, 2_418_000);
  assert.equal(medium?.amount_minor, 300_000);

  console.log(`REAL_GIFT_ITEM_GROUP=${gift.item_group}`);
  console.log(`REAL_GIFT_BASELINE_RATE=${baselinePrice.rate}`);
  console.log(`REAL_GIFT_SELLING_RATE=${giftPrice.rate}`);
  console.log(`REAL_GIFT_DISCOUNT=${giftLine.discount_amount_minor}`);
  console.log(`REAL_GIFT_NET=${giftLine.net_before_tax_minor}`);
  console.log(`REAL_AU_ITEM_GROUP=${au.item_group}`);
  console.log(`REAL_ADJUSTMENTS=${JSON.stringify(adjustments)}`);
  console.log("PRICING_REAL_DATA_LAB_PASS");
} finally {
  db.close();
}
