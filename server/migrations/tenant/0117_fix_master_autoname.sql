-- Sửa quy tắc đặt tên của sáu DocType gốc.
--
-- `0004_frappe_platform.sql` khai `"autoname":"field:name"` cho Currency, Company, UOM,
-- Warehouse, Account và Cost Center. `field:<tên field>` nghĩa là lấy GIÁ TRỊ của field đó làm
-- tên bản ghi — nhưng không doctype nào trong sáu cái này có field tên `name`; field định danh
-- của chúng lần lượt là currency_name, company_name, uom_name, warehouse_name, account_name,
-- cost_center_name.
--
-- Hệ quả: mọi lần tạo mới đều dừng ở `autoname.ts:69` với
-- "name is required because <DocType> is named after it", và không thao tác nào trên giao diện
-- vượt qua được, vì không có ô nào để điền cái field không tồn tại đó. Một tenant mới vì thế
-- không tạo nổi Công ty hay Tiền tệ — tức không dùng được, dù mọi thứ khác cài đúng.
--
-- Sửa bằng REPLACE trên đúng chuỗi khai báo thay vì ghi đè cả metadata_json, để mọi thay đổi
-- khác mà tenant đã tích luỹ trên các doctype này (quyền, field thêm sau) không bị cuốn mất.

UPDATE doctype_definitions
SET metadata_json = REPLACE(metadata_json, '"autoname":"field:name"', '"autoname":"field:currency_name"')
WHERE doctype = 'Currency' AND metadata_json LIKE '%"autoname":"field:name"%';

UPDATE doctype_definitions
SET metadata_json = REPLACE(metadata_json, '"autoname":"field:name"', '"autoname":"field:company_name"')
WHERE doctype = 'Company' AND metadata_json LIKE '%"autoname":"field:name"%';

UPDATE doctype_definitions
SET metadata_json = REPLACE(metadata_json, '"autoname":"field:name"', '"autoname":"field:uom_name"')
WHERE doctype = 'UOM' AND metadata_json LIKE '%"autoname":"field:name"%';

UPDATE doctype_definitions
SET metadata_json = REPLACE(metadata_json, '"autoname":"field:name"', '"autoname":"field:warehouse_name"')
WHERE doctype = 'Warehouse' AND metadata_json LIKE '%"autoname":"field:name"%';

UPDATE doctype_definitions
SET metadata_json = REPLACE(metadata_json, '"autoname":"field:name"', '"autoname":"field:account_name"')
WHERE doctype = 'Account' AND metadata_json LIKE '%"autoname":"field:name"%';

UPDATE doctype_definitions
SET metadata_json = REPLACE(metadata_json, '"autoname":"field:name"', '"autoname":"field:cost_center_name"')
WHERE doctype = 'Cost Center' AND metadata_json LIKE '%"autoname":"field:name"%';
