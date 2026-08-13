# Audit Sales Option / Sales Package Alumdoor — 13/08/2026

## Phạm vi

Đối chiếu chuỗi `Item → Item Price → Sales Option → Sales Package` cho các nhóm cửa đang bán:

- Cửa CN Đức;
- Cửa tấm liền Úc;
- Cửa Đài Loan và Cửa Đài Loan Inox;
- Cửa Lưới;
- Cửa siêu trường;
- các phụ kiện/ray/trục/motor bán độc lập.

Nguồn quyết định là danh mục và bảng giá 31/07/2026 trong `docs/source-data`, cộng với business-case matrix trong `docs/sales`. Không suy giá mới và không sao chép BOM vào Sales Package.

## Kết quả audit trước migration 0125–0126

1. Chỉ có 15 Package cửa Đức tặng ray; các Option theo từng Item đã từng bị khóa trong khi Option nhóm chung không có Package lại được bật.
2. Các Option Úc, Đài Loan và Lưới là prototype phạm vi nhóm, không gắn Package và đang bị khóa.
3. Danh mục hiện tại vẫn dùng SKU riêng cho `TRỌN BỘ` và `TÁCH MÓN`; Item Price của các SKU này đều dùng biến thể `STANDARD`.
4. Cửa Úc có tám SKU thành phẩm. Bảng giá ghi giá cửa hoàn thiện đã gồm phụ kiện; phụ kiện bán rời đã có Item Price riêng.
5. Cửa siêu trường đang là lá/cửa và phụ kiện tách riêng, chưa có SKU trọn bộ được chứng minh bởi nguồn.
6. `HH-CUAKEODL` thuộc nhóm Cửa kéo Đài Loan nhưng nguồn không có giá bán và không đánh dấu trọn bộ/tách món.
7. Hai SKU `CỬA ĐỨC KÉO TAY AL70` nằm trong nhóm Cửa tấm liền Úc có Item Price hợp lệ nhưng không phải SKU trọn bộ.

## Quy tắc được áp dụng

| Trường hợp | Sales Option | Sales Package |
| --- | --- | --- |
| Cửa Đức chỉ lá | `DUC-CHI-LA` hiện có | Không Package |
| Cửa Đức tặng ray đủ điều kiện | `DUC-TANG-RAY` dùng chung cấp nhóm | `PKG-DUC-TANG-RAY` dùng chung; cửa lấy động từ dòng đơn hàng + ray tặng |
| Cửa Úc thành phẩm có tên `CỬA ÚC` | `Trọn bộ` theo từng Item | `PKG-UC-FULL` dùng chung, lấy động đúng SKU đã chọn |
| Đài Loan có tên `TRỌN BỘ` | `Trọn bộ` theo từng Item | `PKG-DL-FULL` dùng chung, lấy động đúng SKU đã chọn |
| Lưới có tên `TRỌN BỘ` | `Trọn bộ` theo từng Item | `PKG-LUOI-FULL` dùng chung, lấy động đúng SKU đã chọn |
| Đài Loan/Lưới có tên `TÁCH MÓN` hoặc lá rời | `Tách món` theo từng Item | Không Package |
| Đài Loan Inox/Siêu trường | `Tách món` theo từng Item | Không Package |
| Đức kéo tay AL70 trong nhóm Úc | `Kéo tay` theo từng Item | Không Package |
| `HH-CUAKEODL` | Không cho chọn bán đến khi có giá và cách bán được duyệt | Không Package |
| Ray, trục, motor, khóa và phụ kiện bán riêng | Giá `STANDARD` của chính Item | Không Package |

Package của SKU trọn bộ chỉ chứa chính SKU được chọn qua `$SOURCE_ITEM`. Đây là chủ ý: Package mô tả nghĩa vụ giao thương hiện hành, còn vật tư tiêu hao/cấu kiện sản xuất thuộc BOM. Khi có bảng BOM đã chuẩn hóa theo từng SKU, BOM được bổ sung độc lập và không chép vào Package.

