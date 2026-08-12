# Dữ liệu nguồn Alumdoor

Thư mục này là bản Markdown tra nhanh sinh từ Word/Excel gốc. Khi số SHA-256 của file gốc thay đổi, chạy lại `server/scripts/build-alumdoor-source-md.py`.

## Thứ tự ưu tiên khi có mâu thuẫn

1. Excel/Word gốc có ngày sửa mới nhất.
2. Dữ liệu giao dịch thực tế trong tồn nhôm và đơn/xuất.
3. File đối chiếu hoặc dữ liệu đã import trong repo.
4. Dữ liệu demo/fixture chỉ dùng khi nguồn thật không có.

## Chỉ mục

| Nguồn | Đường dẫn | Byte | Cập nhật | SHA-256 | Markdown |
| --- | --- | --- | --- | --- | --- |
| Quy trình sản xuất | C:/Users/Admin/Downloads/25.7 QUY TRÌNH (1).docx | 623515 | 2026-08-11T20:30:29+07:00 | 0397A208844ED5C8AD6AC75DE48693582AA9E0A40B2086A5F3FC24B9AC250228 | [quy-trinh.md](quy-trinh.md) |
| Mẫu đơn đặt hàng | C:/Users/Admin/Downloads/ĐƠN ĐẶT HÀNG.docx | 449230 | 2026-08-06T17:41:40+07:00 | 94A0451A89AB036E2890D2BEC9BB37B07F051F33297422ACE280D59068D2DDEB | [don-dat-hang-template.md](don-dat-hang-template.md) |
| Danh mục sản phẩm | C:/Users/Admin/Downloads/danh mục sản phẩm.xlsx | 50034 | 2026-08-11T20:30:21+07:00 | F0DD02FD11AD3ADF1B8C2DC649253585EAB0E1B513E7EAF27BA9FE58C901AE22 | [danh-muc-san-pham.md](danh-muc-san-pham.md) |
| Quy cách và màu | C:/Users/Admin/Downloads/QUY CÁCH .xlsx | 8326 | 2026-08-11T20:30:15+07:00 | 76B32B2FC8959A2DFC1EC9E1CA9DA26C1CD165BDF1703C88D9C14EE0CBAE22A4 | [quy-cach-va-mau.md](quy-cach-va-mau.md) |
| Tồn nhôm | C:/alumdoor-ui-local/data/ton-nhom.xlsx | 2440354 | 2026-08-11T18:52:19+07:00 | C2E6C8FA2A64DD36BA8EC3F8F64926ACFC72529EF609F737EFD00E077CA2E20C | [ton-nhom.md](ton-nhom.md) |
| Đơn hàng và xuất hàng | C:/alumdoor-ui-local/data/don-hang-xuat-hang.xlsx | 10298211 | 2026-08-11T18:52:19+07:00 | 95FCC0ADBF4575B85E6C07DA70B437450207090EBB378DABEF5F16AD6690B285 | [don-hang-xuat-hang.md](don-hang-xuat-hang.md) |
| Đối chiếu thành phẩm | C:/Users/Admin/Downloads/ALUMDOOR - DOI CHIEU THANH PHAM.xlsx | 229034 | 2026-07-29T14:14:13+07:00 | 00383F6E801F43F81E81A851C572ADA28ED72F39BC63AA01362B49D88A909CC3 | [doi-chieu-thanh-pham.md](doi-chieu-thanh-pham.md) |
| Hàng hóa / Vật tư export | C:/Users/Admin/Downloads/Hàng hoá _ Vật tư-20260728-2018 (1).xlsx | 120176 | 2026-07-28T20:18:57+07:00 | A34EC3FAD49F0B8FE49160C17742644B6C09A02B7C63D3674971CF1E1DADD765 | [hang-hoa-vat-tu-import.md](hang-hoa-vat-tu-import.md) |
| Đơn mua hàng | C:/Users/Admin/Downloads/Đơn mua hàng-20260730-1550.xlsx | 16686 | 2026-07-30T15:50:50+07:00 | A384A31A77003363E66E09BD7020799F2871CDF7FD2DBC55AA461481FB7DD89A | [don-mua-hang.md](don-mua-hang.md) |
| Báo giá CTY Sáu Hồng | C:/alumdoor-ui-local/data/sau-hong.xlsx | 343666 | 2026-08-11T18:52:19+07:00 | BF68DCE77E522E3571DBF0BE245BAB215BA4BF63D746D7CDBD3EC881665A1F9A | [sau-hong.md](sau-hong.md) |
| Dữ liệu kế toán cũ | C:/Users/Admin/Downloads/MS LIÊN BS.xlsx | 3900046 | 2026-07-29T16:01:07+07:00 | 64820A840AA22D763875930D13095076A2A3F33D9FA7027E3263D8A7D4EE2E41 | [du-lieu-ke-toan-cu.md](du-lieu-ke-toan-cu.md) |
| Sổ nợ | C:/Users/Admin/Downloads/SỔ NỢ (1).xlsx | 22016 | 2026-08-07T10:12:57+07:00 | 3C7D213382B57EF38F0CE5703CD5877A00DEEF7A21467FABC5536B6E117C8F8D | Chỉ lưu cấu trúc/metadata |
| Khách hàng export | C:/alumdoor-ui-local/data/customer-export.xlsx | 16380 | 2026-08-11T18:52:19+07:00 | 09C07304CD4D5FDC231638ABD19BBF314D92032942DF36F7DEE41175730050E5 | Chỉ lưu cấu trúc/metadata |

## Quy tắc bảo mật

- Danh mục vật tư, quy cách, quy trình, tồn nhôm và lịch sử đơn/xuất được lưu để tìm kiếm nhanh.
- Công nợ, tài khoản ngân hàng và danh sách khách hàng chỉ lưu metadata/cấu trúc, không nhân bản toàn bộ dữ liệu nhạy cảm sang Markdown.
- File `SỔ NỢ (1).xlsx` thực chất là định dạng Excel BIFF/OLE cũ dù mang đuôi `.xlsx`; giữ trong chỉ mục nhưng không trích bằng openpyxl.
