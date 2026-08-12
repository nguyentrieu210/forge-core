-- Alumdoor local Sales Package operator metadata. No package records are seeded.

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='package_code' LIMIT 1) || ']' || '.label','Mã gói','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='package_code' LIMIT 1) || ']' || '.read_only',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='package_code' LIMIT 1) || ']' || '.read_only_depends_on','eval: !doc.__islocal','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='package_code' LIMIT 1) || ']' || '.in_list_view',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='package_code' LIMIT 1) || ']' || '.surface','expanded','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='package_code' LIMIT 1) || ']' || '.description','Hệ thống tự sinh; dùng để liên kết ổn định với phương án bán.')
WHERE tenant_id='demo' AND doctype='Sales Package' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='package_code');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='package_name' LIMIT 1) || ']' || '.label','Tên gói','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='package_name' LIMIT 1) || ']' || '.surface','quick')
WHERE tenant_id='demo' AND doctype='Sales Package' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='package_name');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.label','Mặt hàng bán áp dụng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.required',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.surface','quick','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.link_filters','[["Item","inventory_mode","=","Thành phẩm theo m2"],["Item","is_sales_item","=",1],["Item","disabled","=",0]]','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.description','Một gói gắn với đúng một mã hàng để giao và trả hàng không bị nhầm.')
WHERE tenant_id='demo' AND doctype='Sales Package' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.label','Nhóm sản phẩm','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.fetch_from','item_code.item_group','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.read_only',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.depends_on','eval:false','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.in_list_view',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.in_standard_filter',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.surface','internal','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.link_filters','{"is_group":0,"disabled":0}')
WHERE tenant_id='demo' AND doctype='Sales Package' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='selection_mode' LIMIT 1) || ']' || '.label','Cách giao','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='selection_mode' LIMIT 1) || ']' || '.default','ALL','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='selection_mode' LIMIT 1) || ']' || '.read_only',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='selection_mode' LIMIT 1) || ']' || '.depends_on','eval:false','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='selection_mode' LIMIT 1) || ']' || '.in_list_view',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='selection_mode' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Package' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='selection_mode');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_from' LIMIT 1) || ']' || '.label','Hiệu lực từ','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_from' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_from' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Package' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_from');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_upto' LIMIT 1) || ']' || '.label','Hiệu lực đến','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_upto' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_upto' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Package' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='valid_upto');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='disabled' LIMIT 1) || ']' || '.label','Ngừng dùng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='disabled' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Sales Package' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='disabled');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='items' LIMIT 1) || ']' || '.label','Các món phải giao','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='items' LIMIT 1) || ']' || '.surface','quick','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='items' LIMIT 1) || ']' || '.description','Khai cả mặt hàng chính và mọi món giao kèm. Đây không phải định mức sản xuất.')
WHERE tenant_id='demo' AND doctype='Sales Package' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='items');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='component_key' LIMIT 1) || ']' || '.label','Mã dòng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='component_key' LIMIT 1) || ']' || '.depends_on','eval:false','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='component_key' LIMIT 1) || ']' || '.surface','internal','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='component_key' LIMIT 1) || ']' || '.description','Hệ thống tự sinh để theo dõi giao/đổi/trả đúng thành phần.')
WHERE tenant_id='demo' AND doctype='Sales Package Item' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='component_key');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.label','Mặt hàng giao','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.surface','quick','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.link_filters','[["Item","is_sales_item","=",1],["Item","disabled","=",0]]')
WHERE tenant_id='demo' AND doctype='Sales Package Item' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='uom' LIMIT 1) || ']' || '.label','ĐVT giao','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='uom' LIMIT 1) || ']' || '.surface','quick','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='uom' LIMIT 1) || ']' || '.description','Tự điền theo mặt hàng; có thể đổi khi cách giao dùng ĐVT khác.')
WHERE tenant_id='demo' AND doctype='Sales Package Item' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='uom');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='qty_basis' LIMIT 1) || ']' || '.label','Tính số lượng theo','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='qty_basis' LIMIT 1) || ']' || '.surface','quick','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='qty_basis' LIMIT 1) || ']' || '.description','Cố định, theo kích thước cửa, diện tích, số bộ hoặc số lá.')
WHERE tenant_id='demo' AND doctype='Sales Package Item' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='qty_basis');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='factor' LIMIT 1) || ']' || '.label','Hệ số / số lượng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='factor' LIMIT 1) || ']' || '.surface','quick','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='factor' LIMIT 1) || ']' || '.description','Cố định: nhập số lượng. Theo kích thước: nhập hệ số nhân.')
WHERE tenant_id='demo' AND doctype='Sales Package Item' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='factor');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='required' LIMIT 1) || ']' || '.label','Bắt buộc giao','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='required' LIMIT 1) || ']' || '.default',1,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='required' LIMIT 1) || ']' || '.depends_on','eval:false','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='required' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Package Item' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='required');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='default_selected' LIMIT 1) || ']' || '.label','Chọn sẵn','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='default_selected' LIMIT 1) || ']' || '.default',1,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='default_selected' LIMIT 1) || ']' || '.depends_on','eval:false','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='default_selected' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Package Item' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='default_selected');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='role' LIMIT 1) || ']' || '.label','Vai trò kỹ thuật','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='role' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='role' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Package Item' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='role');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='option_code' LIMIT 1) || ']' || '.in_list_view',json('false'))
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='option_code');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.label','Điều kiện áp dụng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.hidden',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.surface','expanded','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.form_region','full','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.description','Khai luật để phương án chỉ áp dụng đúng trường hợp, ví dụ diện tích từ 10 m².')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.label','Gói giao kèm','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.hidden',json('false'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.depends_on','eval:doc.item_code','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.surface','expanded','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.in_list_view',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.in_standard_filter',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.link_filters','[["Sales Package","item_code","=","eval:doc.item_code"],["Sales Package","disabled","=",0]]','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.description','Chỉ chọn khi phương án áp dụng cho một mã hàng cụ thể.')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package');

