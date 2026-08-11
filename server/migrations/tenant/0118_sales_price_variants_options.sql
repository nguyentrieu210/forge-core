-- Generic sales option + Item Price variant contract.
--
-- No vertical labels or product codes live here. Installed apps configure Sales Option
-- records such as their own commercial choices. Legacy Item Price rows remain STANDARD.

UPDATE doctype_definitions
SET metadata_json = json_insert(
      metadata_json,
      '$.fields[#]',
      json('{"fieldname":"price_variant","label":"Price Variant","fieldtype":"Data","default":"STANDARD","in_list_view":true,"in_standard_filter":true,"description":"Canonical commercial price variant. Blank legacy records resolve as STANDARD."}')
    ),
    revision = revision + 1,
    modified_by = 'migration-0118',
    modified_at = '2026-08-11T00:00:00.000Z'
WHERE doctype='Item Price' AND json_valid(metadata_json)
  AND NOT EXISTS (
    SELECT 1 FROM json_each(metadata_json,'$.fields') f
    WHERE json_extract(f.value,'$.fieldname')='price_variant'
  );

WITH tenants AS (SELECT DISTINCT tenant_id FROM doctype_definitions)
INSERT OR IGNORE INTO doctype_definitions(
  tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,
  metadata_json,disabled,modified_by,modified_at
)
SELECT tenant_id,'Sales Option','Selling',0,0,0,1,
'{"name":"Sales Option","module":"Selling","is_submittable":false,"is_child":false,"track_changes":true,"revision":1,"autoname":"field:option_code","title_field":"option_label","search_fields":["option_code","option_label","item_code","item_group"],"fields":[{"fieldname":"option_code","label":"Option Code","fieldtype":"Data","required":true,"unique":true,"in_list_view":true,"search_index":true},{"fieldname":"option_label","label":"Option Label","fieldtype":"Data","required":true,"in_list_view":true,"search_index":true},{"fieldname":"item_code","label":"Item","fieldtype":"Link","options":"Item","in_list_view":true,"in_standard_filter":true},{"fieldname":"item_group","label":"Item Group","fieldtype":"Link","options":"Item Group","in_list_view":true,"in_standard_filter":true},{"fieldname":"conditions","label":"Conditions","fieldtype":"JSON","description":"Optional array of generic fact conditions."},{"fieldname":"price_variant","label":"Price Variant","fieldtype":"Data","default":"STANDARD","required":true,"in_list_view":true},{"fieldname":"discount_basis_variant","label":"Discount Basis Variant","fieldtype":"Data","default":"STANDARD","required":true},{"fieldname":"sales_mode","label":"Sales Mode","fieldtype":"Data","description":"Optional downstream geometry/commercial mode; vertical display values are configured by the app."},{"fieldname":"sales_package","label":"Sales Package","fieldtype":"Data","description":"Optional package reference. PR3 upgrades this to a Link when Sales Package metadata is installed."},{"fieldname":"is_default","label":"Default","fieldtype":"Check","default":0},{"fieldname":"priority","label":"Priority","fieldtype":"Int","default":0},{"fieldname":"disabled","label":"Disabled","fieldtype":"Check","default":0,"in_list_view":true,"in_standard_filter":true}],"permissions":[{"role":"Sales Manager","read":true,"write":true,"create":true,"print":true,"report":true,"import":true,"export":true},{"role":"Sales User","read":true,"write":false,"create":false,"print":true,"report":true,"export":true},{"role":"System Manager","read":true,"write":true,"create":true,"print":true,"report":true,"import":true,"export":true}],"custom":false}',
0,'migration-0118','2026-08-11T00:00:00.000Z'
FROM tenants;

-- Operator-facing option plus hidden technical snapshots. Keep these fields generic so the
-- same contracts can be used by Quotation, Sales Order and Sales Invoice.
UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_option","label":"Phương án bán","fieldtype":"Link","options":"Sales Option","in_list_view":true,"in_standard_filter":true,"surface":"quick"}')),
    revision=revision+1,modified_by='migration-0118',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_option');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_option_code","label":"Sales Option Code","fieldtype":"Data","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0118',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_option_code');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_option_label","label":"Sales Option Label","fieldtype":"Data","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0118',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_option_label');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_option_version","label":"Sales Option Version","fieldtype":"Int","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0118',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_option_version');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"price_variant","label":"Price Variant","fieldtype":"Data","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0118',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='price_variant');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"discount_basis_variant","label":"Discount Basis Variant","fieldtype":"Data","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0118',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='discount_basis_variant');

UPDATE doctype_definitions
SET metadata_json = json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"discount_basis_item_price","label":"Discount Basis Item Price","fieldtype":"Data","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0118',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='discount_basis_item_price');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.revision',revision)
WHERE doctype IN ('Item Price','Sales Option','Quotation Item','Sales Order Item','Sales Invoice Item')
  AND json_valid(metadata_json)
  AND COALESCE(json_extract(metadata_json,'$.revision'),-1)<>revision;
