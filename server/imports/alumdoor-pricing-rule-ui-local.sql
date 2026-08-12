-- Alumdoor local Pricing Rule operator UI. Safe to rerun.

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"pricing_scope","label":"Phạm vi áp dụng","fieldtype":"Link","options":"Pricing Scope"}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='pricing_scope');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"item_group","label":"Nhóm sản phẩm","fieldtype":"Link","options":"Item Group"}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"currency","label":"Tiền tệ","fieldtype":"Link","options":"Currency"}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='currency');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"effect_type","label":"Loại áp dụng","fieldtype":"Select","options":"RATE_OVERRIDE\nDISCOUNT_PERCENT\nDISCOUNT_AMOUNT\nADJUSTMENT","default":"RATE_OVERRIDE","required":true}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"discount_amount","label":"Số tiền giảm","fieldtype":"Currency","non_negative":true}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_amount');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"adjustment_basis","label":"Tính phụ thu theo","fieldtype":"Select","options":"FIXED\nPRICED_QTY\nAREA_SQM\nLENGTH_M\nSET_COUNT","default":"FIXED"}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_basis');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"adjustment_rate","label":"Đơn giá phụ thu","fieldtype":"Currency","non_negative":true}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_rate');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"exclusive_group","label":"Nhóm loại trừ","fieldtype":"Data"}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='exclusive_group');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"taxable","label":"Tính thuế","fieldtype":"Check","default":true}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='taxable');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"discountable","label":"Được chiết khấu","fieldtype":"Check","default":false}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discountable');

UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',json('{"fieldname":"conditions","label":"Điều kiện bổ sung","fieldtype":"JSON"}')),
    revision=revision+1,modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='title' LIMIT 1) || ']' || '.label','Tên chính sách','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='title' LIMIT 1) || ']' || '.surface','quick')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='title');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type' LIMIT 1) || ']' || '.label','Loại áp dụng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type' LIMIT 1) || ']' || '.default','RATE_OVERRIDE','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type' LIMIT 1) || ']' || '.required',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type' LIMIT 1) || ']' || '.surface','quick','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type' LIMIT 1) || ']' || '.description','Chọn giá riêng, giảm giá hoặc phụ thu.')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='price_list' LIMIT 1) || ']' || '.label','Chỉ áp cho bảng giá','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='price_list' LIMIT 1) || ']' || '.surface','quick')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='price_list');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='pricing_scope' LIMIT 1) || ']' || '.label','Phạm vi áp dụng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='pricing_scope' LIMIT 1) || ']' || '.surface','quick','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='pricing_scope' LIMIT 1) || ']' || '.description','Chọn danh sách mặt hàng hoặc nhóm hàng đã khai báo ở Danh mục.')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='pricing_scope');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.label','Mặt hàng riêng (cũ)','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.read_only',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.label','Nhóm hàng riêng (cũ)','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.read_only',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='party_type' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='party_type' LIMIT 1) || ']' || '.read_only',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='party_type' LIMIT 1) || ']' || '.default','Customer','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='party_type' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='party_type');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='party' LIMIT 1) || ']' || '.label','Chỉ áp cho khách hàng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='party' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='party');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='customer_group' LIMIT 1) || ']' || '.label','Chỉ áp cho nhóm khách','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='customer_group' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='customer_group');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='min_qty' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='min_qty' LIMIT 1) || ']' || '.read_only',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='min_qty' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='min_qty');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='max_qty' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='max_qty' LIMIT 1) || ']' || '.read_only',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='max_qty' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='max_qty');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_from' LIMIT 1) || ']' || '.label','Hiệu lực từ','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_from' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_from');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_upto' LIMIT 1) || ']' || '.label','Hiệu lực đến','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_upto' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_upto');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='rate' LIMIT 1) || ']' || '.label','Giá riêng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='rate' LIMIT 1) || ']' || '.depends_on','eval:doc.effect_type == "RATE_OVERRIDE"','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='rate' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='rate');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_percentage' LIMIT 1) || ']' || '.label','Tỷ lệ giảm (%)','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_percentage' LIMIT 1) || ']' || '.depends_on','eval:doc.effect_type == "DISCOUNT_PERCENT"','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_percentage' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_percentage');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_amount' LIMIT 1) || ']' || '.label','Số tiền giảm','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_amount' LIMIT 1) || ']' || '.depends_on','eval:doc.effect_type == "DISCOUNT_AMOUNT"','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_amount' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_amount');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_basis' LIMIT 1) || ']' || '.label','Tính phụ thu theo','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_basis' LIMIT 1) || ']' || '.depends_on','eval:doc.effect_type == "ADJUSTMENT"','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_basis' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_basis');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_rate' LIMIT 1) || ']' || '.label','Đơn giá phụ thu','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_rate' LIMIT 1) || ']' || '.depends_on','eval:doc.effect_type == "ADJUSTMENT"','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_rate' LIMIT 1) || ']' || '.surface','expanded','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_rate' LIMIT 1) || ']' || '.description','Mức phụ thu cho mỗi đơn vị đã chọn.')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='adjustment_rate');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.label','Điều kiện bổ sung','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.hidden',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.surface','expanded','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.form_region','full','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.description','Ví dụ: diện tích ≥ 10 m², màu = Vân gỗ.')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='exclusive_group' LIMIT 1) || ']' || '.label','Nhóm loại trừ','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='exclusive_group' LIMIT 1) || ']' || '.depends_on','eval:doc.effect_type == "ADJUSTMENT"','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='exclusive_group' LIMIT 1) || ']' || '.surface','expanded','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='exclusive_group' LIMIT 1) || ']' || '.description','Các phụ thu cùng nhóm chỉ lấy luật ưu tiên nhất.')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='exclusive_group');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='taxable' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='taxable' LIMIT 1) || ']' || '.read_only',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='taxable' LIMIT 1) || ']' || '.default',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='taxable' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='taxable');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discountable' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discountable' LIMIT 1) || ']' || '.read_only',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discountable' LIMIT 1) || ']' || '.default',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discountable' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discountable');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='priority' LIMIT 1) || ']' || '.label','Độ ưu tiên','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='priority' LIMIT 1) || ']' || '.read_only',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='priority' LIMIT 1) || ']' || '.default',0,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='priority' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='priority' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='priority');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='disabled' LIMIT 1) || ']' || '.label','Ngừng áp dụng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='disabled' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='disabled');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields',(
  SELECT json_group_array(json(value))
  FROM (
    SELECT value FROM json_each(doctype_definitions.metadata_json,'$.fields')
    ORDER BY CASE json_extract(value,'$.fieldname')
      WHEN 'title' THEN 10 WHEN 'effect_type' THEN 20
      WHEN 'price_list' THEN 30 WHEN 'pricing_scope' THEN 40 WHEN 'item_code' THEN 50 WHEN 'item_group' THEN 60
      WHEN 'party_type' THEN 70 WHEN 'party' THEN 80 WHEN 'customer_group' THEN 90
      WHEN 'valid_from' THEN 90 WHEN 'valid_upto' THEN 100
      WHEN 'rate' THEN 110 WHEN 'discount_percentage' THEN 120 WHEN 'discount_amount' THEN 130
      WHEN 'adjustment_basis' THEN 140 WHEN 'adjustment_rate' THEN 150 WHEN 'conditions' THEN 160
      WHEN 'exclusive_group' THEN 170 WHEN 'disabled' THEN 180
      ELSE 900 END, key
  )
))
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json);

