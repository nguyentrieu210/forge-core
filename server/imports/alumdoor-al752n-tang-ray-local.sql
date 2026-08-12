-- Local review seed: Đức AL752N tặng ray. Safe to rerun.

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Sales Package:PKG-DUC-AL752N-TANG-RAY','Sales Package','PKG-DUC-AL752N-TANG-RAY','dev@example.com',0,'Draft',1,
  '2026-08-12T02:14:24.352Z','2026-08-12T02:14:24.352Z','codex-local',
  json_set(json('{"package_code":"PKG-DUC-AL752N-TANG-RAY","package_name":"Đức AL752N – Tặng ray (thử)","item_code":"TP-TD-AL752N","item_group":"Cửa CN Đức","selection_mode":"ALL","items":[{"component_key":"MON-001","item_code":"TP-TD-AL752N","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"MON-002","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng — 2 cây theo chiều cao"}],"disabled":false,"_seed_source":"verified-local-review-2026-08-12"}'),'$._metadata_revision',COALESCE((SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Sales Package'),1))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-AL752N-TANG-RAY','Đức AL752N – Tặng ray (thử)','TP-TD-AL752N; cửa theo diện tích; ray tặng 2 × chiều cao; áp dụng từ 10 m² qua phương án bán.','2026-08-12T02:14:24.352Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Sales Option:DUC-AL752N-TANG-RAY-10M2','Sales Option','DUC-AL752N-TANG-RAY-10M2','dev@example.com',0,'Draft',1,
  '2026-08-12T02:14:24.352Z','2026-08-12T02:14:24.352Z','codex-local',
  json_set(json('{"option_code":"DUC-AL752N-TANG-RAY-10M2","option_label":"Tặng ray (từ 10 m²)","item_code":"TP-TD-AL752N","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":10}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-AL752N-TANG-RAY","priority":100,"disabled":false,"_seed_source":"verified-local-review-2026-08-12"}'),'$._metadata_revision',COALESCE((SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Sales Option'),1))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-AL752N-TANG-RAY-10M2','Tặng ray (từ 10 m²)','TP-TD-AL752N; bảng giá có ray; tự giao cửa và ray khi diện tích từ 10 m².','2026-08-12T02:14:24.352Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL752N:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD-AL752N:m2:STANDARD','dev@example.com',0,'Draft',1,
  '2026-08-12T02:14:24.352Z','2026-08-12T02:14:24.352Z','codex-local',
  json_set(json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL752N","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-CHI-LA","price_variant":"STANDARD","rate":1626000,"currency":"VND","valid_from":"2026-01-01","note":"Nguồn danh mục sản phẩm 2026; seed thử combo Đức AL752N – tặng ray.","disabled":false,"_seed_source":"verified-local-review-2026-08-12"}'),'$._metadata_revision',COALESCE((SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Item Price'),1))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL752N:m2:STANDARD','Đức AL752N – Chỉ lá','Bảng giá 31/07/2026; TP-TD-AL752N; STANDARD; 1626000 VND/m².','2026-08-12T02:14:24.352Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  'demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL752N:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-TD-AL752N:m2:WITH_RAIL','dev@example.com',0,'Draft',1,
  '2026-08-12T02:14:24.352Z','2026-08-12T02:14:24.352Z','codex-local',
  json_set(json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL752N","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-AL752N-TANG-RAY-10M2","price_variant":"WITH_RAIL","rate":1701000,"currency":"VND","valid_from":"2026-01-01","note":"Nguồn danh mục sản phẩm 2026; seed thử combo Đức AL752N – tặng ray.","disabled":false,"_seed_source":"verified-local-review-2026-08-12"}'),'$._metadata_revision',COALESCE((SELECT revision FROM doctype_definitions WHERE tenant_id='demo' AND doctype='Item Price'),1))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL752N:m2:WITH_RAIL','Đức AL752N – Tặng ray','Bảng giá 31/07/2026; TP-TD-AL752N; WITH_RAIL; 1701000 VND/m².','2026-08-12T02:14:24.352Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;
