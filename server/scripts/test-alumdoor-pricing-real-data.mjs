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
const db = new DatabaseSync(dbPath);

const one = (sql, ...params) => db.prepare(sql).get(...params);
const all = (sql, ...params) => db.prepare(sql).all(...params);
const parsePayload = (row) => JSON.parse(String(row.payload_json));

try {
  db.exec(importSql);

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
    assert.ok(prices.some((price) => price.item_code === code), `real Item Price for ${code} must exist`);
  }

  const rails = all(
    `SELECT name,payload_json FROM documents
     WHERE tenant_id='alu' AND doctype='Item'
       AND lower(json_extract(payload_json,'$.item_name')) LIKE '%ray%'
     ORDER BY name LIMIT 40`,
  ).map((row) => {
    const data = parsePayload(row);
    return {
      name: String(row.name),
      item_name: data.item_name,
      item_group: data.item_group,
      default_sales_uom: data.default_sales_uom,
      stock_uom: data.stock_uom,
    };
  });
  console.log(`REAL_RAY_SAMPLE=${JSON.stringify(rails)}`);
  assert.ok(rails.length > 0, "real dataset must contain rail items");

  const gift = item("TP-TD-AL752N").data;
  assert.ok(
    audit.rail_gift_rows_preserved_in_description.includes("TP-TD-AL752N"),
    "real gift-rail source marker must exist",
  );
  const giftLine = calculateCommercialLine({
    priced_qty: 10,
    selling_rate_minor: 1_800_000,
    discount_basis_rate_minor: 1_600_000,
    discount_percentage: 15,
  });
  assert.equal(giftLine.gross_amount_minor, 18_000_000);
  assert.equal(giftLine.discount_basis_amount_minor, 16_000_000);
  assert.equal(giftLine.discount_amount_minor, 2_400_000);
  assert.equal(giftLine.net_before_tax_minor, 15_600_000);

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
  console.log(`REAL_AU_ITEM_GROUP=${au.item_group}`);
  console.log(`REAL_ADJUSTMENTS=${JSON.stringify(adjustments)}`);
  console.log("PRICING_REAL_DATA_LAB_PASS");
} finally {
  db.close();
}
