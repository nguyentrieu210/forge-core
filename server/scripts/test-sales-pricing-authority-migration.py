#!/usr/bin/env python3
"""Verify migration 0117 extends Pricing Rule only and remains replay-safe."""

import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "migrations/tenant/0117_sales_pricing_authority.sql"


def metadata(revision=5):
    return json.dumps(
        {
            "name": "Pricing Rule",
            "module": "Selling",
            "revision": revision,
            "fields": [
                {"fieldname": "title", "fieldtype": "Data"},
                {"fieldname": "price_list", "fieldtype": "Link", "options": "Price List"},
                {"fieldname": "item_code", "fieldtype": "Link", "options": "Item"},
                {"fieldname": "customer_group", "fieldtype": "Data"},
                {"fieldname": "min_qty", "fieldtype": "Float"},
                {"fieldname": "max_qty", "fieldtype": "Float"},
                {"fieldname": "rate", "fieldtype": "Currency"},
                {"fieldname": "discount_percentage", "fieldtype": "Percent"},
                {"fieldname": "priority", "fieldtype": "Int"},
                {"fieldname": "disabled", "fieldtype": "Check"},
            ],
        },
        ensure_ascii=False,
        separators=(",", ":"),
    )


db = sqlite3.connect(":memory:")
db.executescript(
    """
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
      PRIMARY KEY(tenant_id, doctype)
    );
    """
)
for tenant in ("demo", "__standard__", "tenant-a"):
    db.execute(
        "INSERT INTO doctype_definitions VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        (tenant, "Pricing Rule", "Selling", 0, 0, 0, 5, metadata(), 0, "seed", "2026-08-10T00:00:00.000Z"),
    )

sql = MIGRATION.read_text(encoding="utf-8")
for forbidden in ("AlumDoor", "Cửa Đức", "Cửa Úc", "465000", "15%", "WITH_RAIL", "NO_RAIL"):
    assert forbidden not in sql, forbidden

# Deployment retries must not duplicate fields or keep incrementing the revision.
db.executescript(sql)
first = {}
for tenant in ("demo", "__standard__", "tenant-a"):
    revision, raw = db.execute(
        "SELECT revision,metadata_json FROM doctype_definitions WHERE tenant_id=? AND doctype='Pricing Rule'",
        (tenant,),
    ).fetchone()
    doc = json.loads(raw)
    names = [field.get("fieldname") for field in doc["fields"] if isinstance(field, dict)]
    expected = {
        "item_group", "currency", "effect_type", "discount_amount", "adjustment_basis",
        "adjustment_rate", "exclusive_group", "taxable", "discountable", "conditions",
    }
    assert expected.issubset(set(names)), (tenant, expected - set(names))
    assert len(names) == len(set(names)), (tenant, "duplicate field")
    assert doc["revision"] == revision, (tenant, doc["revision"], revision)
    first[tenant] = (revision, raw)

# Second execution is a no-op for semantic metadata/revision.
db.executescript(sql)
for tenant in ("demo", "__standard__", "tenant-a"):
    row = db.execute(
        "SELECT revision,metadata_json FROM doctype_definitions WHERE tenant_id=? AND doctype='Pricing Rule'",
        (tenant,),
    ).fetchone()
    assert row == first[tenant], (tenant, row[0], first[tenant][0])

# No parallel adjustment master is introduced.
assert db.execute("SELECT COUNT(*) FROM doctype_definitions WHERE doctype='Sales Adjustment Rule'").fetchone()[0] == 0
print("SALES_PRICING_AUTHORITY_MIGRATION_PASS")