## Bất biến sau migration 0126

- 8 Option Úc trọn bộ dùng `PKG-UC-FULL`; 56 Option Đài Loan trọn bộ dùng `PKG-DL-FULL`; 6 Option cửa lưới trọn bộ dùng `PKG-LUOI-FULL`.
- Ba Package trọn bộ dùng `$SOURCE_ITEM`, nên snapshot vẫn ghi đúng mã hàng của dòng đơn dù cấu hình Package được dùng chung.
- Mỗi Option `Tách món` không có `sales_package`.
- Không Option nào chọn biến thể giá chưa tồn tại; dữ liệu hiện tại dùng `STANDARD` cho SKU trọn bộ/tách món lịch sử.
- Sáu Option prototype phạm vi nhóm của Úc/Đài Loan/Lưới đã được loại khỏi master data; không còn lựa chọn mơ hồ chồng lên SKU lịch sử.
- Các Package `PKG-FULL:<item_code>` trùng lặp đã được loại bỏ.
- Cửa Đức chỉ còn hai Option cấp nhóm: `DUC-CHI-LA` và `DUC-TANG-RAY`; 15 Option và Package tặng ray theo từng mã được loại bỏ.
- `DUC-TANG-RAY` chỉ hiện khi diện tích tính giá đạt 8 m² và Item đang chọn có Item Price `WITH_RAIL` trong bảng giá hiện hành.
- Package chung dùng `$SOURCE_ITEM` để đóng băng đúng mã cửa của dòng đơn hàng, đồng thời thêm `PK_TANGRAY` theo hai lần chiều cao.
- Hai SKU Đức kéo tay AL70 có Option `Kéo tay`, dùng giá `STANDARD` và không bung Package.
- `HH-CUAKEODL` được giữ trong dữ liệu kho nhưng đặt `is_sales_item = false` cùng trạng thái `PRICE_AND_MODE_REQUIRED` cho đến khi nguồn nghiệp vụ bổ sung đủ giá/cách bán.
- Sau khi áp local: không còn Package cũ theo từng mã và không có Sales Option đang bật tham chiếu Package thiếu/khóa.
- Phụ kiện bán riêng luôn ghi thành dòng Sales Order độc lập và lấy Item Price của chính phụ kiện.

## Bổ sung migration 0127 — Cách bán đổi đúng mã hàng

Nguồn đối chiếu xác nhận các mã `TRỌN BỘ`/`TÁCH MÓN` và các bậc diện tích là biến thể thương mại của cùng một sản phẩm, không phải lựa chọn bị khóa theo SKU. Vì dữ liệu lịch sử vẫn lưu giá trên các SKU riêng, migration 0127 bổ sung cầu nối an toàn thay vì tạo nhãn giả:

- Úc: 4 cặp `Kéo tay ↔ Motor ngoài` theo cùng độ dày.
- Cửa lưới: 6 cặp `Trọn bộ ↔ Tách món` theo cùng kiểu lưới/vật liệu.
- Đài Loan: 56 SKU trọn bộ có thể đổi về 7 SKU tách món; từ SKU tách món, diện tích tính giá chọn đúng một trong 8 bậc SKU trọn bộ.
- Cửa Đức: `Chỉ lá` và `Tặng ray từ 8 m²` vẫn giữ cùng Item; lựa chọn tặng ray hiện trong ô chọn nhưng máy chủ tiếp tục chặn nếu diện tích hoặc biến thể giá chưa hợp lệ.
- Khi người dùng đổi cách bán, giao diện đổi `item_code`, tải lại Item Price, Sales Option và Sales Package. Dòng Sales Order lưu mã hàng cuối cùng, không lưu một nhãn cách bán không khớp giá.

Hai trường điều hướng `target_item_code` và `target_item_rules` chỉ phục vụ thao tác chọn nhanh. Máy chủ vẫn xác thực tổ hợp cuối `Item + Sales Option + Item Price + Sales Package` trước khi lưu.

