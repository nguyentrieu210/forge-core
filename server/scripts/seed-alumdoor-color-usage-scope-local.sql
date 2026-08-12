-- Local-only Alumdoor catalogue correction. Safe to run repeatedly.
-- Existing colors remain available for both purchase and sales; THÔ is purchase-only.
UPDATE doctype_definitions
SET metadata_json = json_set(
      metadata_json,
      '$.revision', revision + 1,
      '$.fields', json((
        SELECT json_group_array(json(field_json))
        FROM (
          SELECT CAST(key AS INTEGER) * 2 AS sort_key,
                 CASE
                   WHEN CAST(key AS INTEGER) >= 3
                     THEN json_set(value, '$.idx', COALESCE(json_extract(value, '$.idx'), CAST(key AS INTEGER) + 1) + 1)
                   ELSE value
                 END AS field_json
          FROM json_each(doctype_definitions.metadata_json, '$.fields')
          UNION ALL
          SELECT 5 AS sort_key,
                 json_object(
                   'fieldname', 'usage_scope',
                   'label', 'Phạm vi giao dịch',
                   'fieldtype', 'Select',
                   'options', 'Mua hàng' || char(10) || 'Bán hàng' || char(10) || 'Mua & bán',
                   'required', json('true'),
                   'read_only', json('false'),
                   'hidden', json('false'),
                   'list_only', json('false'),
                   'allow_on_submit', json('false'),
                   'no_copy', json('false'),
                   'unique', json('false'),
                   'in_list_view', json('false'),
                   'in_standard_filter', json('true'),
                   'search_index', json('false'),
                   'permlevel', 0,
                   'default', 'Mua & bán',
                   'valueSource', 'default',
                   'editMode', 'editable',
                   'surface', 'quick',
                   'serverEnforced', json('false'),
                   'set_only_once', json('false'),
                   'non_negative', json('false'),
                   'not_nullable', json('false'),
                   'print_hide', json('false'),
                   'print_hide_if_no_value', json('false'),
                   'idx', 4
                 ) AS field_json
          ORDER BY sort_key
        )
      ))
    ),
    revision = revision + 1,
    modified_by = 'admin',
    modified_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE tenant_id = 'demo'
  AND doctype = 'Item Color'
  AND NOT EXISTS (
    SELECT 1
    FROM json_each(doctype_definitions.metadata_json, '$.fields')
    WHERE json_extract(value, '$.fieldname') = 'usage_scope'
  );

UPDATE documents
SET payload_json = json_set(
      payload_json,
      '$.usage_scope', CASE WHEN name = 'THÔ' THEN 'Mua hàng' ELSE 'Mua & bán' END
    ),
    version = version + 1,
    modified_by = 'admin',
    modified_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE tenant_id = 'demo'
  AND doctype = 'Item Color'
  AND COALESCE(json_extract(payload_json, '$.usage_scope'), '')
      <> CASE WHEN name = 'THÔ' THEN 'Mua hàng' ELSE 'Mua & bán' END;
