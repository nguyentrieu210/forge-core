-- Alumdoor selling completion, sourced from the six price sheets dated 31/07/2026.

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TD-AL595:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TD-AL595:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TD-AL595","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1020000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TD-AL595:m2:STANDARD','ĐỨC AL595','TD-AL595; STANDARD; 1020000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL71N:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD-AL71N:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL71N","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1095000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL71N:m2:STANDARD','ĐỨC AL71N','TP-TD-AL71N; STANDARD; 1095000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL503N26:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD-AL503N26:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL503N26","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1200000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL503N26:m2:STANDARD','ĐỨC AL503N','TP-TD-AL503N26; STANDARD; 1200000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:AL503C:m2:STANDARD','Item Price','Bảng giá 31/07/2026:AL503C:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"AL503C","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1200000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:AL503C:m2:STANDARD','AL503C','AL503C; STANDARD; 1200000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-ALD-548N:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-ALD-548N:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-ALD-548N","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1287000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-ALD-548N:m2:STANDARD','ĐỨC AL548N','TP-ALD-548N; STANDARD; 1287000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:AL501C:m2:STANDARD','Item Price','Bảng giá 31/07/2026:AL501C:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"AL501C","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1400000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:AL501C:m2:STANDARD','AL501C','AL501C; STANDARD; 1400000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL501N:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD-AL501N:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL501N","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1371000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL501N:m2:STANDARD','ĐỨC AL501N','TP-TD-AL501N; STANDARD; 1371000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL652:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD-AL652:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL652","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1431000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL652:m2:STANDARD','ĐỨC AL652','TP-TD-AL652; STANDARD; 1431000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-ALD-DL552:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-ALD-DL552:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-ALD-DL552","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1540000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-ALD-DL552:m2:STANDARD','ĐỨC AL552N','TP-ALD-DL552; STANDARD; 1540000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL752N:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD-AL752N:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL752N","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1566000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL752N:m2:STANDARD','ĐỨC AL752N','TP-TD-AL752N; STANDARD; 1566000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL50:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD-AL50:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL50","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1685000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL50:m2:STANDARD','ĐỨC AL50','TP-TD-AL50; STANDARD; 1685000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-ALVIP50:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-ALVIP50:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-ALVIP50","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1778000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-ALVIP50:m2:STANDARD','ĐỨC AL-VIP50','TP-ALVIP50; STANDARD; 1778000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-ALVIPST500:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-ALVIPST500:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-ALVIPST500","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":2108000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-ALVIPST500:m2:STANDARD','ĐỨC AL-VIPST500','TP-ALVIPST500; STANDARD; 2108000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-ALVIPST700:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-ALVIPST700:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-ALVIPST700","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":2223000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-ALVIPST700:m2:STANDARD','ĐỨC AL-VIPST700','TP-ALVIPST700; STANDARD; 2223000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL70 (2 LỚP):m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD-AL70 (2 LỚP):m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL70 (2 LỚP)","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":843000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL70 (2 LỚP):m2:STANDARD','ĐỨC AL70 (2 LỚP)','TP-TD-AL70 (2 LỚP); STANDARD; 843000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-AL70-1LOP:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-AL70-1LOP:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-AL70-1LOP","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1146000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-AL70-1LOP:m2:STANDARD','ĐỨC AL70 (1 LỚP)','TP-AL70-1LOP; STANDARD; 1146000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-AL75:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-AL75:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-AL75","item_group":"Cửa CN Đức","uom":"m2","price_variant":"STANDARD","rate":1303000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-AL75:m2:STANDARD','ĐỨC AL75','TP-AL75; STANDARD; 1303000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-TANKER400KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-TANKER400KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-TANKER400KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":1750000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-TANKER400KG:Bộ:STANDARD','MOTOR TANKER 400KG','TP-MT-TANKER400KG; STANDARD; 1750000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-TANKER600KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-TANKER600KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-TANKER600KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":1850000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-TANKER600KG:Bộ:STANDARD','MOTOR TANKER 600KG','TP-MT-TANKER600KG; STANDARD; 1850000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-TANKE800KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-TANKE800KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-TANKE800KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":3700000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-TANKE800KG:Bộ:STANDARD','MOTOR TANKER 800KG','TP-MT-TANKE800KG; STANDARD; 3700000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-TANKER1000KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-TANKER1000KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-TANKER1000KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":3900000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-TANKER1000KG:Bộ:STANDARD','MOTOR TANKER 1000KG','TP-MT-TANKER1000KG; STANDARD; 3900000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-TANKER1500KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-TANKER1500KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-TANKER1500KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":6700000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-TANKER1500KG:Bộ:STANDARD','MOTOR TANKER 1500KG','TP-MT-TANKER1500KG; STANDARD; 6700000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-Tanker-Alumax-Lac33:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-Tanker-Alumax-Lac33:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-Tanker-Alumax-Lac33","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":450000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-Tanker-Alumax-Lac33:Cái:STANDARD','LẮC TANKER_ALUMAX 33','TP-Tanker-Alumax-Lac33; STANDARD; 450000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-Tanker-Alumax-Lac36:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-Tanker-Alumax-Lac36:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-Tanker-Alumax-Lac36","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":500000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-Tanker-Alumax-Lac36:Cái:STANDARD','LẮC TANKER_ALUMAX 36','TP-Tanker-Alumax-Lac36; STANDARD; 500000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-Tanker-Lac800&1000KG:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-Tanker-Lac800&1000KG:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-Tanker-Lac800&1000KG","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":600000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-Tanker-Lac800&1000KG:Cái:STANDARD','LẮC TANKER_800-1000KG','TP-Tanker-Lac800&1000KG; STANDARD; 600000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-Tanker-Alumax-HDK:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-Tanker-Alumax-HDK:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-Tanker-Alumax-HDK","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":150000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-Tanker-Alumax-HDK:Cái:STANDARD','HỘP ĐK TANKER_ALUMAX','TP-Tanker-Alumax-HDK; STANDARD; 150000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TANKER_ALUMAX_BODK:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TANKER_ALUMAX_BODK:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TANKER_ALUMAX_BODK","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":270000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TANKER_ALUMAX_BODK:Bộ:STANDARD','BỘ ĐK TANKER_ALUMAX','TP-TANKER_ALUMAX_BODK; STANDARD; 270000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-Tanker-Alumax_TayDK:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-Tanker-Alumax_TayDK:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-Tanker-Alumax_TayDK","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":120000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-Tanker-Alumax_TayDK:Cái:STANDARD','TAY ĐIỀU KHIỂN TANKER','TP-Tanker-Alumax_TayDK; STANDARD; 120000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP_PAT_CODAY:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP_PAT_CODAY:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP_PAT_CODAY","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":150000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP_PAT_CODAY:Bộ:STANDARD','PHÍM ÂM TƯỜNG CÓ DÂY','TP_PAT_CODAY; STANDARD; 150000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-PAT_KHONGDAY:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-PAT_KHONGDAY:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-PAT_KHONGDAY","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":80000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-PAT_KHONGDAY:Cái:STANDARD','PHÍM ÂM TƯỜNG KHÔNG DÂY','TP-PAT_KHONGDAY; STANDARD; 80000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-DAYDIEN:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-DAYDIEN:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-DAYDIEN","item_group":"Motor & Bình điện","uom":"Mét","price_variant":"STANDARD","rate":15000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-DAYDIEN:Mét:STANDARD','DÂY ĐIỆN PHÍM ÂM TƯỜNG','TP-DAYDIEN; STANDARD; 15000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT-BOSTEC-PAT:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT-BOSTEC-PAT:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT-BOSTEC-PAT","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":250000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT-BOSTEC-PAT:Cái:STANDARD','BOSTEC_PHÍM ÂM TƯỜNG','TP-MTT-BOSTEC-PAT; STANDARD; 250000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT-BOSTEC-TAYDK:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT-BOSTEC-TAYDK:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT-BOSTEC-TAYDK","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":270000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT-BOSTEC-TAYDK:Cái:STANDARD','BOSTEC TAY ĐIỀU KHIỂN','TP-MTT-BOSTEC-TAYDK; STANDARD; 270000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP_BOSTEC_BODIEUKHIEN:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP_BOSTEC_BODIEUKHIEN:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP_BOSTEC_BODIEUKHIEN","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":1850000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP_BOSTEC_BODIEUKHIEN:Bộ:STANDARD','BOSTEC BỘ ĐIỀU KHIỂN','TP_BOSTEC_BODIEUKHIEN; STANDARD; 1850000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT-CHTAIWAN-PAT:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT-CHTAIWAN-PAT:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT-CHTAIWAN-PAT","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":600000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT-CHTAIWAN-PAT:Cái:STANDARD','CHTAIWAN-PHÍM ÂM TƯỜNG','TP-MTT-CHTAIWAN-PAT; STANDARD; 600000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT-CHTAIWAN-TAYDK:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT-CHTAIWAN-TAYDK:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT-CHTAIWAN-TAYDK","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":320000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT-CHTAIWAN-TAYDK:Cái:STANDARD','CHTAIWAN-TAY ĐIỀU KHIỂN','TP-MTT-CHTAIWAN-TAYDK; STANDARD; 320000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP_CHTAIWAN_BODIEUKHIEN:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP_CHTAIWAN_BODIEUKHIEN:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP_CHTAIWAN_BODIEUKHIEN","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":2400000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP_CHTAIWAN_BODIEUKHIEN:Bộ:STANDARD','CHTAIWAN BỘ ĐIỀU KHIỂN','TP_CHTAIWAN_BODIEUKHIEN; STANDARD; 2400000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT_BOSTEC-DOI(P):Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT_BOSTEC-DOI(P):Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT_BOSTEC-DOI(P)","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":3800000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT_BOSTEC-DOI(P):Bộ:STANDARD','MTT BOSTEC ĐÔI - PHẢI','TP-MTT_BOSTEC-DOI(P); STANDARD; 3800000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT_BOSTEC-DOI(T):Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT_BOSTEC-DOI(T):Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT_BOSTEC-DOI(T)","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":3800000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT_BOSTEC-DOI(T):Bộ:STANDARD','MTT BOSTEC ĐÔI - TRÁI','TP-MTT_BOSTEC-DOI(T); STANDARD; 3800000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT_BOSTEC-DON(P):Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT_BOSTEC-DON(P):Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT_BOSTEC-DON(P)","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":3300000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT_BOSTEC-DON(P):Bộ:STANDARD','MTT BOSTEC ĐƠN - PHẢI','TP-MTT_BOSTEC-DON(P); STANDARD; 3300000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT_BOSTEC-DON(T):Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT_BOSTEC-DON(T):Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT_BOSTEC-DON(T)","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":3300000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT_BOSTEC-DON(T):Bộ:STANDARD','MTT BOSTEC ĐƠN - TRÁI','TP-MTT_BOSTEC-DON(T); STANDARD; 3300000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DOI(T):Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DOI(T):Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT_CHTAIWAN-DOI(T)","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":5300000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DOI(T):Bộ:STANDARD','MTT CHTAIWAN ĐÔI - TRÁI','TP-MTT_CHTAIWAN-DOI(T); STANDARD; 5300000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DOI(P):Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DOI(P):Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT_CHTAIWAN-DOI(P)","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":5300000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DOI(P):Bộ:STANDARD','MTT CHTAIWAN ĐÔI - PHẢI','TP-MTT_CHTAIWAN-DOI(P); STANDARD; 5300000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DON(P):Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DON(P):Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT_CHTAIWAN-DON(P)","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":4950000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DON(P):Bộ:STANDARD','MTT CHTAIWAN ĐƠN - PHẢI','TP-MTT_CHTAIWAN-DON(P); STANDARD; 4950000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DON(T):Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DON(T):Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MTT_CHTAIWAN-DON(T)","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":4950000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MTT_CHTAIWAN-DON(T):Bộ:STANDARD','MTT CHTAIWAN ĐƠN - TRÁI','TP-MTT_CHTAIWAN-DON(T); STANDARD; 4950000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 300KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 300KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHTAIWAN CH 300KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":6350000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 300KG:Bộ:STANDARD','MOTOR YHTAIWAN CH 300KG','TP-MT-YHTAIWAN CH 300KG; STANDARD; 6350000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 500KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 500KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHTAIWAN CH 500KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":7900000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 500KG:Bộ:STANDARD','MOTOR YHTAIWAN CH 500KG','TP-MT-YHTAIWAN CH 500KG; STANDARD; 7900000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 400KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 400KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHTAIWAN CH 400KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":7000000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 400KG:Bộ:STANDARD','MOTOR YHTAIWAN CH 400KG','TP-MT-YHTAIWAN CH 400KG; STANDARD; 7000000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 600KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 600KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHTAIWAN CH 600KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":11900000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 600KG:Bộ:STANDARD','MOTOR YHTAIWAN CH 600KG','TP-MT-YHTAIWAN CH 600KG; STANDARD; 11900000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 700KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 700KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHTAIWAN CH 700KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":12900000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 700KG:Bộ:STANDARD','MOTOR YHTAIWAN CH 700KG','TP-MT-YHTAIWAN CH 700KG; STANDARD; 12900000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 800KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 800KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHTAIWAN CH 800KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":13600000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 800KG:Bộ:STANDARD','MOTOR YHTAIWAN CH 800KG','TP-MT-YHTAIWAN CH 800KG; STANDARD; 13600000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 1000KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 1000KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHTAIWAN CH 1000KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":13600000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHTAIWAN CH 1000KG:Bộ:STANDARD','MOTOR YHTAIWAN CH 1000KG','TP-MT-YHTAIWAN CH 1000KG; STANDARD; 13600000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-YHTaiwan-BODK:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-YHTaiwan-BODK:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-YHTaiwan-BODK","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":1050000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-YHTaiwan-BODK:Bộ:STANDARD','YHTAIWAN_BỘ ĐIỀU KHIỂN','TP-YHTaiwan-BODK; STANDARD; 1050000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-YHTaiwan-TayDK:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-YHTaiwan-TayDK:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-YHTaiwan-TayDK","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":350000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-YHTaiwan-TayDK:Cái:STANDARD','YHTAIWAN_TAY ĐIỀU KHIỂN','TP-YHTaiwan-TayDK; STANDARD; 350000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-XOP-N45:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-XOP-N45:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-XOP-N45","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":18000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-XOP-N45:Cái:STANDARD','XỐP NHỎ','NVL-XOP-N45; STANDARD; 18000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-XOP-N90:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-XOP-N90:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-XOP-N90","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":24000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-XOP-N90:Cái:STANDARD','XỐP LỚN','NVL-XOP-N90; STANDARD; 24000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-CHNHUA:Kg:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-CHNHUA:Kg:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-CHNHUA","item_group":"Motor & Bình điện","uom":"Kg","price_variant":"STANDARD","rate":75000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-CHNHUA:Kg:STANDARD','VÒNG NHỰA HÃM TRỤC','NVL-CHNHUA; STANDARD; 75000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TRUC34:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TRUC34:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TRUC34","item_group":"Cửa tấm liền Úc","uom":"Mét","price_variant":"STANDARD","rate":150000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TRUC34:Mét:STANDARD','TRỤC PHI 34','NVL-TRUC34; STANDARD; 150000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-INOX, NVL-NHUA, NVL-MOC:Cây:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-INOX, NVL-NHUA, NVL-MOC:Cây:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-INOX, NVL-NHUA, NVL-MOC","item_group":"Cửa tấm liền Úc","uom":"Cây","price_variant":"STANDARD","rate":150000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-INOX, NVL-NHUA, NVL-MOC:Cây:STANDARD','CÂY KÉO CỬA INOX','NVL-INOX, NVL-NHUA, NVL-MOC; STANDARD; 150000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-VDAY-TDU-KTD:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-VDAY-TDU-KTD:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-VDAY-TDU-KTD","item_group":"Cửa tấm liền Úc","uom":"Mét","price_variant":"STANDARD","rate":118000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-VDAY-TDU-KTD:Mét:STANDARD','THANH ĐÁY ÚC_KTD','NVL-VDAY-TDU-KTD; STANDARD; 118000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:RONDAYUC:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:RONDAYUC:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"RONDAYUC","item_group":"Cửa tấm liền Úc","uom":"Mét","price_variant":"STANDARD","rate":10000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:RONDAYUC:Mét:STANDARD','RON ĐÁY ÚC','RONDAYUC; STANDARD; 10000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LacYHLD300&500KG:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LacYHLD300&500KG:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LacYHLD300&500KG","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":650000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LacYHLD300&500KG:Cái:STANDARD','LẮC YH 300_500KG','TP-LacYHLD300&500KG; STANDARD; 650000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LacYHLD800&1000KG:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LacYHLD800&1000KG:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LacYHLD800&1000KG","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":750000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LacYHLD800&1000KG:Cái:STANDARD','LẮC YH 800_1000KG','TP-LacYHLD800&1000KG; STANDARD; 750000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-YHLD-BDK:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-YHLD-BDK:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-YHLD-BDK","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":470000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-YHLD-BDK:Bộ:STANDARD','BỘ ĐIỀU KHIỂN YHLD','TP-YHLD-BDK; STANDARD; 470000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-YHLD-HDK:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-YHLD-HDK:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-YHLD-HDK","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":250000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-YHLD-HDK:Cái:STANDARD','HỘP ĐIỀU KHIỂN YHLD','TP-YHLD-HDK; STANDARD; 250000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-YHLD_TayDK:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-YHLD_TayDK:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-YHLD_TayDK","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":180000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-YHLD_TayDK:Cái:STANDARD','TAY ĐIỀU KHIỂN YHLD','TP-YHLD_TayDK; STANDARD; 180000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL_Tanker-nhong:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:NVL_Tanker-nhong:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL_Tanker-nhong","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":70000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL_Tanker-nhong:Cái:STANDARD','NHÔNG MOTOR TANKER','NVL_Tanker-nhong; STANDARD; 70000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL_Longden:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:NVL_Longden:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL_Longden","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":50000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL_Longden:Cái:STANDARD','LÔNG ĐỀN','NVL_Longden; STANDARD; 50000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL_Hoakhe:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:NVL_Hoakhe:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL_Hoakhe","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":50000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL_Hoakhe:Cái:STANDARD','HOA KHẾ (3 CHẤU)','NVL_Hoakhe; STANDARD; 50000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL_Cot:Cây:STANDARD','Item Price','Bảng giá 31/07/2026:NVL_Cot:Cây:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL_Cot","item_group":"Motor & Bình điện","uom":"Cây","price_variant":"STANDARD","rate":80000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL_Cot:Cây:STANDARD','CỐT','NVL_Cot; STANDARD; 80000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL_Napchup+Bacdan:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:NVL_Napchup+Bacdan:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL_Napchup+Bacdan","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":100000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL_Napchup+Bacdan:Bộ:STANDARD','BẠC ĐẠN + NẮP CHỤP','NVL_Napchup+Bacdan; STANDARD; 100000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BDK-TANKER-ALUMAX:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BDK-TANKER-ALUMAX:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BDK-TANKER-ALUMAX","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":270000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BDK-TANKER-ALUMAX:Bộ:STANDARD','BỘ ĐIỀU KHIỂN TANKER_ALUMAX','TP-BDK-TANKER-ALUMAX; STANDARD; 270000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHLD300KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHLD300KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHLD300KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":2750000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHLD300KG:Bộ:STANDARD','MOTOR YHLD 300KG','TP-MT-YHLD300KG; STANDARD; 2750000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHLD500KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHLD500KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHLD500KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":2850000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHLD500KG:Bộ:STANDARD','MOTOR YHLD 500KG','TP-MT-YHLD500KG; STANDARD; 2850000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-YHLD_TayDK:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-YHLD_TayDK:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-YHLD_TayDK","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":180000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-YHLD_TayDK:Cái:STANDARD','YHLD TAY ĐIỀU KHIỂN','TP-YHLD_TayDK; STANDARD; 180000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHLD800KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHLD800KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHLD800KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":5900000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHLD800KG:Bộ:STANDARD','MOTOR YHLD 800KG','TP-MT-YHLD800KG; STANDARD; 5900000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-YHLD1000KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-YHLD1000KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-YHLD1000KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":7000000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-YHLD1000KG:Bộ:STANDARD','MOTOR YHLD 1000KG','TP-MT-YHLD1000KG; STANDARD; 7000000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-JG300KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-JG300KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-JG300KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":3550000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-JG300KG:Bộ:STANDARD','MOTOR JG 300KG','TP-MT-JG300KG; STANDARD; 3550000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-JG400KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-JG400KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-JG400KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":4050000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-JG400KG:Bộ:STANDARD','MOTOR JG 400KG','TP-MT-JG400KG; STANDARD; 4050000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-JG500KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-JG500KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-JG500KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":4200000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-JG500KG:Bộ:STANDARD','MOTOR JG 500KG','TP-MT-JG500KG; STANDARD; 4200000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-JG600KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-JG600KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-JG600KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":4250000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-JG600KG:Bộ:STANDARD','MOTOR JG 600KG','TP-MT-JG600KG; STANDARD; 4250000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-JG800KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-JG800KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-JG800KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":5250000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-JG800KG:Bộ:STANDARD','MOTOR JG 800KG','TP-MT-JG800KG; STANDARD; 5250000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-JG1000KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-JG1000KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-JG1000KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":7650000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-JG1000KG:Bộ:STANDARD','MOTOR JG 1000KG','TP-MT-JG1000KG; STANDARD; 7650000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-JG1500KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-JG1500KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-JG1500KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":8050000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-JG1500KG:Bộ:STANDARD','MOTOR JG 1500KG','TP-MT-JG1500KG; STANDARD; 8050000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-JG_TayDK:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-JG_TayDK:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-JG_TayDK","item_group":"Motor & Bình điện","uom":"Cái","price_variant":"STANDARD","rate":190000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-JG_TayDK:Cái:STANDARD','JG_TAY ĐIỀU KHIỂN','TP-JG_TayDK; STANDARD; 190000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:JG_BODK:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:JG_BODK:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"JG_BODK","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":460000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:JG_BODK:Bộ:STANDARD','JG_BỘ ĐIỀU KHIỂN','JG_BODK; STANDARD; 460000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-NAPNHIN:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-NAPNHIN:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-NAPNHIN","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":170000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-NAPNHIN:Cái:STANDARD','NẮP NHÌN','TP-NAPNHIN; STANDARD; 170000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BDKDT_MULLER:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BDKDT_MULLER:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BDKDT_MULLER","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":750000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BDKDT_MULLER:Bộ:STANDARD','BỘ ĐIỀU KHIỂN ĐIỆN THOẠI MULLER','TP-BDKDT_MULLER; STANDARD; 750000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TDK_MULLER:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TDK_MULLER:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TDK_MULLER","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":280000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TDK_MULLER:Bộ:STANDARD','TAY ĐIỀU KHIỂN ĐIỆN THOẠI MULLER','TP-TDK_MULLER; STANDARD; 280000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-GOIGANG:Cặp:STANDARD','Item Price','Bảng giá 31/07/2026:TP-GOIGANG:Cặp:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-GOIGANG","item_group":"Phụ kiện","uom":"Cặp","price_variant":"STANDARD","rate":90000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-GOIGANG:Cặp:STANDARD','GỐI GANG','TP-GOIGANG; STANDARD; 90000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BUOMSAT:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BUOMSAT:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BUOMSAT","item_group":"Phụ kiện","uom":"m2","price_variant":"STANDARD","rate":30000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BUOMSAT:m2:STANDARD','BẮN BƯỚM SẮT','TP-BUOMSAT; STANDARD; 30000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BUOMSAT-ST:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BUOMSAT-ST:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BUOMSAT-ST","item_group":"Phụ kiện","uom":"m2","price_variant":"STANDARD","rate":40000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BUOMSAT-ST:m2:STANDARD','BẮN BƯỚM SẮT SIÊU TRƯỜNG','TP-BUOMSAT-ST; STANDARD; 40000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BUOMSAT-02:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BUOMSAT-02:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BUOMSAT-02","item_group":"Phụ kiện","uom":"m2","price_variant":"STANDARD","rate":60000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BUOMSAT-02:m2:STANDARD','BẮN BƯỚM SẮT','TP-BUOMSAT-02; STANDARD; 60000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CHONGXOLO:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CHONGXOLO:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CHONGXOLO","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":65000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CHONGXOLO:Cái:STANDARD','CHỐNG XỔ LÔ','TP-CHONGXOLO; STANDARD; 65000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LACPHU33_3LO:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LACPHU33_3LO:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LACPHU33_3LO","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":65000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LACPHU33_3LO:Cái:STANDARD','LẮC PHỤ 33-3 LỔ (ĐÀI LOAN)','TP-LACPHU33_3LO; STANDARD; 65000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LACPHU36_3LO:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LACPHU36_3LO:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LACPHU36_3LO","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":70000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LACPHU36_3LO:Cái:STANDARD','LẮC PHỤ 36-3 LỔ (ĐÀI LOAN)','TP-LACPHU36_3LO; STANDARD; 70000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LACPHU33_1LO:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LACPHU33_1LO:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LACPHU33_1LO","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":65000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LACPHU33_1LO:Cái:STANDARD','LẮC PHỤ 33-1 LỔ','TP-LACPHU33_1LO; STANDARD; 65000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LACPHU36_1LO:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LACPHU36_1LO:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LACPHU36_1LO","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":70000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LACPHU36_1LO:Cái:STANDARD','LẮC PHỤ 36-1 LỔ','TP-LACPHU36_1LO; STANDARD; 70000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LACPHU40_1LO:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LACPHU40_1LO:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LACPHU40_1LO","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":120000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LACPHU40_1LO:Cái:STANDARD','LẮC PHỤ 40-1 LỔ','TP-LACPHU40_1LO; STANDARD; 120000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-ALUMAX400KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-ALUMAX400KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-ALUMAX400KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":2200000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-ALUMAX400KG:Bộ:STANDARD','MOTOR ALUMAX 400KG','TP-MT-ALUMAX400KG; STANDARD; 2200000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-MT-ALUMAX600KG:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-MT-ALUMAX600KG:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-MT-ALUMAX600KG","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":2300000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-MT-ALUMAX600KG:Bộ:STANDARD','MOTOR ALUMAX 600KG','TP-MT-ALUMAX600KG; STANDARD; 2300000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP_UPS-YH1000:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP_UPS-YH1000:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP_UPS-YH1000","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":1800000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP_UPS-YH1000:Bộ:STANDARD','Bình lưu điện YH1000','TP_UPS-YH1000; STANDARD; 1800000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP_UPS-YH2000:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP_UPS-YH2000:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP_UPS-YH2000","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":2700000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP_UPS-YH2000:Bộ:STANDARD','Bình lưu điện YH2000','TP_UPS-YH2000; STANDARD; 2700000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP_UPS-E800i:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP_UPS-E800i:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP_UPS-E800i","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":1800000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP_UPS-E800i:Bộ:STANDARD','Bình lưu điện Alumax E800i','TP_UPS-E800i; STANDARD; 1800000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP_UPS-E1000i:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP_UPS-E1000i:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP_UPS-E1000i","item_group":"Motor & Bình điện","uom":"Bộ","price_variant":"STANDARD","rate":2700000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP_UPS-E1000i:Bộ:STANDARD','Bình lưu điện Alumax E1000i','TP_UPS-E1000i; STANDARD; 2700000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-RAYHOP:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-RAYHOP:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-RAYHOP","item_group":"Phụ kiện CN Đức","uom":"Mét","price_variant":"STANDARD","rate":175000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-RAYHOP:Mét:STANDARD','RAY HỘP TD U76','TP-RAYHOP; STANDARD; 175000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD87A1 GS:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD87A1 GS:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD87A1 GS","item_group":"Phụ kiện CN Đức","uom":"Mét","price_variant":"STANDARD","rate":145000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD87A1 GS:Mét:STANDARD','RAY ĐƠN TD U76','TP-TD87A1 GS; STANDARD; 145000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-RAY HỘP TD U100:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-RAY HỘP TD U100:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-RAY HỘP TD U100","item_group":"Phụ kiện CN Đức","uom":"Mét","price_variant":"STANDARD","rate":230000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-RAY HỘP TD U100:Mét:STANDARD','RAY HỘP TD U100','TP-RAY HỘP TD U100; STANDARD; 230000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-A282:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-A282:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-A282","item_group":"Phụ kiện CN Đức","uom":"Mét","price_variant":"STANDARD","rate":170000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-A282:Mét:STANDARD','LÁ ĐẦU','TP-A282; STANDARD; 170000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD327:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD327:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD327","item_group":"Phụ kiện CN Đức","uom":"Mét","price_variant":"STANDARD","rate":46000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD327:Mét:STANDARD','LÁ YẾM','TP-TD327; STANDARD; 46000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD326:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD326:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD326","item_group":"Phụ kiện CN Đức","uom":"Mét","price_variant":"STANDARD","rate":80000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD326:Mét:STANDARD','LÁ TRUNG GIAN','TP-TD326; STANDARD; 80000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD325:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TD325:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD325","item_group":"Phụ kiện CN Đức","uom":"Mét","price_variant":"STANDARD","rate":130000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD325:Mét:STANDARD','LÁ ĐÁY LỚN','TP-TD325; STANDARD; 130000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-PHOTLONG4X5X400M:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-PHOTLONG4X5X400M:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-PHOTLONG4X5X400M","item_group":"Phụ kiện CN Đức","uom":"Mét","price_variant":"STANDARD","rate":2000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-PHOTLONG4X5X400M:Mét:STANDARD','LÔNG NHEO 4X5','TP-PHOTLONG4X5X400M; STANDARD; 2000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-PHOTLONG5X6X400M:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-PHOTLONG5X6X400M:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-PHOTLONG5X6X400M","item_group":"Phụ kiện CN Đức","uom":"Mét","price_variant":"STANDARD","rate":2000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-PHOTLONG5X6X400M:Mét:STANDARD','LÔNG NHEO 5X6','TP-PHOTLONG5X6X400M; STANDARD; 2000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:RON-DD:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:RON-DD:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"RON-DD","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":10000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:RON-DD:Mét:STANDARD','RON ĐÁY ĐỨC','RON-DD; STANDARD; 10000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:RNHUA-DR:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:RNHUA-DR:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"RNHUA-DR","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":20000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:RNHUA-DR:Mét:STANDARD','RON NHỰA ĐÁY RAY','RNHUA-DR; STANDARD; 20000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:RNINOX-DR:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:RNINOX-DR:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"RNINOX-DR","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":15000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:RNINOX-DR:Mét:STANDARD','RON INOX ĐÁY RAY','RNINOX-DR; STANDARD; 15000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:RNHUA/LONG-CR:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:RNHUA/LONG-CR:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"RNHUA/LONG-CR","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":6000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:RNHUA/LONG-CR:Mét:STANDARD','RON NHỰA CẠNH RAY','RNHUA/LONG-CR; STANDARD; 6000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:RNHUA/LONG-CR-02:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:RNHUA/LONG-CR-02:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"RNHUA/LONG-CR-02","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":7000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:RNHUA/LONG-CR-02:Mét:STANDARD','RON LÔNG CẠNH RAY','RNHUA/LONG-CR-02; STANDARD; 7000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BO 2VIS 752-VIPST700:Con:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BO 2VIS 752-VIPST700:Con:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BO 2VIS 752-VIPST700","item_group":"Phụ kiện CN Đức","uom":"Con","price_variant":"STANDARD","rate":2500,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BO 2VIS 752-VIPST700:Con:STANDARD','BỌ 2VIS 752-VIPST700','TP-BO 2VIS 752-VIPST700; STANDARD; 2500 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BO 1VIS AL702LOP:Con:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BO 1VIS AL702LOP:Con:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BO 1VIS AL702LOP","item_group":"Phụ kiện CN Đức","uom":"Con","price_variant":"STANDARD","rate":1500,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BO 1VIS AL702LOP:Con:STANDARD','BỌ 1 VIS-AL702LOP','TP-BO 1VIS AL702LOP; STANDARD; 1500 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BO 1VIS AL701LOP:Con:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BO 1VIS AL701LOP:Con:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BO 1VIS AL701LOP","item_group":"Phụ kiện CN Đức","uom":"Con","price_variant":"STANDARD","rate":1500,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BO 1VIS AL701LOP:Con:STANDARD','BỌ 1 VIS-AL701LOP','TP-BO 1VIS AL701LOP; STANDARD; 1500 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BO 1VIS AL75:Con:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BO 1VIS AL75:Con:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BO 1VIS AL75","item_group":"Phụ kiện CN Đức","uom":"Con","price_variant":"STANDARD","rate":1500,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BO 1VIS AL75:Con:STANDARD','BỌ 1VIS-AL75','TP-BO 1VIS AL75; STANDARD; 1500 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BO 2VIS AL50-VIP50-AL548-ST500:Con:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BO 2VIS AL50-VIP50-AL548-ST500:Con:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BO 2VIS AL50-VIP50-AL548-ST500","item_group":"Phụ kiện CN Đức","uom":"Con","price_variant":"STANDARD","rate":2500,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BO 2VIS AL50-VIP50-AL548-ST500:Con:STANDARD','BỌ 2VIS-AL50-VIP50-AL548-ST500','TP-BO 2VIS AL50-VIP50-AL548-ST500; STANDARD; 2500 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BO 1VIS AL503C:Con:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BO 1VIS AL503C:Con:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BO 1VIS AL503C","item_group":"Phụ kiện CN Đức","uom":"Con","price_variant":"STANDARD","rate":1500,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BO 1VIS AL503C:Con:STANDARD','BỌ 1VIS_AL503C','TP-BO 1VIS AL503C; STANDARD; 1500 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BO 1VIS 503N-71-595:Con:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BO 1VIS 503N-71-595:Con:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BO 1VIS 503N-71-595","item_group":"Phụ kiện CN Đức","uom":"Con","price_variant":"STANDARD","rate":1500,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BO 1VIS 503N-71-595:Con:STANDARD','BỌ 1VIS 503N-71-595','TP-BO 1VIS 503N-71-595; STANDARD; 1500 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BO 2VIS-501-552:Con:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BO 2VIS-501-552:Con:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BO 2VIS-501-552","item_group":"Phụ kiện CN Đức","uom":"Con","price_variant":"STANDARD","rate":2500,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BO 2VIS-501-552:Con:STANDARD','BỌ 2VIS-501-552','TP-BO 2VIS-501-552; STANDARD; 2500 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BO 2VIS-652-548C:Con:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BO 2VIS-652-548C:Con:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BO 2VIS-652-548C","item_group":"Phụ kiện CN Đức","uom":"Con","price_variant":"STANDARD","rate":2500,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BO 2VIS-652-548C:Con:STANDARD','BỌ 2VIS-652-548C','TP-BO 2VIS-652-548C; STANDARD; 2500 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-COI:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-COI:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-COI","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":70000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-COI:Mét:STANDARD','CÒI BÁO ĐỘNG','TP-COI; STANDARD; 70000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-HTTD:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-HTTD:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-HTTD","item_group":"Phụ kiện","uom":"Bộ","price_variant":"STANDARD","rate":80000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-HTTD:Bộ:STANDARD','HỆ THỐNG TỰ DỪNG','TP-HTTD; STANDARD; 80000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CONLAN:Cặp:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CONLAN:Cặp:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CONLAN","item_group":"Phụ kiện","uom":"Cặp","price_variant":"STANDARD","rate":100000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CONLAN:Cặp:STANDARD','CON LĂN','TP-CONLAN; STANDARD; 100000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-PULY 114N:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-PULY 114N:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-PULY 114N","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":22000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-PULY 114N:Cái:STANDARD','PULY 114 NHỎ','TP-PULY 114N; STANDARD; 22000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-PULY 114L:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-PULY 114L:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-PULY 114L","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":30000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-PULY 114L:Cái:STANDARD','PULY 114 LỚN','TP-PULY 114L; STANDARD; 30000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-PULY 168:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-PULY 168:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-PULY 168","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":43000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-PULY 168:Cái:STANDARD','PULY 168','TP-PULY 168; STANDARD; 43000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-PULY 140:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:TP-PULY 140:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-PULY 140","item_group":"Phụ kiện","uom":"Cái","price_variant":"STANDARD","rate":33000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-PULY 140:Cái:STANDARD','PULY 140','TP-PULY 140; STANDARD; 33000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TRỤC 114_1.8LY:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TRỤC 114_1.8LY:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TRỤC 114_1.8LY","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":180000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TRỤC 114_1.8LY:Mét:STANDARD','TRỤC 114_1.8LY','TRỤC 114_1.8LY; STANDARD; 180000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TRỤC 114_2.1LY:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TRỤC 114_2.1LY:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TRỤC 114_2.1LY","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":200000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TRỤC 114_2.1LY:Mét:STANDARD','TRỤC 114_2.1LY','TRỤC 114_2.1LY; STANDARD; 200000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TRUC90:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TRUC90:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TRUC90","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":120000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TRUC90:Mét:STANDARD','TRỤC PHI 90','NVL-TRUC90; STANDARD; 120000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TRUC140:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TRUC140:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TRUC140","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":290000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TRUC140:Mét:STANDARD','TRỤC 140','TP-TRUC140; STANDARD; 290000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TRUC168:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TRUC168:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TRUC168","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":520000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TRUC168:Mét:STANDARD','TRỤC 168','TP-TRUC168; STANDARD; 520000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:PK_TANGRAY:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:PK_TANGRAY:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"PK_TANGRAY","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":75000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:PK_TANGRAY:Mét:STANDARD','Ray tặng cửa Đức (≥10m²)','PK_TANGRAY; STANDARD; 75000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-UC KT 4D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-UC KT 4D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-UC KT 4D","item_group":"Cửa tấm liền Úc","uom":"m2","price_variant":"STANDARD","rate":365000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-UC KT 4D:m2:STANDARD','CỬA ÚC KT 4D','TP-UC KT 4D; STANDARD; 365000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-UC MTN 4D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-UC MTN 4D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-UC MTN 4D","item_group":"Cửa tấm liền Úc","uom":"m2","price_variant":"STANDARD","rate":345000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-UC MTN 4D:m2:STANDARD','CỬA ÚC MTN 4D','TP-UC MTN 4D; STANDARD; 345000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-UC KT 4.6D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-UC KT 4.6D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-UC KT 4.6D","item_group":"Cửa tấm liền Úc","uom":"m2","price_variant":"STANDARD","rate":395000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-UC KT 4.6D:m2:STANDARD','CỬA ÚC KT 4.6D','TP-UC KT 4.6D; STANDARD; 395000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-UC MTN 4.6D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-UC MTN 4.6D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-UC MTN 4.6D","item_group":"Cửa tấm liền Úc","uom":"m2","price_variant":"STANDARD","rate":375000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-UC MTN 4.6D:m2:STANDARD','CỬA ÚC MTN 4.6D','TP-UC MTN 4.6D; STANDARD; 375000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-UC KT 5.5D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-UC KT 5.5D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-UC KT 5.5D","item_group":"Cửa tấm liền Úc","uom":"m2","price_variant":"STANDARD","rate":425000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-UC KT 5.5D:m2:STANDARD','CỬA ÚC KT 5.5D','TP-UC KT 5.5D; STANDARD; 425000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-UC MTN 5.5D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-UC MTN 5.5D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-UC MTN 5.5D","item_group":"Cửa tấm liền Úc","uom":"m2","price_variant":"STANDARD","rate":405000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-UC MTN 5.5D:m2:STANDARD','CỬA ÚC MTN 5.5D','TP-UC MTN 5.5D; STANDARD; 405000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-UC MTN 6D STD MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-UC MTN 6D STD MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-UC MTN 6D STD MSK","item_group":"Cửa tấm liền Úc","uom":"m2","price_variant":"STANDARD","rate":485000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-UC MTN 6D STD MSK:m2:STANDARD','CỬA ÚC MTN STD 6D MSK','TP-UC MTN 6D STD MSK; STANDARD; 485000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-UC KT 6D STĐ MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-UC KT 6D STĐ MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-UC KT 6D STĐ MSK","item_group":"Cửa tấm liền Úc","uom":"m2","price_variant":"STANDARD","rate":465000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-UC KT 6D STĐ MSK:m2:STANDARD','CỬA ÚC KT 6D STĐ MSK','TP-UC KT 6D STĐ MSK; STANDARD; 465000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-DUC-KT AL70 (2 LỚP) STĐ MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-DUC-KT AL70 (2 LỚP) STĐ MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-DUC-KT AL70 (2 LỚP) STĐ MSK","item_group":"Cửa tấm liền Úc","uom":"m2","price_variant":"STANDARD","rate":855000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-DUC-KT AL70 (2 LỚP) STĐ MSK:m2:STANDARD','CỬA ĐỨC KÉO TAY AL70 (2 LỚP)','TP-DUC-KT AL70 (2 LỚP) STĐ MSK; STANDARD; 855000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-DUC-KT AL70 STĐ MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-DUC-KT AL70 STĐ MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-DUC-KT AL70 STĐ MSK","item_group":"Cửa tấm liền Úc","uom":"m2","price_variant":"STANDARD","rate":1173000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-DUC-KT AL70 STĐ MSK:m2:STANDARD','CỬA ĐỨC KÉO TAY AL70 (1 LỚP)','TP-DUC-KT AL70 STĐ MSK; STANDARD; 1173000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-KN:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-KN:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-KN","item_group":"Cửa tấm liền Úc","uom":"Bộ","price_variant":"STANDARD","rate":250000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-KN:Bộ:STANDARD','KHÓA NGANG','TP-KN; STANDARD; 250000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-OKHOA:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-OKHOA:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-OKHOA","item_group":"Cửa tấm liền Úc","uom":"Cái","price_variant":"STANDARD","rate":100000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-OKHOA:Cái:STANDARD','Ổ KHÓA NGANG','NVL-OKHOA; STANDARD; 100000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TIINOX:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TIINOX:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TIINOX","item_group":"Cửa tấm liền Úc","uom":"Bộ","price_variant":"STANDARD","rate":150000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TIINOX:Bộ:STANDARD','TI KHÓA NGANG','NVL-TIINOX; STANDARD; 150000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-BKAN:Bộ:STANDARD','Item Price','Bảng giá 31/07/2026:TP-BKAN:Bộ:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-BKAN","item_group":"Cửa tấm liền Úc","uom":"Bộ","price_variant":"STANDARD","rate":88000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-BKAN:Bộ:STANDARD','BÁT KHÓA ÂM NỀN','TP-BKAN; STANDARD; 88000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-LX-5.5 X 70 X 46V:Kg:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-LX-5.5 X 70 X 46V:Kg:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-LX-5.5 X 70 X 46V","item_group":"Cửa tấm liền Úc","uom":"Kg","price_variant":"STANDARD","rate":45000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-LX-5.5 X 70 X 46V:Kg:STANDARD','HH LÒ XO 46V','NVL-LX-5.5 X 70 X 46V; STANDARD; 45000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-LX-5.5 x 70 x 50V:Kg:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-LX-5.5 x 70 x 50V:Kg:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-LX-5.5 x 70 x 50V","item_group":"Cửa tấm liền Úc","uom":"Kg","price_variant":"STANDARD","rate":45000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-LX-5.5 x 70 x 50V:Kg:STANDARD','HH LÒ XO 50V','NVL-LX-5.5 x 70 x 50V; STANDARD; 45000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-LV-6.0 x 70 x 53V:Kg:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-LV-6.0 x 70 x 53V:Kg:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-LV-6.0 x 70 x 53V","item_group":"Cửa tấm liền Úc","uom":"Kg","price_variant":"STANDARD","rate":45000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-LV-6.0 x 70 x 53V:Kg:STANDARD','HH LÒ XO 53V','NVL-LV-6.0 x 70 x 53V; STANDARD; 45000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-LV-6.5 x 80 x 63V:Kg:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-LV-6.5 x 80 x 63V:Kg:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-LV-6.5 x 80 x 63V","item_group":"Cửa tấm liền Úc","uom":"Kg","price_variant":"STANDARD","rate":45000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-LV-6.5 x 80 x 63V:Kg:STANDARD','HH LÒ XO 63V','NVL-LV-6.5 x 80 x 63V; STANDARD; 45000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-LV-6.5 x 80 x 68V:Kg:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-LV-6.5 x 80 x 68V:Kg:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-LV-6.5 x 80 x 68V","item_group":"Cửa tấm liền Úc","uom":"Kg","price_variant":"STANDARD","rate":45000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-LV-6.5 x 80 x 68V:Kg:STANDARD','HH LÒ XO 68V','NVL-LV-6.5 x 80 x 68V; STANDARD; 45000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-LV-7.0 x 90 x 65V:Kg:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-LV-7.0 x 90 x 65V:Kg:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-LV-7.0 x 90 x 65V","item_group":"Cửa tấm liền Úc","uom":"Kg","price_variant":"STANDARD","rate":45000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-LV-7.0 x 90 x 65V:Kg:STANDARD','HH LÒ XO 65V','NVL-LV-7.0 x 90 x 65V; STANDARD; 45000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-LV-7.0 x 90 x 73V:Kg:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-LV-7.0 x 90 x 73V:Kg:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-LV-7.0 x 90 x 73V","item_group":"Cửa tấm liền Úc","uom":"Kg","price_variant":"STANDARD","rate":45000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-LV-7.0 x 90 x 73V:Kg:STANDARD','HH LÒ XO 73V','NVL-LV-7.0 x 90 x 73V; STANDARD; 45000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-LV-7.0 x 90 x 83V:Kg:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-LV-7.0 x 90 x 83V:Kg:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-LV-7.0 x 90 x 83V","item_group":"Cửa tấm liền Úc","uom":"Kg","price_variant":"STANDARD","rate":45000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-LV-7.0 x 90 x 83V:Kg:STANDARD','HH LÒ XO 83V','NVL-LV-7.0 x 90 x 83V; STANDARD; 45000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:HH RAY NHÔM ÚC:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:HH RAY NHÔM ÚC:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"HH RAY NHÔM ÚC","item_group":"Cửa tấm liền Úc","uom":"Mét","price_variant":"STANDARD","rate":195000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:HH RAY NHÔM ÚC:Mét:STANDARD','TP-RAYNHOMUC','HH RAY NHÔM ÚC; STANDARD; 195000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:HH PULY UC 34:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:HH PULY UC 34:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"HH PULY UC 34","item_group":"Cửa tấm liền Úc","uom":"Cái","price_variant":"STANDARD","rate":36000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:HH PULY UC 34:Cái:STANDARD','NVL-PULYUC34','HH PULY UC 34; STANDARD; 36000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:HH PULY 114:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:HH PULY 114:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"HH PULY 114","item_group":"Cửa tấm liền Úc","uom":"Cái","price_variant":"STANDARD","rate":38000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:HH PULY 114:Cái:STANDARD','NVL-PULYUC114','HH PULY 114; STANDARD; 38000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-GOIFE:Cặp:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-GOIFE:Cặp:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-GOIFE","item_group":"Cửa tấm liền Úc","uom":"Cặp","price_variant":"STANDARD","rate":65000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-GOIFE:Cặp:STANDARD','GỐI SẮT','NVL-GOIFE; STANDARD; 65000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-GIAT:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-GIAT:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-GIAT","item_group":"Cửa tấm liền Úc","uom":"Cái","price_variant":"STANDARD","rate":120000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-GIAT:Cái:STANDARD','GIÁ T','NVL-GIAT; STANDARD; 120000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TOLE1.2x190-KRON:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.2x190-KRON:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TOLE1.2x190-KRON","item_group":"Cửa tấm liền Úc","uom":"Mét","price_variant":"STANDARD","rate":70000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.2x190-KRON:Mét:STANDARD','RAY SẮT U70 (KHÔNG RON)','NVL-TOLE1.2x190-KRON; STANDARD; 70000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.2ly-KRON:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.2ly-KRON:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TOLE1.4x270x1.2ly-KRON","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":90000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.2ly-KRON:Mét:STANDARD','RAY SẮT U100-1.2ly (KHÔNG RON)','NVL-TOLE1.4x270x1.2ly-KRON; STANDARD; 90000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.2ly-CRON:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.2ly-CRON:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TOLE1.4x270x1.2ly-CRON","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":95000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.2ly-CRON:Mét:STANDARD','RAY SẮT U100-1.2ly (CÓ RON)','NVL-TOLE1.4x270x1.2ly-CRON; STANDARD; 95000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.4ly-KRON:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.4ly-KRON:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TOLE1.4x270x1.4ly-KRON","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":105000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.4ly-KRON:Mét:STANDARD','RAY SẮT U100-1.4ly (KHÔNG RON)','NVL-TOLE1.4x270x1.4ly-KRON; STANDARD; 105000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.4ly-CRON:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.4ly-CRON:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TOLE1.4x270x1.4ly-CRON","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":110000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.4ly-CRON:Mét:STANDARD','RAY SẮT U100-1.4ly (CÓ RON)','NVL-TOLE1.4x270x1.4ly-CRON; STANDARD; 110000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.4ly-CRON+TD:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.4ly-CRON+TD:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TOLE1.4x270x1.4ly-CRON+TD","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":135000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TOLE1.4x270x1.4ly-CRON+TD:Mét:STANDARD','RAY SẮT U100-1.4ly (CÓ RON+TỰ DỪNG)','NVL-TOLE1.4x270x1.4ly-CRON+TD; STANDARD; 135000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-RS7P (CÓ RON):Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-RS7P (CÓ RON):Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-RS7P (CÓ RON)","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":75000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-RS7P (CÓ RON):Mét:STANDARD','RAY SẮT U70 (CÓ RON)','TP-RS7P (CÓ RON); STANDARD; 75000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-V4_INOX:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-V4_INOX:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-V4_INOX","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":180000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-V4_INOX:Mét:STANDARD','V4_INOX_2ly','TP-V4_INOX; STANDARD; 180000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-V4_INOX_3LY:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-V4_INOX_3LY:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-V4_INOX_3LY","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":250000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-V4_INOX_3LY:Mét:STANDARD','V4_3ly','TP-V4_INOX_3LY; STANDARD; 250000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-RAYINOX-6P-RON:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-RAYINOX-6P-RON:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-RAYINOX-6P-RON","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":220000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-RAYINOX-6P-RON:Mét:STANDARD','RAY INOX 6P - CÓ RON','TP-RAYINOX-6P-RON; STANDARD; 220000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-RAYINOX-8P-RON:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-RAYINOX-8P-RON:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-RAYINOX-8P-RON","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":270000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-RAYINOX-8P-RON:Mét:STANDARD','RAY INOX 8P - CÓ RON','TP-RAYINOX-8P-RON; STANDARD; 270000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-RAYINOX-7P-KHONGRON:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:TP-RAYINOX-7P-KHONGRON:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-RAYINOX-7P-KHONGRON","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":250000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-RAYINOX-7P-KHONGRON:Mét:STANDARD','RAY INOX 7P - KHÔNG RON','TP-RAYINOX-7P-KHONGRON; STANDARD; 250000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-V4-KEM_TOLE75_STD:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-V4-KEM_TOLE75_STD:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-V4-KEM_TOLE75_STD","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":75000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-V4-KEM_TOLE75_STD:Mét:STANDARD','V4_KẼM','NVL-V4-KEM_TOLE75_STD; STANDARD; 75000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-V4_KEM_STD:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-V4_KEM_STD:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-V4_KEM_STD","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":55000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-V4_KEM_STD:Mét:STANDARD','V4_STĐ','NVL-V4_KEM_STD; STANDARD; 55000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-V5_KEM_STD:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-V5_KEM_STD:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-V5_KEM_STD","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":75000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-V5_KEM_STD:Mét:STANDARD','V4_KẼM','NVL-V5_KEM_STD; STANDARD; 75000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-V5_KEM_STD-02:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-V5_KEM_STD-02:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-V5_KEM_STD-02","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":55000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-V5_KEM_STD-02:Mét:STANDARD','V4_STĐ','NVL-V5_KEM_STD-02; STANDARD; 55000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-3X6M:Mét:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-3X6M:Mét:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-3X6M","item_group":"Phụ kiện","uom":"Mét","price_variant":"STANDARD","rate":25000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-3X6M:Mét:STANDARD','SẮT VUÔNG 3X6M','NVL-3X6M; STANDARD; 25000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOI-MV-STD - TM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOI-MV-STD - TM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOI-MV-STD - TM","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":450000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOI-MV-STD - TM:m2:STANDARD','CỬA LƯỚI MẮT VÕNG STĐ - TÁCH MÓN','TP-LUOI-MV-STD - TM; STANDARD; 450000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOI-MV-STD - TRONBO:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOI-MV-STD - TRONBO:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOI-MV-STD - TRONBO","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":590000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOI-MV-STD - TRONBO:m2:STANDARD','CỬA LƯỚI MẮT VÕNG STĐ- TRỌN BỘ','TP-LUOI-MV-STD - TRONBO; STANDARD; 590000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOI-SN-STD - TM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN-STD - TM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOI-SN-STD - TM","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":490000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN-STD - TM:m2:STANDARD','CỬA LƯỚI SN PHI 19 STD - TÁCH MÓN','TP-LUOI-SN-STD - TM; STANDARD; 490000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOI-SN-STD - TRONBO:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN-STD - TRONBO:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOI-SN-STD - TRONBO","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":630000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN-STD - TRONBO:m2:STANDARD','CỬA LƯỚI SN PHI 19 STD - TRỌN BỘ','TP-LUOI-SN-STD - TRONBO; STANDARD; 630000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOI-SN13x26-STD - TACHMON:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN13x26-STD - TACHMON:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOI-SN13x26-STD - TACHMON","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":570000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN13x26-STD - TACHMON:m2:STANDARD','CỬA LƯỚI SN PHI 13x26 STĐ - TÁCH MÓN','TP-LUOI-SN13x26-STD - TACHMON; STANDARD; 570000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOI-SN13x26-STD - TRONBO:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN13x26-STD - TRONBO:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOI-SN13x26-STD - TRONBO","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":750000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN13x26-STD - TRONBO:m2:STANDARD','CỬA LƯỚI SN PHI 13x26 STĐ - TRỌN BỘ','TP-LUOI-SN13x26-STD - TRONBO; STANDARD; 750000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOI-SN13x26-INOX - TACHMON:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN13x26-INOX - TACHMON:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOI-SN13x26-INOX - TACHMON","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":1500000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN13x26-INOX - TACHMON:m2:STANDARD','CỬA LƯỚI SN PHI 13x26 INOX - TÁCH MÓN','TP-LUOI-SN13x26-INOX - TACHMON; STANDARD; 1500000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOI-SN13x26-INOX - TRONBO:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN13x26-INOX - TRONBO:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOI-SN13x26-INOX - TRONBO","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":1710000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOI-SN13x26-INOX - TRONBO:m2:STANDARD','LƯỚI SN PHI 13X26 INOX - TRỌN BỘ','TP-LUOI-SN13x26-INOX - TRONBO; STANDARD; 1710000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOI-SNPHI19-INOX - TRONBO:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOI-SNPHI19-INOX - TRONBO:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOI-SNPHI19-INOX - TRONBO","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":1530000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOI-SNPHI19-INOX - TRONBO:m2:STANDARD','CỬA LƯỚI SN PHI 19 INOX- TRỌN BỘ','TP-LUOI-SNPHI19-INOX - TRONBO; STANDARD; 1530000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOI-SNPHI19-INOX - TM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOI-SNPHI19-INOX - TM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOI-SNPHI19-INOX - TM","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":1290000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOI-SNPHI19-INOX - TM:m2:STANDARD','CỬA LƯỚI SN PHI 19 STD - TÁCH MÓN','TP-LUOI-SNPHI19-INOX - TM; STANDARD; 1290000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOIMV-INOX- TM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOIMV-INOX- TM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOIMV-INOX- TM","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":1290000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOIMV-INOX- TM:m2:STANDARD','CỬA LƯỚI MẮT VÕNG INOX - TÁCH MÓN','TP-LUOIMV-INOX- TM; STANDARD; 1290000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LUOIMV-INOX- TRONBO:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LUOIMV-INOX- TRONBO:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LUOIMV-INOX- TRONBO","item_group":"Cửa Lưới","uom":"m2","price_variant":"STANDARD","rate":1530000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LUOIMV-INOX- TRONBO:m2:STANDARD','CỬA LƯỚI MẮT VÕNG INOX - TRỌN BỘ','TP-LUOIMV-INOX- TRONBO; STANDARD; 1530000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LADLINOX_6D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LADLINOX_6D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LADLINOX_6D","item_group":"Cửa Đài Loan Inox","uom":"m2","price_variant":"STANDARD","rate":1040000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LADLINOX_6D:m2:STANDARD','LÁ ĐL7.5 INOX 6D','TP-LADLINOX_6D; STANDARD; 1040000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LADLINOX_7D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LADLINOX_7D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LADLINOX_7D","item_group":"Cửa Đài Loan Inox","uom":"m2","price_variant":"STANDARD","rate":1160000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LADLINOX_7D:m2:STANDARD','LÁ ĐL7.5 INOX 7D','TP-LADLINOX_7D; STANDARD; 1160000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LADLINOX_8D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LADLINOX_8D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LADLINOX_8D","item_group":"Cửa Đài Loan Inox","uom":"m2","price_variant":"STANDARD","rate":1290000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LADLINOX_8D:m2:STANDARD','LÁ ĐL7.5 INOX 8D','TP-LADLINOX_8D; STANDARD; 1290000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-LADLINOX_1LY:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-LADLINOX_1LY:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-LADLINOX_1LY","item_group":"Cửa Đài Loan Inox","uom":"m2","price_variant":"STANDARD","rate":1650000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-LADLINOX_1LY:m2:STANDARD','LÁ ĐL7.5 INOX 1LY','TP-LADLINOX_1LY; STANDARD; 1650000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TON-DL5.2Dx124-XNVK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TON-DL5.2Dx124-XNVK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TON-DL5.2Dx124-XNVK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":280000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TON-DL5.2Dx124-XNVK:m2:STANDARD','TP LÁ ĐÀI LOAN 6D','NVL-TON-DL5.2Dx124-XNVK; STANDARD; 280000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TON-DL6.2Dx124-XNVK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TON-DL6.2Dx124-XNVK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TON-DL6.2Dx124-XNVK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":300000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TON-DL6.2Dx124-XNVK:m2:STANDARD','TP LÁ ĐÀI LOAN 7D','NVL-TON-DL6.2Dx124-XNVK; STANDARD; 300000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TON-DL7.2Dx124-XNVK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TON-DL7.2Dx124-XNVK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TON-DL7.2Dx124-XNVK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":320000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TON-DL7.2Dx124-XNVK:m2:STANDARD','TP LÁ ĐÀI LOAN 8D','NVL-TON-DL7.2Dx124-XNVK; STANDARD; 320000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL-TON-DL9.2Dx124-XNVK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:NVL-TON-DL9.2Dx124-XNVK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL-TON-DL9.2Dx124-XNVK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":380000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL-TON-DL9.2Dx124-XNVK:m2:STANDARD','TP LÁ ĐÀI LOAN 1LY','NVL-TON-DL9.2Dx124-XNVK; STANDARD; 380000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_6D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_6D","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":410000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D:m2:STANDARD','TP LÁ ĐÀI LOAN STĐ 8D','TP-TOLEKEM124_6D; STANDARD; 410000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_8D:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_8D","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":460000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D:m2:STANDARD','LÁ ĐÀI LOAN STĐ 1LY','TP-TOLEKEM124_8D; STANDARD; 460000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_1.2LY:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1.2LY:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_1.2LY","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":510000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1.2LY:m2:STANDARD','LÁ ĐÀI LOAN STĐ 1.2LY','TP-TOLEKEM124_1.2LY; STANDARD; 510000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL6D XN-VK_TRONBO>10m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-VK_TRONBO>10m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL6D XN-VK_TRONBO>10m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":380000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-VK_TRONBO>10m²:m2:STANDARD','CỬA ĐÀI LOAN 6D TRỌN BỘ >10m²','TP-CUADL6D XN-VK_TRONBO>10m²; STANDARD; 380000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_9-10m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_9-10m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL6D XN-XLC_TRONBO_9-10m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":390000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_9-10m²:m2:STANDARD','CỬA ĐL6D TRỌN BỘ_9-10m²','TP-CUADL6D XN-XLC_TRONBO_9-10m²; STANDARD; 390000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_8-9m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_8-9m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL6D XN-XLC_TRONBO_8-9m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":400000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_8-9m²:m2:STANDARD','CỬA ĐL6D TRỌN BỘ_8-9m²','TP-CUADL6D XN-XLC_TRONBO_8-9m²; STANDARD; 400000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL6D XN-VK_TRONBO_7-8m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-VK_TRONBO_7-8m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL6D XN-VK_TRONBO_7-8m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":410000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-VK_TRONBO_7-8m²:m2:STANDARD','CỬA ĐL6D TRỌN BỘ_7-8m²','TP-CUADL6D XN-VK_TRONBO_7-8m²; STANDARD; 410000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_6-7m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_6-7m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL6D XN-XLC_TRONBO_6-7m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":420000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_6-7m²:m2:STANDARD','CỬA ĐL6D TRỌN BỘ_6-7m²','TP-CUADL6D XN-XLC_TRONBO_6-7m²; STANDARD; 420000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_5-6m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_5-6m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL6D XN-XLC_TRONBO_5-6m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":430000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_5-6m²:m2:STANDARD','CỬA ĐL6D TRỌN BỘ_5-6m²','TP-CUADL6D XN-XLC_TRONBO_5-6m²; STANDARD; 430000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_4-5m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_4-5m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL6D XN-XLC_TRONBO_4-5m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":440000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-XLC_TRONBO_4-5m²:m2:STANDARD','CỬA ĐL6D TRỌN BỘ_4-5m²','TP-CUADL6D XN-XLC_TRONBO_4-5m²; STANDARD; 440000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL6D XN-VK_TRONBO_3-4m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-VK_TRONBO_3-4m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL6D XN-VK_TRONBO_3-4m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":450000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL6D XN-VK_TRONBO_3-4m²:m2:STANDARD','CỬA ĐL6D TRỌN BỘ_3-4m²','TP-CUADL6D XN-VK_TRONBO_3-4m²; STANDARD; 450000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL7D XN-VK_TRONBO>10m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-VK_TRONBO>10m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL7D XN-VK_TRONBO>10m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":410000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-VK_TRONBO>10m²:m2:STANDARD','CỬA ĐÀI LOAN 7D TRỌN BỘ >10m²','TP-CUADL7D XN-VK_TRONBO>10m²; STANDARD; 410000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_9-10m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_9-10m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL7D XN-XLC_TRONBO_9-10m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":420000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_9-10m²:m2:STANDARD','CỬA ĐL7D TRỌN BỘ_9-10m²','TP-CUADL7D XN-XLC_TRONBO_9-10m²; STANDARD; 420000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_8-9m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_8-9m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL7D XN-XLC_TRONBO_8-9m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":430000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_8-9m²:m2:STANDARD','CỬA ĐL7D TRỌN BỘ_8-9m²','TP-CUADL7D XN-XLC_TRONBO_8-9m²; STANDARD; 430000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL7D XN-VK_TRONBO_7-8m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-VK_TRONBO_7-8m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL7D XN-VK_TRONBO_7-8m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":440000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-VK_TRONBO_7-8m²:m2:STANDARD','CỬA ĐL7D TRỌN BỘ_7-8m²','TP-CUADL7D XN-VK_TRONBO_7-8m²; STANDARD; 440000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_6-7m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_6-7m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL7D XN-XLC_TRONBO_6-7m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":450000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_6-7m²:m2:STANDARD','CỬA ĐL7D TRỌN BỘ_6-7m²','TP-CUADL7D XN-XLC_TRONBO_6-7m²; STANDARD; 450000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_5-6m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_5-6m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL7D XN-XLC_TRONBO_5-6m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":460000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_5-6m²:m2:STANDARD','CỬA ĐL7D TRỌN BỘ_5-6m²','TP-CUADL7D XN-XLC_TRONBO_5-6m²; STANDARD; 460000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_4-5m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_4-5m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL7D XN-XLC_TRONBO_4-5m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":470000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-XLC_TRONBO_4-5m²:m2:STANDARD','CỬA ĐL7D TRỌN BỘ_4-5m²','TP-CUADL7D XN-XLC_TRONBO_4-5m²; STANDARD; 470000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL7D XN-VK_TRONBO_3-4m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-VK_TRONBO_3-4m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL7D XN-VK_TRONBO_3-4m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":480000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL7D XN-VK_TRONBO_3-4m²:m2:STANDARD','CỬA ĐL7D TRỌN BỘ_3-4m²','TP-CUADL7D XN-VK_TRONBO_3-4m²; STANDARD; 480000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO>10m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO>10m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL8D XN-VK_TRONBO>10m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":440000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO>10m²:m2:STANDARD','CỬA ĐÀI LOAN 8D TRỌN BỘ >10m²','TP-CUADL8D XN-VK_TRONBO>10m²; STANDARD; 440000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_9-10m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_9-10m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL8D XN-XLC_TRONBO_9-10m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":450000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_9-10m²:m2:STANDARD','CỬA ĐL8D TRỌN BỘ_9-10m²','TP-CUADL8D XN-XLC_TRONBO_9-10m²; STANDARD; 450000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_8-9m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_8-9m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL8D XN-XLC_TRONBO_8-9m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":460000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_8-9m²:m2:STANDARD','CỬA ĐL8D TRỌN BỘ_8-9m²','TP-CUADL8D XN-XLC_TRONBO_8-9m²; STANDARD; 460000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO_7-8m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO_7-8m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL8D XN-VK_TRONBO_7-8m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":470000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO_7-8m²:m2:STANDARD','CỬA ĐL8D TRỌN BỘ_7-8m²','TP-CUADL8D XN-VK_TRONBO_7-8m²; STANDARD; 470000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO_6-7m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO_6-7m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL8D XN-VK_TRONBO_6-7m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":480000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO_6-7m²:m2:STANDARD','CỬA ĐL8D TRỌN BỘ_6-7m²','TP-CUADL8D XN-VK_TRONBO_6-7m²; STANDARD; 480000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_5-6m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_5-6m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL8D XN-XLC_TRONBO_5-6m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":490000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_5-6m²:m2:STANDARD','CỬA ĐL8D TRỌN BỘ_5-6m²','TP-CUADL8D XN-XLC_TRONBO_5-6m²; STANDARD; 490000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_4-5m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_4-5m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL8D XN-XLC_TRONBO_4-5m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":500000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-XLC_TRONBO_4-5m²:m2:STANDARD','CỬA ĐL8D TRỌN BỘ_4-5m²','TP-CUADL8D XN-XLC_TRONBO_4-5m²; STANDARD; 500000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO_3-4m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO_3-4m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL8D XN-VK_TRONBO_3-4m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":520000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL8D XN-VK_TRONBO_3-4m²:m2:STANDARD','CỬA ĐL8D TRỌN BỘ_3-4m²','TP-CUADL8D XN-VK_TRONBO_3-4m²; STANDARD; 520000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO>10m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO>10m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_6D_TRONBO>10m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":500000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO>10m²_MSK:m2:STANDARD','CỬA ĐÀI LOAN STĐ 8D TRỌN BỘ >10m²','TP-TOLEKEM124_6D_TRONBO>10m²_MSK; STANDARD; 500000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO>10m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO>10m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_8D_TRONBO>10m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":560000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO>10m²_MSK:m2:STANDARD','CỬA ĐÀI LOAN STĐ 1LY TRỌN BỘ >10m²','TP-TOLEKEM124_8D_TRONBO>10m²_MSK; STANDARD; 560000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO>10m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO>10m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_1LY_TRONBO>10m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":620000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO>10m²_MSK:m2:STANDARD','CỬA ĐÀI LOAN STĐ 1.2LY TRỌN BỘ >10m²','TP-TOLEKEM124_1LY_TRONBO>10m²_MSK; STANDARD; 620000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL1LY XN-VK_TRONBO>10m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-VK_TRONBO>10m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL1LY XN-VK_TRONBO>10m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":520000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-VK_TRONBO>10m²:m2:STANDARD','CỬA ĐÀI LOAN 1LY TRỌN BỘ >10m²','TP-CUADL1LY XN-VK_TRONBO>10m²; STANDARD; 520000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_9-10m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_9-10m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_6D_TRONBO_9-10m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":510000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_9-10m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 8D_TRỌN BỘ 9-10m²','TP-TOLEKEM124_6D_TRONBO_9-10m²_MSK; STANDARD; 510000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_9-10m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_9-10m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_8D_TRONBO_9-10m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":570000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_9-10m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1LY_TRỌN BỘ 9-10m²','TP-TOLEKEM124_8D_TRONBO_9-10m²_MSK; STANDARD; 570000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_9-10m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_9-10m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_1LY_TRONBO_9-10m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":630000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_9-10m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1.2LY_TRỌN BỘ 9-10m²','TP-TOLEKEM124_1LY_TRONBO_9-10m²_MSK; STANDARD; 630000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_8-9m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_8-9m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_6D_TRONBO_8-9m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":520000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_8-9m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 8D_TRỌN BỘ 8-9m²','TP-TOLEKEM124_6D_TRONBO_8-9m²_MSK; STANDARD; 520000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_8-9m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_8-9m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_8D_TRONBO_8-9m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":580000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_8-9m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1LY_TRỌN BỘ 8-9m²','TP-TOLEKEM124_8D_TRONBO_8-9m²_MSK; STANDARD; 580000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_8-9m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_8-9m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_1LY_TRONBO_8-9m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":640000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_8-9m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1.2LY_TRỌN BỘ 8-9m²','TP-TOLEKEM124_1LY_TRONBO_8-9m²_MSK; STANDARD; 640000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_7-8m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_7-8m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_6D_TRONBO_7-8m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":530000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_7-8m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 8D_TRỌN BỘ 7-8m²','TP-TOLEKEM124_6D_TRONBO_7-8m²_MSK; STANDARD; 530000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_7-8m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_7-8m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_8D_TRONBO_7-8m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":590000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_7-8m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1LY_TRỌN BỘ 7-8m²','TP-TOLEKEM124_8D_TRONBO_7-8m²_MSK; STANDARD; 590000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_7-8m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_7-8m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_1LY_TRONBO_7-8m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":650000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_7-8m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1.2LY_TRỌN BỘ 7-8m²','TP-TOLEKEM124_1LY_TRONBO_7-8m²_MSK; STANDARD; 650000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_6-7m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_6-7m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_6D_TRONBO_6-7m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":540000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_6-7m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 8D_TRỌN BỘ 6-7m²','TP-TOLEKEM124_6D_TRONBO_6-7m²_MSK; STANDARD; 540000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_6-7m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_6-7m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_8D_TRONBO_6-7m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":600000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_6-7m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1LY_TRỌN BỘ 6-7m²','TP-TOLEKEM124_8D_TRONBO_6-7m²_MSK; STANDARD; 600000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_6-7m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_6-7m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_1LY_TRONBO_6-7m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":660000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_6-7m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1.2LY_TRỌN BỘ 6-7m²','TP-TOLEKEM124_1LY_TRONBO_6-7m²_MSK; STANDARD; 660000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_5-6m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_5-6m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_6D_TRONBO_5-6m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":550000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_5-6m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 8D_TRỌN BỘ 5-6m²','TP-TOLEKEM124_6D_TRONBO_5-6m²_MSK; STANDARD; 550000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_5-6m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_5-6m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_8D_TRONBO_5-6m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":610000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_5-6m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1LY_TRỌN BỘ 5-6m²','TP-TOLEKEM124_8D_TRONBO_5-6m²_MSK; STANDARD; 610000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_5-6m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_5-6m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_1LY_TRONBO_5-6m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":670000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_5-6m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1.2LY_TRỌN BỘ 5-6m²','TP-TOLEKEM124_1LY_TRONBO_5-6m²_MSK; STANDARD; 670000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_4-5m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_4-5m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_6D_TRONBO_4-5m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":560000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_4-5m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 8D_TRỌN BỘ 4-5m²','TP-TOLEKEM124_6D_TRONBO_4-5m²_MSK; STANDARD; 560000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_4-5m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_4-5m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_8D_TRONBO_4-5m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":620000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_4-5m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1LY_TRỌN BỘ 4-5m²','TP-TOLEKEM124_8D_TRONBO_4-5m²_MSK; STANDARD; 620000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_4-5m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_4-5m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_1LY_TRONBO_4-5m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":680000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_4-5m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1.2LY_TRỌN BỘ 4-5m²','TP-TOLEKEM124_1LY_TRONBO_4-5m²_MSK; STANDARD; 680000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_3-4m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_3-4m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_1LY_TRONBO_3-4m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":690000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_1LY_TRONBO_3-4m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1.2LY_TRỌN BỘ 3-4m²','TP-TOLEKEM124_1LY_TRONBO_3-4m²_MSK; STANDARD; 690000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_3-4m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_3-4m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_8D_TRONBO_3-4m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":630000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_8D_TRONBO_3-4m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 1LY_TRỌN BỘ 3-4m²','TP-TOLEKEM124_8D_TRONBO_3-4m²_MSK; STANDARD; 630000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_3-4m²_MSK:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_3-4m²_MSK:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TOLEKEM124_6D_TRONBO_3-4m²_MSK","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":570000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TOLEKEM124_6D_TRONBO_3-4m²_MSK:m2:STANDARD','LÁ ĐÀI LOAN STĐ MSK 8D_TRỌN BỘ 3-4m²','TP-TOLEKEM124_6D_TRONBO_3-4m²_MSK; STANDARD; 570000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_9-10m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_9-10m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL1LY XN-XLC_TRONBO_9-10m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":530000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_9-10m²:m2:STANDARD','CỬA ĐL1LY TRỌN BỘ_9-10m²','TP-CUADL1LY XN-XLC_TRONBO_9-10m²; STANDARD; 530000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_8-9m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_8-9m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL1LY XN-XLC_TRONBO_8-9m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":540000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_8-9m²:m2:STANDARD','CỬA ĐL1LY TRỌN BỘ_8-9m²','TP-CUADL1LY XN-XLC_TRONBO_8-9m²; STANDARD; 540000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_7-8m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_7-8m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL1LY XN-XLC_TRONBO_7-8m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":550000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_7-8m²:m2:STANDARD','CỬA ĐL1LY TRỌN BỘ_7-8m²','TP-CUADL1LY XN-XLC_TRONBO_7-8m²; STANDARD; 550000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_6-7m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_6-7m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL1LY XN-XLC_TRONBO_6-7m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":560000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_6-7m²:m2:STANDARD','CỬA ĐL1LY TRỌN BỘ_6-7m²','TP-CUADL1LY XN-XLC_TRONBO_6-7m²; STANDARD; 560000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_5-6m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_5-6m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL1LY XN-XLC_TRONBO_5-6m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":570000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_5-6m²:m2:STANDARD','CỬA ĐL1LY TRỌN BỘ_5-6m²','TP-CUADL1LY XN-XLC_TRONBO_5-6m²; STANDARD; 570000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_4-5m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_4-5m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL1LY XN-XLC_TRONBO_4-5m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":580000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_4-5m²:m2:STANDARD','CỬA ĐL1LY TRỌN BỘ_4-5m²','TP-CUADL1LY XN-XLC_TRONBO_4-5m²; STANDARD; 580000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_3-4m²:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_3-4m²:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUADL1LY XN-XLC_TRONBO_3-4m²","item_group":"Cửa Đài Loan","uom":"m2","price_variant":"STANDARD","rate":590000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUADL1LY XN-XLC_TRONBO_3-4m²:m2:STANDARD','CỬA ĐL1LY TRỌN BỘ_3-4m²','TP-CUADL1LY XN-XLC_TRONBO_3-4m²; STANDARD; 590000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUAST1LY_MM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUAST1LY_MM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUAST1LY_MM","item_group":"Cửa siêu trường","uom":"m2","price_variant":"STANDARD","rate":440000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUAST1LY_MM:m2:STANDARD','CỬA SIÊU TRƯỜNG MẠ MÀU 1LY','TP-CUAST1LY_MM; STANDARD; 440000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUAST1.1LY_MM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUAST1.1LY_MM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUAST1.1LY_MM","item_group":"Cửa siêu trường","uom":"m2","price_variant":"STANDARD","rate":490000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUAST1.1LY_MM:m2:STANDARD','CỬA SIÊU TRƯỜNG STD 1.1LY','TP-CUAST1.1LY_MM; STANDARD; 490000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUAST1.2LY_MM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUAST1.2LY_MM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUAST1.2LY_MM","item_group":"Cửa siêu trường","uom":"m2","price_variant":"STANDARD","rate":520000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUAST1.2LY_MM:m2:STANDARD','CỬA SIÊU TRƯỜNG STD 1.2LY','TP-CUAST1.2LY_MM; STANDARD; 520000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUAST1.3LY_MM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUAST1.3LY_MM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUAST1.3LY_MM","item_group":"Cửa siêu trường","uom":"m2","price_variant":"STANDARD","rate":540000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUAST1.3LY_MM:m2:STANDARD','CỬA SIÊU TRƯỜNG STD 1.3LY','TP-CUAST1.3LY_MM; STANDARD; 540000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUAST1.4LY_MM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUAST1.4LY_MM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUAST1.4LY_MM","item_group":"Cửa siêu trường","uom":"m2","price_variant":"STANDARD","rate":580000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUAST1.4LY_MM:m2:STANDARD','CỬA SIÊU TRƯỜNG STD 1.4LY','TP-CUAST1.4LY_MM; STANDARD; 580000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUAST1.5LY_MM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUAST1.5LY_MM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUAST1.5LY_MM","item_group":"Cửa siêu trường","uom":"m2","price_variant":"STANDARD","rate":610000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUAST1.5LY_MM:m2:STANDARD','CỬA SIÊU TRƯỜNG STD 1.5LY','TP-CUAST1.5LY_MM; STANDARD; 610000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-CUAST1.6LY_MM:m2:STANDARD','Item Price','Bảng giá 31/07/2026:TP-CUAST1.6LY_MM:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-CUAST1.6LY_MM","item_group":"Cửa siêu trường","uom":"m2","price_variant":"STANDARD","rate":640000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-CUAST1.6LY_MM:m2:STANDARD','CỬA SIÊU TRƯỜNG STD 1.6LY','TP-CUAST1.6LY_MM; STANDARD; 640000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:ST-10L:m2:STANDARD','Item Price','Bảng giá 31/07/2026:ST-10L:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"ST-10L","item_group":"Cửa siêu trường","uom":"m2","price_variant":"STANDARD","rate":440000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:ST-10L:m2:STANDARD','Lá Đài Loan bản 100 (1.0 ly)','ST-10L; STANDARD; 440000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:ST-12L:m2:STANDARD','Item Price','Bảng giá 31/07/2026:ST-12L:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"ST-12L","item_group":"Cửa siêu trường","uom":"m2","price_variant":"STANDARD","rate":520000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:ST-12L:m2:STANDARD','Lá Đài Loan bản 100 (1.2 ly)','ST-12L; STANDARD; 520000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:ST-15L:m2:STANDARD','Item Price','Bảng giá 31/07/2026:ST-15L:m2:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"ST-15L","item_group":"Cửa siêu trường","uom":"m2","price_variant":"STANDARD","rate":610000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:ST-15L:m2:STANDARD','Lá Đài Loan bản 100 (1.5 ly)','ST-15L; STANDARD; 610000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:NVL_Hoakhe:Cái:STANDARD','Item Price','Bảng giá 31/07/2026:NVL_Hoakhe:Cái:STANDARD','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"NVL_Hoakhe","item_group":"","uom":"Cái","price_variant":"STANDARD","rate":50000,"currency":"VND","valid_from":"2026-07-31","note":"Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:NVL_Hoakhe:Cái:STANDARD','HOA KHẾ','NVL_Hoakhe; STANDARD; 50000 VND; 31/07/2026','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Price List:Bảng giá 31/07/2026','Price List','Bảng giá 31/07/2026','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list_name":"Bảng giá 31/07/2026","currency":"VND","valid_from":"2026-07-31","note":"Bảng giá tiền mặt, áp dụng từ 31/07/2026.","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Price List','Bảng giá 31/07/2026','Bảng giá 31/07/2026','Bảng giá tiền mặt Alumdoor, áp dụng 31/07/2026.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TD-AL595','Sales Package','PKG-DUC-TANG-RAY:TD-AL595','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TD-AL595","package_name":"ĐỨC AL595 – Tặng ray","item_code":"TD-AL595","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TD-AL595","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TD-AL595','ĐỨC AL595 – Tặng ray','TD-AL595; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TD-AL595','Sales Option','DUC-TANG-RAY-8M2:TD-AL595','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TD-AL595","option_label":"Tặng ray (từ 8 m²)","item_code":"TD-AL595","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TD-AL595","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TD-AL595','Tặng ray – ĐỨC AL595','TD-AL595; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TD-AL595:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TD-AL595:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TD-AL595","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TD-AL595","price_variant":"WITH_RAIL","rate":1095000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TD-AL595:m2:WITH_RAIL','ĐỨC AL595 – Tặng ray','TD-AL595; WITH_RAIL; 1095000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-TD-AL71N','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL71N','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-TD-AL71N","package_name":"ĐỨC AL71N – Tặng ray","item_code":"TP-TD-AL71N","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-TD-AL71N","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL71N','ĐỨC AL71N – Tặng ray','TP-TD-AL71N; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-TD-AL71N','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL71N','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-TD-AL71N","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-TD-AL71N","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-TD-AL71N","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL71N','Tặng ray – ĐỨC AL71N','TP-TD-AL71N; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL71N:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-TD-AL71N:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL71N","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-TD-AL71N","price_variant":"WITH_RAIL","rate":1170000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL71N:m2:WITH_RAIL','ĐỨC AL71N – Tặng ray','TP-TD-AL71N; WITH_RAIL; 1170000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-TD-AL503N26','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL503N26','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-TD-AL503N26","package_name":"ĐỨC AL503N – Tặng ray","item_code":"TP-TD-AL503N26","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-TD-AL503N26","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL503N26','ĐỨC AL503N – Tặng ray','TP-TD-AL503N26; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-TD-AL503N26','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL503N26','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-TD-AL503N26","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-TD-AL503N26","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-TD-AL503N26","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL503N26','Tặng ray – ĐỨC AL503N','TP-TD-AL503N26; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL503N26:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-TD-AL503N26:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL503N26","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-TD-AL503N26","price_variant":"WITH_RAIL","rate":1275000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL503N26:m2:WITH_RAIL','ĐỨC AL503N – Tặng ray','TP-TD-AL503N26; WITH_RAIL; 1275000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-ALD-548N','Sales Package','PKG-DUC-TANG-RAY:TP-ALD-548N','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-ALD-548N","package_name":"ĐỨC AL548N – Tặng ray","item_code":"TP-ALD-548N","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-ALD-548N","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-ALD-548N','ĐỨC AL548N – Tặng ray','TP-ALD-548N; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-ALD-548N','Sales Option','DUC-TANG-RAY-8M2:TP-ALD-548N','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-ALD-548N","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-ALD-548N","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-ALD-548N","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-ALD-548N','Tặng ray – ĐỨC AL548N','TP-ALD-548N; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-ALD-548N:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-ALD-548N:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-ALD-548N","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-ALD-548N","price_variant":"WITH_RAIL","rate":1362000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-ALD-548N:m2:WITH_RAIL','ĐỨC AL548N – Tặng ray','TP-ALD-548N; WITH_RAIL; 1362000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-TD-AL501N','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL501N','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-TD-AL501N","package_name":"ĐỨC AL501N – Tặng ray","item_code":"TP-TD-AL501N","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-TD-AL501N","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL501N','ĐỨC AL501N – Tặng ray','TP-TD-AL501N; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-TD-AL501N','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL501N','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-TD-AL501N","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-TD-AL501N","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-TD-AL501N","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL501N','Tặng ray – ĐỨC AL501N','TP-TD-AL501N; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL501N:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-TD-AL501N:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL501N","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-TD-AL501N","price_variant":"WITH_RAIL","rate":1446000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL501N:m2:WITH_RAIL','ĐỨC AL501N – Tặng ray','TP-TD-AL501N; WITH_RAIL; 1446000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-TD-AL652','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL652','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-TD-AL652","package_name":"ĐỨC AL652 – Tặng ray","item_code":"TP-TD-AL652","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-TD-AL652","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL652','ĐỨC AL652 – Tặng ray','TP-TD-AL652; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-TD-AL652','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL652','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-TD-AL652","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-TD-AL652","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-TD-AL652","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL652','Tặng ray – ĐỨC AL652','TP-TD-AL652; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL652:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-TD-AL652:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL652","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-TD-AL652","price_variant":"WITH_RAIL","rate":1506000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL652:m2:WITH_RAIL','ĐỨC AL652 – Tặng ray','TP-TD-AL652; WITH_RAIL; 1506000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-ALD-DL552','Sales Package','PKG-DUC-TANG-RAY:TP-ALD-DL552','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-ALD-DL552","package_name":"ĐỨC AL552N – Tặng ray","item_code":"TP-ALD-DL552","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-ALD-DL552","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-ALD-DL552','ĐỨC AL552N – Tặng ray','TP-ALD-DL552; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-ALD-DL552','Sales Option','DUC-TANG-RAY-8M2:TP-ALD-DL552','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-ALD-DL552","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-ALD-DL552","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-ALD-DL552","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-ALD-DL552','Tặng ray – ĐỨC AL552N','TP-ALD-DL552; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-ALD-DL552:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-ALD-DL552:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-ALD-DL552","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-ALD-DL552","price_variant":"WITH_RAIL","rate":1615000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-ALD-DL552:m2:WITH_RAIL','ĐỨC AL552N – Tặng ray','TP-ALD-DL552; WITH_RAIL; 1615000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-AL752N-TANG-RAY','Sales Package','PKG-DUC-AL752N-TANG-RAY','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-AL752N-TANG-RAY","package_name":"ĐỨC AL752N – Tặng ray","item_code":"TP-TD-AL752N","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-TD-AL752N","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-AL752N-TANG-RAY','ĐỨC AL752N – Tặng ray','TP-TD-AL752N; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-AL752N-TANG-RAY-10M2','Sales Option','DUC-AL752N-TANG-RAY-10M2','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-TD-AL752N","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-TD-AL752N","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-AL752N-TANG-RAY","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-AL752N-TANG-RAY-10M2','Tặng ray – ĐỨC AL752N','TP-TD-AL752N; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL752N:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-TD-AL752N:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL752N","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-AL752N-TANG-RAY-10M2","price_variant":"WITH_RAIL","rate":1641000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL752N:m2:WITH_RAIL','ĐỨC AL752N – Tặng ray','TP-TD-AL752N; WITH_RAIL; 1641000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-TD-AL50','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL50','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-TD-AL50","package_name":"ĐỨC AL50 – Tặng ray","item_code":"TP-TD-AL50","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-TD-AL50","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL50','ĐỨC AL50 – Tặng ray','TP-TD-AL50; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-TD-AL50','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL50','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-TD-AL50","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-TD-AL50","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-TD-AL50","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL50','Tặng ray – ĐỨC AL50','TP-TD-AL50; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL50:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-TD-AL50:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL50","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-TD-AL50","price_variant":"WITH_RAIL","rate":1760000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL50:m2:WITH_RAIL','ĐỨC AL50 – Tặng ray','TP-TD-AL50; WITH_RAIL; 1760000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-ALVIP50','Sales Package','PKG-DUC-TANG-RAY:TP-ALVIP50','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-ALVIP50","package_name":"ĐỨC AL-VIP50 – Tặng ray","item_code":"TP-ALVIP50","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-ALVIP50","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-ALVIP50','ĐỨC AL-VIP50 – Tặng ray','TP-ALVIP50; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-ALVIP50','Sales Option','DUC-TANG-RAY-8M2:TP-ALVIP50','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-ALVIP50","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-ALVIP50","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-ALVIP50","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-ALVIP50','Tặng ray – ĐỨC AL-VIP50','TP-ALVIP50; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-ALVIP50:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-ALVIP50:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-ALVIP50","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-ALVIP50","price_variant":"WITH_RAIL","rate":1853000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-ALVIP50:m2:WITH_RAIL','ĐỨC AL-VIP50 – Tặng ray','TP-ALVIP50; WITH_RAIL; 1853000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-ALVIPST500','Sales Package','PKG-DUC-TANG-RAY:TP-ALVIPST500','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-ALVIPST500","package_name":"ĐỨC AL-VIPST500 – Tặng ray","item_code":"TP-ALVIPST500","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-ALVIPST500","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-ALVIPST500','ĐỨC AL-VIPST500 – Tặng ray','TP-ALVIPST500; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-ALVIPST500','Sales Option','DUC-TANG-RAY-8M2:TP-ALVIPST500','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-ALVIPST500","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-ALVIPST500","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-ALVIPST500","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-ALVIPST500','Tặng ray – ĐỨC AL-VIPST500','TP-ALVIPST500; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-ALVIPST500:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-ALVIPST500:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-ALVIPST500","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-ALVIPST500","price_variant":"WITH_RAIL","rate":2183000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-ALVIPST500:m2:WITH_RAIL','ĐỨC AL-VIPST500 – Tặng ray','TP-ALVIPST500; WITH_RAIL; 2183000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-ALVIPST700','Sales Package','PKG-DUC-TANG-RAY:TP-ALVIPST700','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-ALVIPST700","package_name":"ĐỨC AL-VIPST700 – Tặng ray","item_code":"TP-ALVIPST700","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-ALVIPST700","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-ALVIPST700','ĐỨC AL-VIPST700 – Tặng ray','TP-ALVIPST700; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-ALVIPST700','Sales Option','DUC-TANG-RAY-8M2:TP-ALVIPST700','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-ALVIPST700","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-ALVIPST700","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-ALVIPST700","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-ALVIPST700','Tặng ray – ĐỨC AL-VIPST700','TP-ALVIPST700; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-ALVIPST700:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-ALVIPST700:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-ALVIPST700","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-ALVIPST700","price_variant":"WITH_RAIL","rate":2298000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-ALVIPST700:m2:WITH_RAIL','ĐỨC AL-VIPST700 – Tặng ray','TP-ALVIPST700; WITH_RAIL; 2298000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-TD-AL70 (2 LỚP)','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL70 (2 LỚP)','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-TD-AL70 (2 LỚP)","package_name":"ĐỨC AL70 (2 LỚP) – Tặng ray","item_code":"TP-TD-AL70 (2 LỚP)","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-TD-AL70 (2 LỚP)","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-TD-AL70 (2 LỚP)','ĐỨC AL70 (2 LỚP) – Tặng ray','TP-TD-AL70 (2 LỚP); cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-TD-AL70 (2 LỚP)','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL70 (2 LỚP)','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-TD-AL70 (2 LỚP)","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-TD-AL70 (2 LỚP)","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-TD-AL70 (2 LỚP)","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-TD-AL70 (2 LỚP)','Tặng ray – ĐỨC AL70 (2 LỚP)','TP-TD-AL70 (2 LỚP); dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-TD-AL70 (2 LỚP):m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-TD-AL70 (2 LỚP):m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-TD-AL70 (2 LỚP)","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-TD-AL70 (2 LỚP)","price_variant":"WITH_RAIL","rate":918000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-TD-AL70 (2 LỚP):m2:WITH_RAIL','ĐỨC AL70 (2 LỚP) – Tặng ray','TP-TD-AL70 (2 LỚP); WITH_RAIL; 918000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-AL70-1LOP','Sales Package','PKG-DUC-TANG-RAY:TP-AL70-1LOP','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-AL70-1LOP","package_name":"ĐỨC AL70 (1 LỚP) – Tặng ray","item_code":"TP-AL70-1LOP","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-AL70-1LOP","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-AL70-1LOP','ĐỨC AL70 (1 LỚP) – Tặng ray','TP-AL70-1LOP; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-AL70-1LOP','Sales Option','DUC-TANG-RAY-8M2:TP-AL70-1LOP','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-AL70-1LOP","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-AL70-1LOP","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-AL70-1LOP","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-AL70-1LOP','Tặng ray – ĐỨC AL70 (1 LỚP)','TP-AL70-1LOP; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-AL70-1LOP:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-AL70-1LOP:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-AL70-1LOP","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-AL70-1LOP","price_variant":"WITH_RAIL","rate":1221000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-AL70-1LOP:m2:WITH_RAIL','ĐỨC AL70 (1 LỚP) – Tặng ray','TP-AL70-1LOP; WITH_RAIL; 1221000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Package:PKG-DUC-TANG-RAY:TP-AL75','Sales Package','PKG-DUC-TANG-RAY:TP-AL75','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"package_code":"PKG-DUC-TANG-RAY:TP-AL75","package_name":"ĐỨC AL75 – Tặng ray","item_code":"TP-AL75","item_group":"Cửa CN Đức","selection_mode":"ALL","valid_from":"2026-07-31","items":[{"component_key":"DOOR","item_code":"TP-AL75","uom":"m2","qty_basis":"AREA","factor":1,"required":true,"default_selected":true,"role":"Cửa bán"},{"component_key":"GIFT_RAIL","item_code":"PK_TANGRAY","uom":"Mét","qty_basis":"HEIGHT","factor":2,"required":true,"default_selected":true,"role":"Ray tặng, hai bên theo chiều cao"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Package','PKG-DUC-TANG-RAY:TP-AL75','ĐỨC AL75 – Tặng ray','TP-AL75; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Sales Option:DUC-TANG-RAY-8M2:TP-AL75','Sales Option','DUC-TANG-RAY-8M2:TP-AL75','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"option_code":"DUC-TANG-RAY-8M2:TP-AL75","option_label":"Tặng ray (từ 8 m²)","item_code":"TP-AL75","item_group":"Cửa CN Đức","conditions":[{"field":"billable_area_sqm","op":"gte","value":8}],"price_variant":"WITH_RAIL","discount_basis_variant":"STANDARD","sales_package":"PKG-DUC-TANG-RAY:TP-AL75","priority":90,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Sales Option','DUC-TANG-RAY-8M2:TP-AL75','Tặng ray – ĐỨC AL75','TP-AL75; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Item Price:Bảng giá 31/07/2026:TP-AL75:m2:WITH_RAIL','Item Price','Bảng giá 31/07/2026:TP-AL75:m2:WITH_RAIL','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"price_list":"Bảng giá 31/07/2026","item_code":"TP-AL75","item_group":"Cửa CN Đức","uom":"m2","sales_option":"DUC-TANG-RAY-8M2:TP-AL75","price_variant":"WITH_RAIL","rate":1378000,"currency":"VND","valid_from":"2026-07-31","note":"Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².","disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Item Price','Bảng giá 31/07/2026:TP-AL75:m2:WITH_RAIL','ĐỨC AL75 – Tặng ray','TP-AL75; WITH_RAIL; 1378000 VND/m²; từ 8 m².','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Pricing Scope:CỬA NHỎ ÁP DỤNG PHỤ THU','Pricing Scope','CỬA NHỎ ÁP DỤNG PHỤ THU','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"scope_name":"CỬA NHỎ ÁP DỤNG PHỤ THU","members":[{"member_type":"Item Group","item_group":"Cửa CN Đức"},{"member_type":"Item Group","item_group":"Cửa Lưới"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Pricing Scope','CỬA NHỎ ÁP DỤNG PHỤ THU','CỬA NHỎ ÁP DỤNG PHỤ THU','Cửa CN Đức; Cửa Lưới','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Pricing Scope:CỬA ÚC ÁP DỤNG PHỤ THU','Pricing Scope','CỬA ÚC ÁP DỤNG PHỤ THU','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"scope_name":"CỬA ÚC ÁP DỤNG PHỤ THU","members":[{"member_type":"Item Group","item_group":"Cửa tấm liền Úc"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Pricing Scope','CỬA ÚC ÁP DỤNG PHỤ THU','CỬA ÚC ÁP DỤNG PHỤ THU','Cửa tấm liền Úc','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Pricing Scope:CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ','Pricing Scope','CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"scope_name":"CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ","members":[{"member_type":"Item Group","item_group":"Cửa Đài Loan"},{"member_type":"Item Group","item_group":"Cửa Lưới"}],"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Pricing Scope','CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ','CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ','Cửa Đài Loan; Cửa Lưới','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Pricing Rule:PHỤ THU CỬA NHỎ <8M2','Pricing Rule','PHỤ THU CỬA NHỎ <8M2','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"title":"Phụ thu vận chuyển cửa Đức/lưới dưới 8 m² +300.000/bộ","effect_type":"ADJUSTMENT","price_list":"Bảng giá 31/07/2026","pricing_scope":"CỬA NHỎ ÁP DỤNG PHỤ THU","adjustment_basis":"SET_COUNT","adjustment_rate":300000,"conditions":[{"field":"billable_area_sqm","operator":"lt","value":8}],"priority":100,"taxable":true,"discountable":false,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Pricing Rule','PHỤ THU CỬA NHỎ <8M2','Phụ thu vận chuyển cửa Đức/lưới dưới 8 m² +300.000/bộ','CỬA NHỎ ÁP DỤNG PHỤ THU; 300000 VND; SET_COUNT','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Pricing Rule:PHỤ THU CỬA ÚC 4-7M2','Pricing Rule','PHỤ THU CỬA ÚC 4-7M2','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"title":"Phụ thu cửa Úc trên 4 và dưới 7 m² +300.000/bộ","effect_type":"ADJUSTMENT","price_list":"Bảng giá 31/07/2026","pricing_scope":"CỬA ÚC ÁP DỤNG PHỤ THU","adjustment_basis":"SET_COUNT","adjustment_rate":300000,"conditions":[{"field":"billable_area_sqm","operator":"gt","value":4},{"field":"billable_area_sqm","operator":"lt","value":7}],"priority":100,"taxable":true,"discountable":false,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Pricing Rule','PHỤ THU CỬA ÚC 4-7M2','Phụ thu cửa Úc trên 4 và dưới 7 m² +300.000/bộ','CỬA ÚC ÁP DỤNG PHỤ THU; 300000 VND; SET_COUNT','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Pricing Rule:PHỤ THU KHỔ CỬA 6-7.5M','Pricing Rule','PHỤ THU KHỔ CỬA 6-7.5M','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"title":"Phụ thu khổ ngang trên 6 đến dưới 7,5 m +40.000/m²","effect_type":"ADJUSTMENT","price_list":"Bảng giá 31/07/2026","pricing_scope":"CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ","adjustment_basis":"AREA_SQM","adjustment_rate":40000,"conditions":[{"field":"width_m","operator":"gt","value":6},{"field":"width_m","operator":"lt","value":7.5}],"priority":100,"taxable":true,"discountable":false,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Pricing Rule','PHỤ THU KHỔ CỬA 6-7.5M','Phụ thu khổ ngang trên 6 đến dưới 7,5 m +40.000/m²','CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ; 40000 VND; AREA_SQM','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES('demo','Pricing Rule:PHỤ THU KHỔ CỬA 7.5-9M','Pricing Rule','PHỤ THU KHỔ CỬA 7.5-9M','codex-local',0,'Draft',1,'2026-08-12T03:43:18.826Z','2026-08-12T03:43:18.826Z','codex-local',json('{"title":"Phụ thu khổ ngang trên 7,5 đến dưới 9 m +60.000/m²","effect_type":"ADJUSTMENT","price_list":"Bảng giá 31/07/2026","pricing_scope":"CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ","adjustment_basis":"AREA_SQM","adjustment_rate":60000,"conditions":[{"field":"width_m","operator":"gt","value":7.5},{"field":"width_m","operator":"lt","value":9}],"priority":100,"taxable":true,"discountable":false,"disabled":false}'))
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES('demo','Pricing Rule','PHỤ THU KHỔ CỬA 7.5-9M','Phụ thu khổ ngang trên 7,5 đến dưới 9 m +60.000/m²','CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ; 60000 VND; AREA_SQM','2026-08-12T03:43:18.826Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;

UPDATE documents
SET payload_json=json_set(payload_json,'$.applies_to_groups',(
  SELECT json_group_array(json_object('row_id','SCOPE-' || item_group, 'item_group',item_group))
  FROM (
    SELECT DISTINCT item_group FROM (
      SELECT json_extract(value,'$.item_group') AS item_group
      FROM json_each(documents.payload_json,'$.applies_to_groups')
      UNION ALL SELECT 'Phụ kiện CN Đức'
    )
  )
)) , version=version+1,modified_at='2026-08-12T03:43:18.826Z',modified_by='codex-local'
WHERE tenant_id='demo' AND doctype='Item Color' AND name<>'THÔ'
  AND EXISTS (SELECT 1 FROM json_each(documents.payload_json,'$.applies_to_groups') WHERE json_extract(value,'$.item_group')='Cửa CN Đức');