## Audit màn `Tách món` và yêu cầu xổ các món

### Hiện trạng đã đối chiếu

Đối chiếu trực tiếp dữ liệu local sau migration 0129 cho thấy:

- có **89** Sales Option mang nghĩa `Tách món`: 63 Cửa Đài Loan, 12 Cửa Lưới, 4 Cửa Đài Loan Inox và 10 Cửa siêu trường;
- 27 Option gắn trực tiếp vào SKU bán rời, 62 Option làm cầu nối từ SKU trọn bộ sang **13 SKU bán rời**;
- cả 89 Option đều có Item Price đang hoạt động cho Item cuối cùng;
- không Option `Tách món` nào có Sales Package — đây là đúng kiến trúc hiện tại;
- màn đơn hàng chỉ có dữ liệu để hiện dòng Package/tặng kèm từ `sales_package_snapshot`. Vì `Tách món` không có Package nên hiện tại không có nguồn dữ liệu hợp lệ để xổ ray, trục, motor, khóa hoặc phụ kiện;
- danh mục có ít nhất **138** mặt hàng ray/trục/motor/khóa/phụ kiện có giá, nhưng chưa có quan hệ cấu hình cho biết món nào phù hợp với từng loại cửa. Không được xổ toàn bộ 138 món hoặc suy quan hệ theo tên/nhóm hàng.

Nguồn nghiệp vụ cũng xác nhận `Tách món` của Cửa Lưới là chỉ lấy lưới, còn `Tách món` của Cửa Đài Loan là chỉ lấy lá. Ray, trục, motor và phụ kiện mua thêm phải là các dòng thương mại độc lập, có giá và thành tiền riêng; không phải dòng Package 0 đồng và không lấy từ BOM.

### Kết luận audit

Màn hiện tại **đúng về tính giá**, nhưng **chưa có trợ lý chọn món bán kèm**. Việc chỉ sửa TSX để xổ danh mục sẽ tạo dữ liệu sai vì thiếu quan hệ cấu hình. Cần bổ sung một lớp cấu hình riêng cho các dòng bán độc lập, tách hoàn toàn khỏi Sales Package và BOM.

## Phương án triển khai được đề xuất

### 1. Cấu hình nguồn sự thật

Thêm master dùng chung `Sales Line Template` và child `Sales Line Template Item`:

- phạm vi áp dụng: Item, Item Group và/hoặc Sales Option;
- ngày hiệu lực, trạng thái, độ ưu tiên;
- mỗi món: `choice_key`, Item, nhóm hiển thị, bắt buộc/tùy chọn, chọn mặc định, thứ tự;
- cách tính số lượng: `FIXED`, `HEIGHT`, `WIDTH`, `AREA`, `SET_COUNT` cùng hệ số;
- cờ kế thừa màu/kích thước/số bộ từ dòng cửa khi thật sự phù hợp;
- không lưu giá trong template — giá luôn đọc qua Item Price/Pricing Rule của chính món.

Tên `Sales Line Template` tránh nhập nhằng với `Sales Package`: Template chỉ hỗ trợ tạo nhiều dòng bán độc lập; Package đóng băng nghĩa vụ giao hàng của một dòng thương mại.

### 2. API preview và kiểm tra phía máy chủ

Khi dòng chính chọn `Tách món`, API preview trả về danh sách món phù hợp kèm:

- Item, tên, ĐVT, nhóm hiển thị;
- số lượng gợi ý đã tính từ thông số dòng cửa;
- Item Price/Pricing Rule hiện hành;
- cảnh báo thiếu giá hoặc thiếu thông số;
- khóa cấu hình và phiên bản để máy chủ kiểm lại khi lưu.

Máy chủ phải tính lại từng dòng đã chọn. Client không được gửi giá tự quyết và không được chèn Item ngoài template bằng cách sửa payload.

