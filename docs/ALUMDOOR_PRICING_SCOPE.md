# Phạm vi áp dụng chính sách giá

Áp dụng ở môi trường local của Alumdoor. Mục tiêu là gom nhiều mặt hàng hoặc nhóm hàng vào một phạm vi để một chính sách giá chỉ cần khai báo một lần.

| Danh mục | Trường giữ lại | Quy tắc |
| --- | --- | --- |
| Phạm vi áp dụng chính sách | Tên phạm vi; Mặt hàng / nhóm hàng áp dụng; Ngừng dùng | Phải có ít nhất một dòng thành phần trước khi sử dụng trong chính sách. |
| Thành phần phạm vi | Áp dụng theo; Mặt hàng hoặc Nhóm hàng | Mỗi dòng chọn đúng một kiểu áp dụng. |
| Chính sách giá | Phạm vi áp dụng | Khi chọn phạm vi, chính sách chỉ chạy cho các dòng hàng nằm trong phạm vi đó. Điều kiện bổ sung vẫn được áp dụng đồng thời. |

Phạm vi bị ngừng dùng, không tồn tại, hoặc không có thành phần thì không làm chính sách giá chạy.

Không dùng danh mục này cho phụ thu vận chuyển: đó là phụ thu cấp đơn bán, không phải phụ thu của từng dòng hàng.

## Cấu hình local đã tạo

- Phạm vi `CỬA ÁP DỤNG SƠN VÂN GỖ`: Cửa CN Đức, Cửa tấm liền Úc, Cửa siêu trường, Cửa Đài Loan.
- Phạm vi `RAY TD ÁP DỤNG PHỤ THU SƠN`: Ray hộp TD U76, Ray hộp TD U100, Ray đơn TD U76, Ray sắt U70 không ron.
- Phạm vi `V4 V5 SƠN TĨNH ĐIỆN`: hai mã đang có nhãn STĐ trong dữ liệu local (`NVL-V4_KEM_STD`, `NVL-V5_KEM_STD-02`).
- Màu/bề mặt `VÂN GỖ` dùng cho hai phụ thu vân gỗ.
- Bốn chính sách: cửa vân gỗ +465.000/m²; ray vân gỗ +55.000/m; ray màu khác +15.000/m; V4/V5 sơn tĩnh điện +15.000/m.
