-- Operator metadata for the locked Sales architecture.
-- No AlumDoor product names/codes/percentages belong here.

-- Item declares how a direct sales line derives its transaction quantity from generic facts.
UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_qty_basis","label":"Sales Quantity Basis","fieldtype":"Select","options":"DIRECT\nAREA\nHEIGHT_X_SETS\nWIDTH_X_SETS\nLENGTH_X_PIECES\nSET_COUNT\nPIECES","default":"DIRECT","description":"Generic transaction-quantity basis used by metadata-driven sales forms."}')),
    revision=revision+1,modified_by='migration-0120',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype='Item' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_qty_basis');

-- Snapshot the quantity authority on transaction rows; old documents remain readable.
UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"sales_qty_basis","label":"Sales Quantity Basis","fieldtype":"Data","read_only":true,"hidden":true,"surface":"internal"}')),
    revision=revision+1,modified_by='migration-0120',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item','Sales Invoice Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_qty_basis');

-- Operator-visible commercial projections. Policy percent/basis/source remain internal snapshots.
UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"discount_amount","label":"Tiền CK","fieldtype":"Currency","read_only":true,"in_list_view":true,"description":"Server-authoritative monetary discount for this line."}')),
    revision=revision+1,modified_by='migration-0120',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='discount_amount');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"adjustment_amount","label":"Phụ thu","fieldtype":"Currency","read_only":true,"in_list_view":true,"description":"Server-authoritative Pricing Rule adjustments for this line."}')),
    revision=revision+1,modified_by='migration-0120',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='adjustment_amount');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"net_amount","label":"Thành tiền","fieldtype":"Currency","read_only":true,"in_list_view":true,"description":"Gross minus policy discount plus adjustments."}')),
    revision=revision+1,modified_by='migration-0120',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item') AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='net_amount');

-- Percentage remains auditable but is no longer an operator-facing editable column.
UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,
      '$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_percentage' LIMIT 1) || '].hidden',1,
      '$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_percentage' LIMIT 1) || '].in_list_view',0,
      '$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_percentage' LIMIT 1) || '].read_only',1),
    revision=revision+1,modified_by='migration-0120',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype IN ('Quotation Item','Sales Order Item') AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='discount_percentage')
  AND COALESCE(json_extract(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_percentage' LIMIT 1) || '].hidden'),0)<>1;

-- Sales Option already resolves package as an authority; make the metadata relation explicit.
UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,
      '$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || '].fieldtype','Link',
      '$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || '].options','Sales Package'),
    revision=revision+1,modified_by='migration-0120',modified_at='2026-08-11T00:00:00.000Z'
WHERE doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') f WHERE json_extract(f.value,'$.fieldname')='sales_package');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.revision',revision)
WHERE doctype IN ('Item','Sales Option','Quotation Item','Sales Order Item','Sales Invoice Item')
  AND json_valid(metadata_json)
  AND COALESCE(json_extract(metadata_json,'$.revision'),-1)<>revision;