UPDATE doctype_definitions
SET metadata_json=json_remove(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || '].ui_control')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions');

UPDATE doctype_definitions
SET revision=revision+1,
    metadata_json=json_set(metadata_json,'$.label','Gói bán hàng','$.viewPolicy',json('{"list":{"enabled":true,"columns":["package_name","item_code","disabled"]},"form":{"enabled":true,"fields":["package_code","package_name","item_code","item_group","selection_mode","items","disabled"]},"quickEntry":{"enabled":false,"fields":["package_name","item_code","items"]},"kanban":{"enabled":false},"calendar":{"enabled":false},"gantt":{"enabled":false},"chart":{"enabled":false}}'),'$.permissions',json('[{"role":"Chủ xưởng","read":true,"write":true,"create":true,"print":true,"report":true,"import":true,"export":true},{"role":"Kinh doanh","read":true,"write":false,"create":false,"print":true,"report":true,"export":true},{"role":"Kế toán","read":true,"write":false,"create":false,"print":true,"report":true,"export":true},{"role":"System Manager","read":true,"write":true,"create":true,"print":true,"report":true,"import":true,"export":true}]')),
    modified_by='codex-local',modified_at='2026-08-12T02:26:57.793Z'
WHERE tenant_id='demo' AND doctype='Sales Package' AND json_valid(metadata_json);

UPDATE doctype_definitions
SET revision=revision+1,
    metadata_json=json_set(metadata_json,'$.label','Món trong gói','$.viewPolicy',json('{"list":{"enabled":false,"columns":["item_code","uom","qty_basis","factor"]},"form":{"enabled":false,"fields":["component_key","item_code","uom","qty_basis","factor","required","default_selected"]},"quickEntry":{"enabled":false,"fields":["item_code","uom","qty_basis","factor"]},"kanban":{"enabled":false},"calendar":{"enabled":false},"gantt":{"enabled":false},"chart":{"enabled":false}}')),
    modified_by='codex-local',modified_at='2026-08-12T02:26:57.793Z'
WHERE tenant_id='demo' AND doctype='Sales Package Item' AND json_valid(metadata_json);

UPDATE doctype_definitions
SET revision=revision+1,
    metadata_json=json_set(metadata_json,'$.viewPolicy',json('{"list":{"enabled":true,"columns":["option_label","item_group","item_code","sales_package","is_default","disabled"]},"form":{"enabled":true,"fields":["option_code","option_label","item_group","item_code","conditions","sales_package","is_default","disabled"]},"quickEntry":{"enabled":true,"fields":["option_code","option_label","item_group"]},"kanban":{"enabled":false},"calendar":{"enabled":false},"gantt":{"enabled":false},"chart":{"enabled":false}}')),
    modified_by='codex-local',modified_at='2026-08-12T02:26:57.793Z'
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json);

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','ALL','Giao tất cả','','2026-08-12T02:26:57.793Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET
  translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','SELECTABLE','Cho chọn từng món','','2026-08-12T02:26:57.793Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET
  translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','FIXED','Số lượng cố định','','2026-08-12T02:26:57.793Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET
  translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','HEIGHT','Theo chiều cao','','2026-08-12T02:26:57.793Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET
  translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','WIDTH','Theo chiều rộng','','2026-08-12T02:26:57.793Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET
  translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','CUT_WIDTH','Theo rộng cắt lá','','2026-08-12T02:26:57.793Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET
  translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','AREA','Theo diện tích','','2026-08-12T02:26:57.793Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET
  translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','SET_COUNT','Theo số bộ','','2026-08-12T02:26:57.793Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET
  translated_text=excluded.translated_text,modified_at=excluded.modified_at;

INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES('demo','vi','LEAF_COUNT','Theo số lá','','2026-08-12T02:26:57.793Z')
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET
  translated_text=excluded.translated_text,modified_at=excluded.modified_at;

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.revision',revision)
WHERE tenant_id='demo' AND doctype IN ('Sales Package','Sales Package Item','Sales Option') AND json_valid(metadata_json);
