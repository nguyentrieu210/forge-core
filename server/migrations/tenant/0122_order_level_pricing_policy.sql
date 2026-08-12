-- Generic order-level commercial pricing metadata.
--
-- Existing Pricing Rules remain line-level by default. ORDER rules are isolated with the
-- ORDER_ADJUSTMENT effect so the existing line resolver can never apply an aggregate once
-- per row. The first supported aggregate is SUM with a fixed, non-discountable charge.

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"rule_level","label":"Rule Level","fieldtype":"Select","options":"LINE\nORDER","default":"LINE","in_standard_filter":true,"description":"LINE evaluates one sales row; ORDER evaluates an aggregate across eligible rows."}')),
    revision = revision + 1, modified_by = 'migration-0122', modified_at = '2026-08-12T08:30:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='rule_level');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"aggregate_function","label":"Aggregate Function","fieldtype":"Select","options":"SUM","default":"SUM","depends_on":"eval:doc.rule_level == \"ORDER\""}')),
    revision = revision + 1, modified_by = 'migration-0122', modified_at = '2026-08-12T08:30:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='aggregate_function');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"aggregate_field","label":"Aggregate Field","fieldtype":"Select","options":"billable_area_sqm\nset_count\nlength_m\npriced_qty","depends_on":"eval:doc.rule_level == \"ORDER\""}')),
    revision = revision + 1, modified_by = 'migration-0122', modified_at = '2026-08-12T08:30:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='aggregate_field');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"aggregate_operator","label":"Aggregate Operator","fieldtype":"Select","options":"lt\nlte\ngt\ngte\neq\nneq","depends_on":"eval:doc.rule_level == \"ORDER\""}')),
    revision = revision + 1, modified_by = 'migration-0122', modified_at = '2026-08-12T08:30:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='aggregate_operator');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"aggregate_value","label":"Aggregate Threshold","fieldtype":"Float","non_negative":true,"depends_on":"eval:doc.rule_level == \"ORDER\""}')),
    revision = revision + 1, modified_by = 'migration-0122', modified_at = '2026-08-12T08:30:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='aggregate_value');

-- Extend the existing effect selector without changing any persisted line rule.
UPDATE doctype_definitions
SET metadata_json = json_set(
      metadata_json,
      '$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type' LIMIT 1) || '].options',
      'RATE_OVERRIDE\nDISCOUNT_PERCENT\nDISCOUNT_AMOUNT\nADJUSTMENT\nORDER_ADJUSTMENT'
    ),
    revision = revision + 1, modified_by = 'migration-0122', modified_at = '2026-08-12T08:30:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='effect_type')
  AND COALESCE((SELECT json_extract(value,'$.options') FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type' LIMIT 1),'') NOT LIKE '%ORDER_ADJUSTMENT%';

UPDATE doctype_definitions
SET metadata_json = json_set(metadata_json, '$.revision', revision)
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND COALESCE(json_extract(metadata_json,'$.revision'), -1) <> revision;
