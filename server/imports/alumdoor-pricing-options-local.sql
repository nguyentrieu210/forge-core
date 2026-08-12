-- Alumdoor local price-option metadata and initial operator catalog.

INSERT INTO doctype_definitions(
  tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,
  metadata_json,disabled,modified_by,modified_at
)
VALUES(
  'demo','Item Price','Alumdoor',
  0,0,0,
  COALESCE((SELECT revision + 1 FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Item Price'), 1),
  json_set(json('{"name":"Item Price","kind":"master","label":"Đơn giá theo bảng giá","module":"Alumdoor","is_child":false,"is_tree":false,"is_single":false,"is_submittable":false,"track_changes":true,"allow_rename":false,"autoname":"format:{price_list}:{item_code}:{uom}:{price_variant}","title_field":"item_code","search_fields":["item_code","sales_option"],"fields":[{"fieldname":"price_list","label":"Bảng giá","fieldtype":"Link","options":"Price List","required":true,"in_list_view":true,"in_standard_filter":true,"valueSource":"user","editMode":"editable","surface":"quick","serverEnforced":false,"idx":1},{"fieldname":"item_code","label":"Mã hàng","fieldtype":"Link","options":"Item","required":true,"in_list_view":true,"in_standard_filter":true,"valueSource":"user","editMode":"editable","surface":"quick","serverEnforced":false,"idx":2},{"label":"Nhóm sản phẩm","fieldname":"item_group","fieldtype":"Link","options":"Item Group","fetch_from":"item_code.item_group","read_only":true,"depends_on":"eval:false","link_filters":"{\"is_group\":0,\"disabled\":0}","valueSource":"link","editMode":"readonly","surface":"expanded","serverEnforced":true,"idx":3},{"label":"ĐVT áp dụng","fieldname":"uom","fieldtype":"Link","options":"UOM","required":true,"fetch_from":"item_code.default_sales_uom","description":"Đơn giá chỉ áp dụng khi dòng bán dùng đúng đơn vị này.","in_list_view":true,"in_standard_filter":true,"valueSource":"link","editMode":"editable","surface":"quick","serverEnforced":false,"dirtyGuard":"preserve_user_value","idx":4},{"label":"Phương án bán","fieldname":"sales_option","fieldtype":"Link","options":"Sales Option","in_list_view":true,"in_standard_filter":true,"link_filters":"[[\"Sales Option\",\"disabled\",\"=\",0],[\"Sales Option\",\"item_group\",\"=\",\"eval:doc.item_group\"]]","description":"Để trống nếu mặt hàng chỉ có một giá bán.","valueSource":"user","editMode":"editable","surface":"expanded","serverEnforced":false,"idx":5},{"label":"Mã giá","fieldname":"price_variant","fieldtype":"Data","default":"STANDARD","required":true,"read_only":true,"depends_on":"eval:false","fetch_from":"sales_option.price_variant","valueSource":"link","editMode":"readonly","surface":"expanded","serverEnforced":true,"idx":6},{"fieldname":"rate","label":"Đơn giá","fieldtype":"Currency","required":true,"in_list_view":true,"in_standard_filter":false,"valueSource":"user","editMode":"editable","surface":"quick","serverEnforced":false,"idx":7},{"fieldname":"currency","label":"Tiền tệ","fieldtype":"Link","options":"Currency","required":true,"hidden":true,"default":"VND","valueSource":"default","editMode":"hidden","surface":"internal","serverEnforced":true,"idx":8},{"fieldname":"note","label":"Ghi chú","fieldtype":"Data","valueSource":"user","editMode":"editable","surface":"expanded","serverEnforced":false,"idx":9},{"fieldname":"disabled","label":"Ngừng áp dụng","fieldtype":"Check","valueSource":"user","editMode":"editable","surface":"expanded","serverEnforced":false,"idx":10}],"viewPolicy":{"list":{"enabled":true,"columns":["price_list","item_code","uom","sales_option","rate"]},"form":{"enabled":true,"fields":["price_list","item_code","item_group","uom","sales_option","price_variant","rate","note","disabled"]},"quickEntry":{"enabled":true,"fields":["price_list","item_code","uom","rate"]},"kanban":{"enabled":false},"calendar":{"enabled":false},"gantt":{"enabled":false},"chart":{"enabled":false},"mobile":{}},"permissions":[{"role":"Chủ xưởng","read":true,"write":true,"create":true,"print":true,"email":true,"report":true,"export":true},{"role":"Kinh doanh","read":true,"print":true,"email":true,"report":true,"export":true},{"role":"Kế toán","read":true,"write":true,"create":true,"print":true,"email":true,"report":true,"export":true},{"role":"System Manager","read":true,"write":true,"create":true,"submit":true,"cancel":true,"amend":true,"print":true,"email":true,"report":true,"export":true}],"revision":1}'),'$.revision',COALESCE((SELECT revision + 1 FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Item Price'), 1)),
  0,'codex-local','2026-08-12T01:53:48.772Z'
)
ON CONFLICT(tenant_id,doctype) DO UPDATE SET
  module=excluded.module,is_custom=excluded.is_custom,is_submittable=excluded.is_submittable,
  is_child=excluded.is_child,revision=excluded.revision,metadata_json=excluded.metadata_json,
  disabled=0,modified_by=excluded.modified_by,modified_at=excluded.modified_at;

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='option_code' LIMIT 1) || ']' || '.label','Mã phương án','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='option_code' LIMIT 1) || ']' || '.surface','quick')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='option_code');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='option_label' LIMIT 1) || ']' || '.label','Tên phương án','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='option_label' LIMIT 1) || ']' || '.surface','quick')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='option_label');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.label','Chỉ áp dụng cho mặt hàng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_code');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.label','Nhóm sản phẩm áp dụng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group' LIMIT 1) || ']' || '.surface','quick')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='item_group');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.label','Điều kiện kỹ thuật','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='price_variant' LIMIT 1) || ']' || '.label','Mã giá','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='price_variant' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='price_variant' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='price_variant');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_basis_variant' LIMIT 1) || ']' || '.label','Giá gốc tính chiết khấu','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_basis_variant' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_basis_variant' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='discount_basis_variant');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_mode' LIMIT 1) || ']' || '.label','Chế độ bán','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_mode' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_mode' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_mode');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.label','Gói bán hàng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='sales_package');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='is_default' LIMIT 1) || ']' || '.label','Mặc định','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='is_default' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='is_default');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='priority' LIMIT 1) || ']' || '.label','Độ ưu tiên','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='priority' LIMIT 1) || ']' || '.hidden',json('true'),'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='priority' LIMIT 1) || ']' || '.surface','internal')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='priority');

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='disabled' LIMIT 1) || ']' || '.label','Ngừng dùng','$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='disabled' LIMIT 1) || ']' || '.surface','expanded')
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='disabled');

