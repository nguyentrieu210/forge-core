#!/usr/bin/env python3
"""Replay migration 0118 and assert generic Sales Option / price-variant metadata."""

import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "migrations/tenant/0118_sales_price_variants_options.sql"


def meta(name, fields, revision=4, child=False):
    return json.dumps({
        "name": name,
        "module": "Selling",
        "revision": revision,
        "is_child": child,
        "fields": [{"fieldname": field, "fieldtype": "Data"} for field in fields],
    }, ensure_ascii=False, separators=(",", ":"))


db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE doctype_definitions (
  tenant_id TEXT NOT NULL,
  doctype TEXT NOT NULL,
  module TEXT NOT NULL,
  is_custom INTEGER NOT NULL,
  is_submittable INTEGER NOT NULL,
  is_child INTEGER NOT NULL,
  revision INTEGER NOT NULL,
  metadata_json TEXT NOT NULL CHECK(json_valid(metadata_json)),
  disabled INTEGER NOT NULL,
  modified_by TEXT NOT NULL,
  modified_at TEXT NOT NULL,
  PRIMARY KEY(tenant_id,doctype)
);
""")

for tenant in ("demo", "__standard__", "tenant-a"):
    rows = [
        ("Item Price", ["price_list", "item_code", "uom", "rate"], 0),
        ("Quotation Item", ["item_code", "qty", "uom", "rate"], 1),
        ("Sales Order Item", ["item_code", "qty", "uom", "rate"], 1),
        ("Sales Invoice Item", ["item_code", "qty", "uom", "rate"], 1),
    ]
    for doctype, fields, child in rows:
        db.execute(
            "INSERT INTO doctype_definitions VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            (tenant, doctype, "Selling", 0, 0, child, 4, meta(doctype, fields, child=bool(child)), 0, "seed", "2026-08-10T00:00:00.000Z"),
        )

sql = MIGRATION.read_text(encoding="utf-8")
for forbidden in ("Cửa Đức", "Cửa Úc", "Đài Loan", "Có ray", "Không ray", "Trọn bộ", "Tách món", "WITH_RAIL", "NO_RAIL"):
    assert forbidden not in sql, forbidden

db.executescript(sql)
first = {}
for tenant in ("demo", "__standard__", "tenant-a"):
    price_revision, price_raw = db.execute(
        "SELECT revision,metadata_json FROM doctype_definitions WHERE tenant_id=? AND doctype='Item Price'",
        (tenant,),
    ).fetchone()
    price = json.loads(price_raw)
    variants = [field for field in price["fields"] if field.get("fieldname") == "price_variant"]
    assert len(variants) == 1
    assert variants[0]["default"] == "STANDARD"
    assert price["revision"] == price_revision

    option_row = db.execute(
        "SELECT is_child,revision,metadata_json FROM doctype_definitions WHERE tenant_id=? AND doctype='Sales Option'",
        (tenant,),
    ).fetchone()
    assert option_row is not None and option_row[0] == 0
    option = json.loads(option_row[2])
    option_fields = {field["fieldname"]: field for field in option["fields"]}
    for field in ("option_code", "option_label", "item_code", "item_group", "conditions", "price_variant", "discount_basis_variant", "sales_mode", "sales_package", "is_default", "priority", "disabled"):
        assert field in option_fields, (tenant, field)
    assert option_fields["price_variant"]["default"] == "STANDARD"

    for child in ("Quotation Item", "Sales Order Item", "Sales Invoice Item"):
        revision, raw = db.execute(
            "SELECT revision,metadata_json FROM doctype_definitions WHERE tenant_id=? AND doctype=?",
            (tenant, child),
        ).fetchone()
        metadata = json.loads(raw)
        fields = [field.get("fieldname") for field in metadata["fields"] if isinstance(field, dict)]
        for required in ("sales_option", "sales_option_code", "sales_option_label", "sales_option_version", "price_variant", "discount_basis_variant", "discount_basis_item_price"):
            assert fields.count(required) == 1, (tenant, child, required, fields.count(required))
        assert metadata["revision"] == revision
    first[tenant] = db.execute(
        "SELECT doctype,revision,metadata_json FROM doctype_definitions WHERE tenant_id=? ORDER BY doctype",
        (tenant,),
    ).fetchall()

# retry must be a semantic no-op
db.executescript(sql)
for tenant in first:
    second = db.execute(
        "SELECT doctype,revision,metadata_json FROM doctype_definitions WHERE tenant_id=? ORDER BY doctype",
        (tenant,),
    ).fetchall()
    assert second == first[tenant]

print("SALES_PRICE_VARIANT_OPTIONS_MIGRATION_PASS")
