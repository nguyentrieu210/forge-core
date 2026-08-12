UPDATE doctype_definitions
SET metadata_json = json_set(
  metadata_json,
  '$.fields[1].link_filters',
  '{"item_code":"eval:doc.item_code","disabled":0}'
),
revision = revision + 1,
modified_at = datetime('now')
WHERE tenant_id = 'demo' AND doctype = 'Sales Order Item';