UPDATE doctype_definitions
SET revision=revision+1,
    metadata_json=json_set(metadata_json,'$.label','Phương án bán','$.viewPolicy',json('{"list":{"enabled":true,"columns":["option_label","item_group","item_code","is_default","disabled"]},"form":{"enabled":true,"fields":["option_code","option_label","item_group","item_code","is_default","disabled"]},"quickEntry":{"enabled":true,"fields":["option_code","option_label","item_group"]},"kanban":{"enabled":false},"calendar":{"enabled":false},"gantt":{"enabled":false},"chart":{"enabled":false}}'),'$.permissions',json('[{"role":"Chủ xưởng","read":true,"write":true,"create":true,"print":true,"report":true,"import":true,"export":true},{"role":"Kinh doanh","read":true,"write":false,"create":false,"print":true,"report":true,"export":true},{"role":"Kế toán","read":true,"write":false,"create":false,"print":true,"report":true,"export":true},{"role":"System Manager","read":true,"write":true,"create":true,"print":true,"report":true,"import":true,"export":true}]')),
    modified_by='codex-local',modified_at='2026-08-12T01:53:48.772Z'
WHERE tenant_id='demo' AND doctype='Sales Option' AND json_valid(metadata_json);

UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.revision',revision)
WHERE tenant_id='demo' AND doctype IN ('Item Price','Sales Option') AND json_valid(metadata_json);

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Sales Option:DUC-CHI-LA','Sales Option','DUC-CHI-LA','dev@example.com',0,'Draft',1,
  '2026-08-12T01:53:48.772Z','2026-08-12T01:53:48.772Z','codex-local',
  json_set(json('{"option_code":"DUC-CHI-LA","option_label":"Chỉ lá","item_group":"Cửa CN Đức","price_variant":"STANDARD","discount_basis_variant":"STANDARD","is_default":true,"priority":100,"disabled":false}'),'$._metadata_revision',(SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Sales Option'))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-CHI-LA','Chỉ lá','DUC-CHI-LA Chỉ lá Cửa CN Đức','2026-08-12T01:53:48.772Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Sales Option:DUC-TANG-RAY','Sales Option','DUC-TANG-RAY','dev@example.com',0,'Draft',1,
  '2026-08-12T01:53:48.772Z','2026-08-12T01:53:48.772Z','codex-local',
  json_set(json('{"option_code":"DUC-TANG-RAY","option_label":"Tặng ray","item_group":"Cửa CN Đức","price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","priority":90,"disabled":false}'),'$._metadata_revision',(SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Sales Option'))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY','Tặng ray','DUC-TANG-RAY Tặng ray Cửa CN Đức','2026-08-12T01:53:48.772Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Sales Option:UC-KEO-TAY','Sales Option','UC-KEO-TAY','dev@example.com',0,'Draft',1,
  '2026-08-12T01:53:48.772Z','2026-08-12T01:53:48.772Z','codex-local',
  json_set(json('{"option_code":"UC-KEO-TAY","option_label":"Kéo tay","item_group":"Cửa tấm liền Úc","price_variant":"HAND_PULL","discount_basis_variant":"HAND_PULL","is_default":true,"priority":100,"disabled":false}'),'$._metadata_revision',(SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Sales Option'))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','UC-KEO-TAY','Kéo tay','UC-KEO-TAY Kéo tay Cửa tấm liền Úc','2026-08-12T01:53:48.772Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Sales Option:UC-MOTOR-NGOAI','Sales Option','UC-MOTOR-NGOAI','dev@example.com',0,'Draft',1,
  '2026-08-12T01:53:48.772Z','2026-08-12T01:53:48.772Z','codex-local',
  json_set(json('{"option_code":"UC-MOTOR-NGOAI","option_label":"Motor ngoài","item_group":"Cửa tấm liền Úc","price_variant":"EXTERNAL_MOTOR","discount_basis_variant":"EXTERNAL_MOTOR","priority":90,"disabled":false}'),'$._metadata_revision',(SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Sales Option'))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','UC-MOTOR-NGOAI','Motor ngoài','UC-MOTOR-NGOAI Motor ngoài Cửa tấm liền Úc','2026-08-12T01:53:48.772Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Sales Option:DL-TACH-MON','Sales Option','DL-TACH-MON','dev@example.com',0,'Draft',1,
  '2026-08-12T01:53:48.772Z','2026-08-12T01:53:48.772Z','codex-local',
  json_set(json('{"option_code":"DL-TACH-MON","option_label":"Tách món","item_group":"Cửa Đài Loan","price_variant":"STANDARD","discount_basis_variant":"STANDARD","is_default":true,"priority":100,"disabled":false}'),'$._metadata_revision',(SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Sales Option'))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DL-TACH-MON','Tách món','DL-TACH-MON Tách món Cửa Đài Loan','2026-08-12T01:53:48.772Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Sales Option:DL-TRON-BO','Sales Option','DL-TRON-BO','dev@example.com',0,'Draft',1,
  '2026-08-12T01:53:48.772Z','2026-08-12T01:53:48.772Z','codex-local',
  json_set(json('{"option_code":"DL-TRON-BO","option_label":"Trọn bộ","item_group":"Cửa Đài Loan","price_variant":"FULL_SET","discount_basis_variant":"FULL_SET","priority":90,"disabled":false}'),'$._metadata_revision',(SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Sales Option'))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DL-TRON-BO','Trọn bộ','DL-TRON-BO Trọn bộ Cửa Đài Loan','2026-08-12T01:53:48.772Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Sales Option:LUOI-CHUA-PHU-KIEN','Sales Option','LUOI-CHUA-PHU-KIEN','dev@example.com',0,'Draft',1,
  '2026-08-12T01:53:48.772Z','2026-08-12T01:53:48.772Z','codex-local',
  json_set(json('{"option_code":"LUOI-CHUA-PHU-KIEN","option_label":"Chưa phụ kiện","item_group":"Cửa Lưới","price_variant":"STANDARD","discount_basis_variant":"STANDARD","is_default":true,"priority":100,"disabled":false}'),'$._metadata_revision',(SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Sales Option'))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','LUOI-CHUA-PHU-KIEN','Chưa phụ kiện','LUOI-CHUA-PHU-KIEN Chưa phụ kiện Cửa Lưới','2026-08-12T01:53:48.772Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Sales Option:LUOI-CO-PHU-KIEN','Sales Option','LUOI-CO-PHU-KIEN','dev@example.com',0,'Draft',1,
  '2026-08-12T01:53:48.772Z','2026-08-12T01:53:48.772Z','codex-local',
  json_set(json('{"option_code":"LUOI-CO-PHU-KIEN","option_label":"Có phụ kiện","item_group":"Cửa Lưới","price_variant":"WITH_ACCESSORIES","discount_basis_variant":"WITH_ACCESSORIES","priority":90,"disabled":false}'),'$._metadata_revision',(SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Sales Option'))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','LUOI-CO-PHU-KIEN','Có phụ kiện','LUOI-CO-PHU-KIEN Có phụ kiện Cửa Lưới','2026-08-12T01:53:48.772Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;