### 3. Giao diện đơn hàng

Ngay dưới dòng `Chi tiết`, nếu Sales Option cuối cùng có `sales_mode = Tách món`, hiện một dòng ngang `Món bán riêng`:

- chia nhóm Lá/Lưới, Ray, Trục, Motor, Khóa và Phụ kiện;
- chỉ hiện các món được cấu hình cho dòng hiện tại;
- tick món cần mua, nhập/chỉnh số lượng trong phạm vi cho phép và nhìn thấy ĐVT + đơn giá + thành tiền ngay;
- nút `Thêm các món đã chọn` tạo các **Sales Order Item anh em**, mỗi món là một dòng tính tiền bình thường;
- các dòng sinh từ cùng lựa chọn giữ chung `selection_group_key`, có `selection_parent_key` và `selection_choice_key` để mở lại đơn vẫn gom đúng cụm;
- đổi từ `Tách món` sang `Trọn bộ` phải hỏi người dùng giữ hay bỏ các dòng đã sinh; tuyệt đối không xóa âm thầm dòng đã sửa tay;
- desktop dùng dòng con trong bảng hiện tại; mobile dùng card/accordion riêng, không ép bảng cuộn ngang.

### 4. Phạm vi dữ liệu cần xác nhận trước khi bật production

Lập ma trận cho từng họ cửa, tối thiểu:

| Họ cửa | Dòng chính khi tách | Ray được chọn | Trục được chọn | Motor/khóa/phụ kiện | Công thức số lượng |
| --- | --- | --- | --- | --- | --- |
| Cửa Lưới | SKU lưới tách món | Chưa có quan hệ duyệt | Chưa có quan hệ duyệt | Chưa có quan hệ duyệt | Theo quy cách từng món |
| Cửa Đài Loan | SKU lá Đài Loan | Chưa có quan hệ duyệt | Chưa có quan hệ duyệt | Chưa có quan hệ duyệt | Theo quy cách từng món |
| Cửa Đài Loan Inox | SKU lá Inox | Chưa có quan hệ duyệt | Chưa có quan hệ duyệt | Chưa có quan hệ duyệt | Theo quy cách từng món |
| Cửa siêu trường | SKU lá siêu trường | Chưa có quan hệ duyệt | Chưa có quan hệ duyệt | Chưa có quan hệ duyệt | Theo quy cách từng món |

Không triển khai mapping tự động trước khi các ô `Chưa có quan hệ duyệt` được chốt từ bảng quy cách/danh mục bán hàng.

### 5. Thứ tự triển khai

1. Chốt ma trận món theo họ cửa và công thức số lượng.
2. Thêm metadata/migration cho Template và ba khóa liên kết dòng đơn.
3. Thêm resolver + API preview, kiểm quyền và kiểm giá server-side.
4. Thêm dòng `Món bán riêng` ở desktop và card/accordion mobile.
5. Bổ sung lưu/mở lại/đổi cách bán/xóa cụm, audit log và cảnh báo dữ liệu thay đổi.
6. Chạy Golden Flow cho Cửa Lưới, Đài Loan, Đài Loan Inox và siêu trường.

### 6. Điều kiện nghiệm thu

- chọn `Tách món` chỉ xổ đúng món được cấu hình cho Item/họ cửa hiện tại;
- mỗi món được chọn tạo dòng Sales Order độc lập và tính đúng giá hiện hành;
- không có dòng phụ 0 đồng trừ chính sách quà tặng có Package riêng;
- không sao chép BOM và không gắn Sales Package cho Option `Tách món`;
- lưu rồi mở lại từ danh sách vẫn thấy đúng cụm dòng;
- đổi cách bán không làm mất dòng đã chỉnh mà không có xác nhận;
- thiếu giá/thiếu mapping báo tiếng Việt tại cụm dòng và chặn lưu đúng chỗ;
- desktop và mobile đều có luồng chọn món riêng phù hợp kích thước màn hình.
