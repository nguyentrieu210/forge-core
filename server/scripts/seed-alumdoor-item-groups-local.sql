-- Canonical Alumdoor Item Group tree for LOCAL development only.
-- Idempotent: rerunning updates the same records and never duplicates a group.
BEGIN TRANSACTION;

INSERT INTO master_records (tenant_id, record_type, name, disabled, data_json, modified_at)
VALUES
  ('demo','Item Group','Tất cả mặt hàng',0,'{"item_group_name":"Tất cả mặt hàng","is_group":true,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Cửa thành phẩm',0,'{"item_group_name":"Cửa thành phẩm","parent_item_group":"Tất cả mặt hàng","is_group":true,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Motor & điện',0,'{"item_group_name":"Motor & điện","parent_item_group":"Tất cả mặt hàng","is_group":true,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Phụ kiện & vật tư',0,'{"item_group_name":"Phụ kiện & vật tư","parent_item_group":"Tất cả mặt hàng","is_group":true,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Cửa CN Đức',0,'{"item_group_name":"Cửa CN Đức","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Cửa tấm liền Úc',0,'{"item_group_name":"Cửa tấm liền Úc","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Cửa Đài Loan',0,'{"item_group_name":"Cửa Đài Loan","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Cửa Đài Loan Inox',0,'{"item_group_name":"Cửa Đài Loan Inox","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Cửa siêu trường',0,'{"item_group_name":"Cửa siêu trường","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Cửa Lưới',0,'{"item_group_name":"Cửa Lưới","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Cửa kéo Đài Loan',0,'{"item_group_name":"Cửa kéo Đài Loan","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Motor',0,'{"item_group_name":"Motor","parent_item_group":"Motor & điện","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Bình lưu điện',0,'{"item_group_name":"Bình lưu điện","parent_item_group":"Motor & điện","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Điều khiển & phụ kiện điện',0,'{"item_group_name":"Điều khiển & phụ kiện điện","parent_item_group":"Motor & điện","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Linh kiện motor',0,'{"item_group_name":"Linh kiện motor","parent_item_group":"Motor & điện","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Phụ kiện chung',0,'{"item_group_name":"Phụ kiện chung","parent_item_group":"Phụ kiện & vật tư","is_group":false,"disabled":false}',CURRENT_TIMESTAMP),
  ('demo','Item Group','Phụ kiện CN Đức',0,'{"item_group_name":"Phụ kiện CN Đức","parent_item_group":"Phụ kiện & vật tư","is_group":false,"disabled":false}',CURRENT_TIMESTAMP)
ON CONFLICT(tenant_id, record_type, name) DO UPDATE SET
  disabled=excluded.disabled,
  data_json=excluded.data_json,
  modified_at=excluded.modified_at;

INSERT INTO documents
  (tenant_id, doc_key, doctype, name, owner, docstatus, status, version, created_at, modified_at, modified_by, payload_json)
VALUES
  ('demo','Item Group:Tất cả mặt hàng','Item Group','Tất cả mặt hàng','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Tất cả mặt hàng","is_group":true,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Cửa thành phẩm','Item Group','Cửa thành phẩm','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Cửa thành phẩm","parent_item_group":"Tất cả mặt hàng","is_group":true,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Motor & điện','Item Group','Motor & điện','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Motor & điện","parent_item_group":"Tất cả mặt hàng","is_group":true,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Phụ kiện & vật tư','Item Group','Phụ kiện & vật tư','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Phụ kiện & vật tư","parent_item_group":"Tất cả mặt hàng","is_group":true,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Cửa CN Đức','Item Group','Cửa CN Đức','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Cửa CN Đức","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Cửa tấm liền Úc','Item Group','Cửa tấm liền Úc','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Cửa tấm liền Úc","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Cửa Đài Loan','Item Group','Cửa Đài Loan','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Cửa Đài Loan","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Cửa Đài Loan Inox','Item Group','Cửa Đài Loan Inox','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Cửa Đài Loan Inox","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Cửa siêu trường','Item Group','Cửa siêu trường','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Cửa siêu trường","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Cửa Lưới','Item Group','Cửa Lưới','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Cửa Lưới","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Cửa kéo Đài Loan','Item Group','Cửa kéo Đài Loan','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Cửa kéo Đài Loan","parent_item_group":"Cửa thành phẩm","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Motor','Item Group','Motor','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Motor","parent_item_group":"Motor & điện","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Bình lưu điện','Item Group','Bình lưu điện','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Bình lưu điện","parent_item_group":"Motor & điện","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Điều khiển & phụ kiện điện','Item Group','Điều khiển & phụ kiện điện','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Điều khiển & phụ kiện điện","parent_item_group":"Motor & điện","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Linh kiện motor','Item Group','Linh kiện motor','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Linh kiện motor","parent_item_group":"Motor & điện","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Phụ kiện chung','Item Group','Phụ kiện chung','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Phụ kiện chung","parent_item_group":"Phụ kiện & vật tư","is_group":false,"disabled":false,"_metadata_revision":1}'),
  ('demo','Item Group:Phụ kiện CN Đức','Item Group','Phụ kiện CN Đức','admin',0,'Draft',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'admin','{"item_group_name":"Phụ kiện CN Đức","parent_item_group":"Phụ kiện & vật tư","is_group":false,"disabled":false,"_metadata_revision":1}')
ON CONFLICT(tenant_id, doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,
  modified_at=excluded.modified_at,
  modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search (tenant_id, doctype, name, title, content, modified_at)
SELECT tenant_id, doctype, name, name,
       name || ' ' || COALESCE(json_extract(payload_json,'$.parent_item_group'),''),
       CURRENT_TIMESTAMP
FROM documents
WHERE tenant_id='demo' AND doctype='Item Group'
  AND name IN (
    'Tất cả mặt hàng','Cửa thành phẩm','Motor & điện','Phụ kiện & vật tư',
    'Cửa CN Đức','Cửa tấm liền Úc','Cửa Đài Loan','Cửa Đài Loan Inox',
    'Cửa siêu trường','Cửa Lưới','Cửa kéo Đài Loan','Motor','Bình lưu điện',
    'Điều khiển & phụ kiện điện','Linh kiện motor','Phụ kiện chung','Phụ kiện CN Đức'
  )
ON CONFLICT(tenant_id, doctype, name) DO UPDATE SET
  title=excluded.title,
  content=excluded.content,
  modified_at=excluded.modified_at;

-- Keep the old demo taxonomy recoverable, but remove it from active selectors.
UPDATE master_records
SET disabled=1,
    data_json=json_set(data_json,'$.disabled',json('true')),
    modified_at=CURRENT_TIMESTAMP
WHERE tenant_id='demo' AND record_type='Item Group'
  AND name IN (
    'Bộ lưu điện','Cửa cuốn','Cửa nhôm kính','Dịch vụ','Linh kiện & thiết bị',
    'Mô tơ','Nan/lá cửa','Nguyên vật liệu','Phụ kiện','Ray và trục',
    'Remote và điều khiển','Thành phẩm'
  );

UPDATE documents
SET payload_json=json_set(payload_json,'$.disabled',json('true')),
    modified_at=CURRENT_TIMESTAMP,
    modified_by='admin',
    version=version+1
WHERE tenant_id='demo' AND doctype='Item Group'
  AND name IN (
    'Bộ lưu điện','Cửa cuốn','Cửa nhôm kính','Dịch vụ','Linh kiện & thiết bị',
    'Mô tơ','Nan/lá cửa','Nguyên vật liệu','Phụ kiện','Ray và trục',
    'Remote và điều khiển','Thành phẩm'
  );

COMMIT;
