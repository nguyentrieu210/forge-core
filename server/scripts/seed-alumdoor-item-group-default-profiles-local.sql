-- Default material-tracking profile by Alumdoor Item Group.
-- LOCAL demo data only. Idempotent and scoped to one field on Item Group.
-- The root stays blank because it contains several incompatible tracking modes.

BEGIN TRANSACTION;

UPDATE documents
SET payload_json = json_set(
      payload_json,
      '$.default_measurement_profile',
      CASE name
        WHEN 'Cửa thành phẩm' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa CN Đức' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa Lưới' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa kéo Đài Loan' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa siêu trường' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa Đài Loan' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa Đài Loan Inox' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa tấm liền Úc' THEN 'Hàng thường'
        WHEN 'Motor & điện' THEN 'Hàng thường'
        WHEN 'Motor' THEN 'Hàng thường'
        WHEN 'Bình lưu điện' THEN 'Hàng thường'
        WHEN 'Điều khiển & phụ kiện điện' THEN 'Hàng thường'
        WHEN 'Linh kiện motor' THEN 'Hàng thường'
        WHEN 'Phụ kiện & vật tư' THEN 'Hàng thường'
        WHEN 'Phụ kiện chung' THEN 'Hàng thường'
        WHEN 'Phụ kiện CN Đức' THEN 'Hàng thường'
      END
    ),
    modified_at = CURRENT_TIMESTAMP,
    modified_by = 'admin',
    version = version + 1
WHERE tenant_id = 'demo'
  AND doctype = 'Item Group'
  AND name IN (
    'Cửa thành phẩm',
    'Cửa CN Đức',
    'Cửa Lưới',
    'Cửa kéo Đài Loan',
    'Cửa siêu trường',
    'Cửa Đài Loan',
    'Cửa Đài Loan Inox',
    'Cửa tấm liền Úc',
    'Motor & điện',
    'Motor',
    'Bình lưu điện',
    'Điều khiển & phụ kiện điện',
    'Linh kiện motor',
    'Phụ kiện & vật tư',
    'Phụ kiện chung',
    'Phụ kiện CN Đức'
  );

UPDATE master_records
SET data_json = json_set(
      data_json,
      '$.default_measurement_profile',
      CASE name
        WHEN 'Cửa thành phẩm' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa CN Đức' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa Lưới' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa kéo Đài Loan' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa siêu trường' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa Đài Loan' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa Đài Loan Inox' THEN 'Thành phẩm theo m2'
        WHEN 'Cửa tấm liền Úc' THEN 'Hàng thường'
        WHEN 'Motor & điện' THEN 'Hàng thường'
        WHEN 'Motor' THEN 'Hàng thường'
        WHEN 'Bình lưu điện' THEN 'Hàng thường'
        WHEN 'Điều khiển & phụ kiện điện' THEN 'Hàng thường'
        WHEN 'Linh kiện motor' THEN 'Hàng thường'
        WHEN 'Phụ kiện & vật tư' THEN 'Hàng thường'
        WHEN 'Phụ kiện chung' THEN 'Hàng thường'
        WHEN 'Phụ kiện CN Đức' THEN 'Hàng thường'
      END
    ),
    modified_at = CURRENT_TIMESTAMP
WHERE tenant_id = 'demo'
  AND record_type = 'Item Group'
  AND name IN (
    'Cửa thành phẩm',
    'Cửa CN Đức',
    'Cửa Lưới',
    'Cửa kéo Đài Loan',
    'Cửa siêu trường',
    'Cửa Đài Loan',
    'Cửa Đài Loan Inox',
    'Cửa tấm liền Úc',
    'Motor & điện',
    'Motor',
    'Bình lưu điện',
    'Điều khiển & phụ kiện điện',
    'Linh kiện motor',
    'Phụ kiện & vật tư',
    'Phụ kiện chung',
    'Phụ kiện CN Đức'
  );

COMMIT;
