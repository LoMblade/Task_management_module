# Nhật ký làm việc với AI (AI_LOG.md)

Dưới đây là 4 tình huống làm việc đáng kể nhất với AI trong quá trình xây dựng Phân hệ Công việc.

## 1. Dựng khung dự án và Monorepo (pnpm workspace)
- **Tôi muốn gì**: Khởi tạo cấu trúc monorepo gọn gàng với `pnpm workspace`, chia thành `apps/api`, `apps/web`, và `packages/contracts` mà không tốn công setup thủ công các file tsconfig, package.json rối rắm.
- **Tôi ra lệnh thế nào**: *"Hãy tạo cho tôi một cấu trúc monorepo bằng pnpm workspace. Gồm 3 package: apps/api (Fastify 5), apps/web (React 19 + Vite), packages/contracts (Zod). Setup tsconfig kết nối với nhau chuẩn xác."*
- **AI trả về gì**: AI sinh ra đầy đủ các file `pnpm-workspace.yaml`, `package.json` cho từng thư mục, và các file `tsconfig.json` có dùng `references` để trỏ vào nhau.
- **Quyết định (Nhận/Sửa/Bỏ)**: **Nhận**. AI làm rất tốt việc setup dependencies. 
- **Kiểm tra**: Chạy lệnh `pnpm install` và `pnpm typecheck` thành công, không báo lỗi import.

## 2. Viết các Schema dùng chung bằng Zod
- **Tôi muốn gì**: Viết Zod model cho bảng `CongViec` có validate kỹ lưỡng: "Ngày hạn (hetHan) không được trước Ngày bắt đầu (batDau)", thông báo lỗi tiếng Việt.
- **Tôi ra lệnh thế nào**: *"Viết Zod schema cho CongViec trong packages/contracts/src/index.ts. Validate tên công việc không rỗng, và đặc biệt hetHan phải lớn hơn hoặc bằng batDau. Trả về thông báo lỗi tiếng Việt."*
- **AI trả về gì**: AI sinh ra Schema bằng `.superRefine` để so sánh chéo 2 trường ngày tháng, trả về `ctx.addIssue` với tiếng Việt.
- **Quyết định (Nhận/Sửa/Bỏ)**: **Sửa**. AI dùng hàm Date thuần của JS để so sánh, nhưng do múi giờ, hàm Date() thuần có thể lệch. Tôi yêu cầu AI sửa lại bằng cách so sánh chuỗi YYYY-MM-DD trực tiếp, hoặc dùng `date-fns` để chuẩn hóa múi giờ VN. AI đã tự sửa thành so sánh chuỗi ISO.
- **Kiểm tra**: Viết một file test nhỏ import Zod schema và ném thử dữ liệu `batDau: '2026-06-10'`, `hetHan: '2026-06-05'` để xem có văng lỗi đúng như kỳ vọng không.

## 3. Lỗi MongoDB Parallel Arrays (AI LÀM SAI VÀ TÔI PHÁT HIỆN RA)
- **Tôi muốn gì**: Tạo index cho collection `cong_viec` trên MongoDB để tối ưu truy vấn cho màn hình danh sách (lọc theo dự án, trạng thái, và người tham gia).
- **Tôi ra lệnh thế nào**: *"Viết hàm setupIndexes() cho file mongo.ts. Tạo compound index cho các trường: congTyId, duAnId, trangThai, nguoiThucHienIds, nguoiTheoDoiIds để query nhanh."*
- **AI trả về gì**: AI viết: `await db.collection('cong_viec').createIndex({ congTyId: 1, nguoiThucHienIds: 1, nguoiTheoDoiIds: 1 })`.
- **Phát hiện lỗi & Quyết định**: **BỎ VÀ YÊU CẦU LÀM LẠI**. Tôi chạy API và MongoDB văng lỗi `MongoServerError: cannot index parallel arrays`. Nguyên nhân là MongoDB không cho phép tạo 1 compound index chứa ĐỒNG THỜI 2 trường mảng (arrays) vì nó sẽ gây bùng nổ hoán vị (Cartesian product).
- **Kiểm tra**: Tôi yêu cầu AI tách ra làm 2 index riêng biệt: 1 cái index theo `nguoiThucHienIds` và 1 cái theo `nguoiTheoDoiIds`. Khởi động lại Server, console báo connect MongoDB và build index thành công.

## 4. Làm tính năng Toast Notification (UI/UX)
- **Tôi muốn gì**: Bỏ các dòng chữ đỏ báo lỗi cứng nhắc khi Login hoặc Form submit, thay bằng các khối thông báo (Toast) tự động nảy ra ở góc trên bên phải màn hình (tương tự thiết kế mẫu).
- **Tôi ra lệnh thế nào**: *"Tôi đưa cho bạn 1 ảnh mẫu. Bạn hãy thiết kế cho tôi 1 hệ thống Toast Message. Không dùng thư viện ngoài. Dùng Context API của React để truyền hàm showToast. Khi đăng nhập thành công hay lỗi, hãy nảy Toast ra ở góc phải màn hình, tự động tắt sau 4 giây."*
- **AI trả về gì**: AI viết ra `ToastContext`, `ToastProvider` với CSS `@keyframes slideIn`, và tích hợp cực kỳ chính xác vào luồng login.
- **Quyết định**: **Nhận**. Code rất sáng tạo, không phụ thuộc thư viện, keyframe animation mượt.
- **Kiểm tra**: Bật trình duyệt, cố tình gõ sai mật khẩu ở `/auth/login`, một toast màu đỏ hiện ra ở góc phải, sau đó 4s biến mất. Sau đó đăng nhập đúng, toast xanh hiện ra.