UPDATE doctype_definitions
SET revision=revision+1,
    metadata_json=json_set(metadata_json,'$.label','Chính sách giá','$.viewPolicy',json('{"list":{"enabled":true,"columns":["title","effect_type","price_list","pricing_scope","valid_upto","disabled"]},"form":{"enabled":true,"fields":["title","effect_type","price_list","pricing_scope","party","customer_group","valid_from","valid_upto","rate","discount_percentage","discount_amount","adjustment_basis","adjustment_rate","conditions","exclusive_group","disabled"]},"quickEntry":{"enabled":false,"fields":["title","effect_type"]},"kanban":{"enabled":false},"calendar":{"enabled":false},"gantt":{"enabled":false},"chart":{"enabled":false}}')),
    modified_by='codex-local',modified_at='2026-08-12T03:11:02.821Z'
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json);

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.revision',revision)
WHERE tenant_id='demo' AND doctype='Pricing Rule' AND json_valid(metadata_json);

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','RATE_OVERRIDE','Giá riêng','','2026-08-12T03:11:02.821Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','DISCOUNT_PERCENT','Giảm theo %','','2026-08-12T03:11:02.821Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','DISCOUNT_AMOUNT','Giảm tiền','','2026-08-12T03:11:02.821Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','ADJUSTMENT','Phụ thu','','2026-08-12T03:11:02.821Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','FIXED','Mức cố định','','2026-08-12T03:11:02.821Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','PRICED_QTY','Số lượng bán','','2026-08-12T03:11:02.821Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','AREA_SQM','Diện tích','','2026-08-12T03:11:02.821Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','LENGTH_M','Chiều dài','','2026-08-12T03:11:02.821Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','SET_COUNT','Số bộ','','2026-08-12T03:11:02.821Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;

UPDATE documents
SET payload_json=json_set(payload_json,'$.disabled',json('true'),'$._cleanup_reason','Chưa có đơn giá hoặc gói bán được duyệt'),
    version=version+1,modified_at='2026-08-12T03:11:02.821Z',modified_by='codex-local'
WHERE tenant_id='demo' AND doctype='Sales Option' AND name IN ('DUC-TANG-RAY','UC-KEO-TAY','UC-MOTOR-NGOAI','DL-TACH-MON','DL-TRON-BO','LUOI-CHUA-PHU-KIEN','LUOI-CO-PHU-KIEN')
  AND COALESCE(json_extract(payload_json,'$.disabled'),0)=0;
