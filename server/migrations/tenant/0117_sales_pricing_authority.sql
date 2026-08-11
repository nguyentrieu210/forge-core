-- Extend the existing Pricing Rule master into the single commercial money authority.
--
-- No vertical item, door, rail, percentage or surcharge value belongs in this migration.
-- Existing `rate` and `discount_percentage` fields remain valid legacy effects; the new
-- metadata adds generic effects/conditions that any installed app may configure.

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"item_group","label":"Item Group","fieldtype":"Link","options":"Item Group","in_standard_filter":true}')),
    revision = revision + 1, modified_by = 'migration-0117', modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='item_group');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"currency","label":"Currency","fieldtype":"Link","options":"Currency","in_standard_filter":true}')),
    revision = revision + 1, modified_by = 'migration-0117', modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='currency');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"effect_type","label":"Effect Type","fieldtype":"Select","options":"RATE_OVERRIDE\nDISCOUNT_PERCENT\nDISCOUNT_AMOUNT\nADJUSTMENT","description":"Leave blank for legacy rules: rate => RATE_OVERRIDE, discount_percentage => DISCOUNT_PERCENT.","in_list_view":true,"in_standard_filter":true}')),
    revision = revision + 1, modified_by = 'migration-0117', modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='effect_type');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"discount_amount","label":"Discount Amount","fieldtype":"Currency","non_negative":true,"depends_on":"eval:doc.effect_type == \"DISCOUNT_AMOUNT\""}')),
    revision = revision + 1, modified_by = 'migration-0117', modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='discount_amount');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"adjustment_basis","label":"Adjustment Basis","fieldtype":"Select","options":"FIXED\nPRICED_QTY\nAREA_SQM\nLENGTH_M\nSET_COUNT","depends_on":"eval:doc.effect_type == \"ADJUSTMENT\"","in_standard_filter":true}')),
    revision = revision + 1, modified_by = 'migration-0117', modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='adjustment_basis');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"adjustment_rate","label":"Adjustment Rate","fieldtype":"Currency","non_negative":true,"depends_on":"eval:doc.effect_type == \"ADJUSTMENT\""}')),
    revision = revision + 1, modified_by = 'migration-0117', modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='adjustment_rate');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"exclusive_group","label":"Exclusive Group","fieldtype":"Data","description":"Only the highest-priority equally scoped adjustment in one group may apply.","in_standard_filter":true}')),
    revision = revision + 1, modified_by = 'migration-0117', modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='exclusive_group');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"taxable","label":"Taxable","fieldtype":"Check","default":1}')),
    revision = revision + 1, modified_by = 'migration-0117', modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='taxable');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"discountable","label":"Discountable","fieldtype":"Check","default":0}')),
    revision = revision + 1, modified_by = 'migration-0117', modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='discountable');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json, '$.fields[#]', json('{"fieldname":"conditions","label":"Additional Conditions","fieldtype":"JSON","description":"Array of {field, operator, value|values}. Operators: eq, neq, in, not_in, lt, lte, gt, gte."}')),
    revision = revision + 1, modified_by = 'migration-0117', modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='conditions');
