-- Seven canonical Alumdoor material-tracking templates for the local demo tenant.
-- Idempotent: rerunning updates the canonical payloads and search rows without duplicates.

INSERT INTO documents
  (tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES
  ('demo','Measurement Profile:Hàng thường','Measurement Profile','Hàng thường','admin',0,'Draft',1,'2026-08-11T00:00:00.000Z','2026-08-11T00:00:00.000Z','admin',
   '{"profile_name":"Hàng thường","inventory_mode":"Hàng thường","stock_uom":"Cái","track_dimension_lot":false,"require_color":false,"require_condition":false,"require_length":false,"require_width":false,"require_piece_qty":false,"track_bundle_qty":false,"disabled":false,"_migration_source":"alumdoor-measurement-profiles-2026-08-11"}'),
  ('demo','Measurement Profile:Nhôm cây/lá','Measurement Profile','Nhôm cây/lá','admin',0,'Draft',1,'2026-08-11T00:00:00.000Z','2026-08-11T00:00:00.000Z','admin',
   '{"profile_name":"Nhôm cây/lá","inventory_mode":"Nhôm cây/lá","stock_uom":"Cây","track_dimension_lot":true,"require_color":true,"require_condition":true,"require_length":true,"require_width":false,"require_piece_qty":true,"track_bundle_qty":true,"weight_tolerance_pct":13,"note":"Cây/Lá là đơn vị tồn; số bó chỉ để theo dõi; Kg là khối lượng cân/định giá khi áp dụng.","disabled":false,"_migration_source":"alumdoor-measurement-profiles-2026-08-11"}'),
  ('demo','Measurement Profile:Ống/trục','Measurement Profile','Ống/trục','admin',0,'Draft',1,'2026-08-11T00:00:00.000Z','2026-08-11T00:00:00.000Z','admin',
   '{"profile_name":"Ống/trục","inventory_mode":"Nhôm cây/lá","stock_uom":"Kg","track_dimension_lot":true,"require_color":false,"require_condition":true,"require_length":true,"require_width":false,"require_piece_qty":true,"track_bundle_qty":true,"weight_tolerance_pct":13,"note":"Mua và tồn theo Kg; bán theo Mét; số cây và số bó chỉ dùng để theo dõi giao nhận.","disabled":false,"_migration_source":"alumdoor-measurement-profiles-2026-08-11"}'),
  ('demo','Measurement Profile:Tấm/Kính','Measurement Profile','Tấm/Kính','admin',0,'Draft',1,'2026-08-11T00:00:00.000Z','2026-08-11T00:00:00.000Z','admin',
   '{"profile_name":"Tấm/Kính","inventory_mode":"Tấm/Kính","stock_uom":"Tấm","track_dimension_lot":true,"require_color":false,"require_condition":false,"require_length":true,"require_width":true,"require_piece_qty":true,"track_bundle_qty":false,"disabled":false,"_migration_source":"alumdoor-measurement-profiles-2026-08-11"}'),
  ('demo','Measurement Profile:Cuộn','Measurement Profile','Cuộn','admin',0,'Draft',1,'2026-08-11T00:00:00.000Z','2026-08-11T00:00:00.000Z','admin',
   '{"profile_name":"Cuộn","inventory_mode":"Cuộn","stock_uom":"Kg","track_dimension_lot":true,"require_color":false,"require_condition":false,"require_length":false,"require_width":true,"require_piece_qty":false,"track_bundle_qty":false,"disabled":false,"_migration_source":"alumdoor-measurement-profiles-2026-08-11"}'),
  ('demo','Measurement Profile:Lô/Serial','Measurement Profile','Lô/Serial','admin',0,'Draft',1,'2026-08-11T00:00:00.000Z','2026-08-11T00:00:00.000Z','admin',
   '{"profile_name":"Lô/Serial","inventory_mode":"Lô/Serial","stock_uom":"Cái","track_dimension_lot":false,"require_color":false,"require_condition":false,"require_length":false,"require_width":false,"require_piece_qty":false,"track_bundle_qty":false,"disabled":false,"_migration_source":"alumdoor-measurement-profiles-2026-08-11"}'),
  ('demo','Measurement Profile:Thành phẩm theo m2','Measurement Profile','Thành phẩm theo m2','admin',0,'Draft',1,'2026-08-11T00:00:00.000Z','2026-08-11T00:00:00.000Z','admin',
   '{"profile_name":"Thành phẩm theo m2","inventory_mode":"Thành phẩm theo m2","stock_uom":"Bộ","track_dimension_lot":false,"require_color":true,"require_condition":false,"require_length":true,"require_width":true,"require_piece_qty":false,"track_bundle_qty":false,"disabled":false,"_migration_source":"alumdoor-measurement-profiles-2026-08-11"}')
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,
  modified_at=excluded.modified_at,
  modified_by=excluded.modified_by,
  version=documents.version+1;

INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES
  ('demo','Measurement Profile','Hàng thường','Hàng thường','Hàng thường Cái số lượng theo đơn vị tồn','2026-08-11T00:00:00.000Z'),
  ('demo','Measurement Profile','Nhôm cây/lá','Nhôm cây/lá','Nhôm cây lá Cây chiều dài màu tình trạng số bó theo dõi Kg cân','2026-08-11T00:00:00.000Z'),
  ('demo','Measurement Profile','Ống/trục','Ống/trục','Ống trục Kg chiều dài số cây số bó đối chiếu barem','2026-08-11T00:00:00.000Z'),
  ('demo','Measurement Profile','Tấm/Kính','Tấm/Kính','Tấm kính chiều dài chiều rộng số tấm','2026-08-11T00:00:00.000Z'),
  ('demo','Measurement Profile','Cuộn','Cuộn','Cuộn Kg khổ rộng lô','2026-08-11T00:00:00.000Z'),
  ('demo','Measurement Profile','Lô/Serial','Lô/Serial','Lô serial Cái','2026-08-11T00:00:00.000Z'),
  ('demo','Measurement Profile','Thành phẩm theo m2','Thành phẩm theo m2','Thành phẩm cửa Bộ màu chiều rộng chiều cao','2026-08-11T00:00:00.000Z')
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,
  content=excluded.content,
  modified_at=excluded.modified_at;
