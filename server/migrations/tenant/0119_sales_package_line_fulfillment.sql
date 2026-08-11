-- Generic Sales Package + source-line fulfillment contract.
-- Vertical package names/components are data, never runtime literals.

WITH tenants AS (SELECT DISTINCT tenant_id FROM doctype_definitions)
INSERT OR IGNORE INTO doctype_definitions(
  tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,
  metadata_json,disabled,modified_by,modified_at
)
SELECT tenant_id,'Sales Package Item','Selling',0,0,1,1,
'{"name":"Sales Package Item","module":"Selling","is_submittable":false,"is_child":true,"revision":1,"fields":[{"fieldname":"component_key","label":"Component Key","fieldtype":"Data","required":true,"in_list_view":true},{"fieldname":"item_code","label":"Item","fieldtype":"Link","options":"Item","required":true,"in_list_view":true},{"fieldname":"uom","label":"UOM","fieldtype":"Link","options":"UOM","required":true,"in_list_view":true},{"fieldname":"qty_basis","label":"Quantity Basis","fieldtype":"Select","options":"FIXED\nHEIGHT\nWIDTH\nCUT_WIDTH\nAREA\nSET_COUNT\nLEAF_COUNT","default":"FIXED","required":true,"in_list_view":true},{"fieldname":"factor","label":"Factor","fieldtype":"Float","default":1,"required":true,"in_list_view":true},{"fieldname":"required","label":"Required","fieldtype":"Check","default":1},{"fieldname":"default_selected","label":"Default Selected","fieldtype":"Check","default":1},{"fieldname":"role","label":"Role","fieldtype":"Data"}],"permissions":[],"custom":false}',
0,'migration-0119','2026-08-11T00:00:00.000Z'
FROM tenants;

WITH tenants AS (SELECT DISTINCT tenant_id FROM doctype_definitions)
INSERT OR IGNORE INTO doctype_definitions(
  tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,
  metadata_json,disabled,modified_by,modified_at
)
SELECT tenant_id,'Sales Package','Selling',0,0,0,1,
'{"name":"Sales Package","module":"Selling","is_submittable":false,"is_child":false,"track_changes":true,"revision":1,"autoname":"field:package_code","title_field":"package_name","search_fields":["package_code","package_name","item_code"],"fields":[{"fieldname":"package_code","label":"Package Code","fieldtype":"Data","required":true,"unique":true,"in_list_view":true,"search_index":true},{"fieldname":"package_name","label":"Package Name","fieldtype":"Data","required":true,"in_list_view":true,"search_index":true},{"fieldname":"item_code","label":"Item","fieldtype":"Link","options":"Item","in_list_view":true,"in_standard_filter":true},{"fieldname":"item_group","label":"Item Group","fieldtype":"Link","options":"Item Group","in_list_view":true,"in_standard_filter":true},{"fieldname":"selection_mode","label":"Selection Mode","fieldtype":"Select","options":"ALL\nSELECTABLE","default":"ALL","required":true,"in_list_view":true},{"fieldname":"valid_from","label":"Valid From","fieldtype":"Date"},{"fieldname":"valid_upto","label":"Valid Upto","fieldtype":"Date"},{"fieldname":"disabled","label":"Disabled","fieldtype":"Check","default":0,"in_list_view":true,"in_standard_filter":true},{"fieldname":"items","label":"Components","fieldtype":"Table","options":"Sales Package Item","required":true}],"permissions":[{"role":"Sales Manager","read":true,"write":true,"create":true,"print":true,"report":true,"import":true,"export":true},{"role":"Sales User","read":true,"write":false,"create":false,"print":true,"report":true,"export":true},{"role":"System Manager","read":true,"write":true,"create":true,"print":true,"report":true,"import":true,"export":true}],"custom":false}',
0,'migration-0119','2026-08-11T00:00:00.000Z'
FROM tenants;

-- Frozen fulfillment authority on commercial lines.
UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_package","label":"Sales Package","fieldtype":"Link","options":"Sales Package","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0119',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_package');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_package_version","label":"Sales Package Version","fieldtype":"Int","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0119',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_package_version');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_package_checksum","label":"Sales Package Checksum","fieldtype":"Data","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0119',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_package_checksum');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_package_snapshot","label":"Sales Package Snapshot","fieldtype":"JSON","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0119',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_package_snapshot');

-- Source-line identity is mandatory for new SO-derived delivery/billing flows. Keep fields
-- optional in metadata for compatibility with standalone documents.
UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_order_row_id","label":"Sales Order Row","fieldtype":"Data","in_list_view":false,"description":"Canonical source Sales Order child row id."}')),
    revision=revision+1,modified_by='migration-0119',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Delivery Note Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_order_row_id');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_package_component_key","label":"Package Component","fieldtype":"Data","in_list_view":false,"description":"Frozen Sales Package component key when fulfilling a package line."}')),
    revision=revision+1,modified_by='migration-0119',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype='Delivery Note Item' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_package_component_key');

-- Additive sidecar keeps legacy item-code fulfillment projections intact while new flows
-- gain exact source-line/component accounting. The kernel writes both projections.
CREATE TABLE IF NOT EXISTS sales_line_fulfillment_entries (
  tenant_id TEXT NOT NULL,
  line_key TEXT NOT NULL,
  sales_order TEXT NOT NULL,
  sales_order_line_key TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('Delivery','Billing')),
  package_component_key TEXT NOT NULL DEFAULT '',
  item_code TEXT NOT NULL,
  qty_micros INTEGER NOT NULL CHECK(qty_micros <> 0),
  posting_at TEXT NOT NULL,
  PRIMARY KEY (tenant_id, line_key)
);

CREATE INDEX IF NOT EXISTS idx_sales_line_fulfillment_source
ON sales_line_fulfillment_entries(tenant_id,sales_order,kind,sales_order_line_key,package_component_key);

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.revision',revision)
WHERE doctype IN ('Sales Package','Sales Package Item','Quotation Item','Sales Order Item','Sales Invoice Item','Delivery Note Item')
  AND json_valid(metadata_json)
  AND COALESCE(json_extract(metadata_json,'$.revision'),-1)<>revision;
