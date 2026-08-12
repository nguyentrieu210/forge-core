UPDATE doctype_definitions
SET metadata_json = json_set(
  metadata_json,
  '$.fields[' || (SELECT key FROM json_each(metadata_json, '$.fields') WHERE json_extract(value, '$.fieldname') = 'set_count' LIMIT 1) || '].label', 'Số lượng',
  '$.fields[' || (SELECT key FROM json_each(metadata_json, '$.fields') WHERE json_extract(value, '$.fieldname') = 'uom' LIMIT 1) || '].label', 'ĐVT',
  '$.fields[' || (SELECT key FROM json_each(metadata_json, '$.fields') WHERE json_extract(value, '$.fieldname') = 'qty' LIMIT 1) || '].label', 'Khối lượng',
  '$.fields[' || (SELECT key FROM json_each(metadata_json, '$.fields') WHERE json_extract(value, '$.fieldname') = 'rate' LIMIT 1) || '].label', 'Đơn giá'
),
revision = revision + 1,
modified_by = 'codex-local',
modified_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE tenant_id = 'demo'
  AND doctype = 'Sales Order Item'
  AND json_valid(metadata_json);
