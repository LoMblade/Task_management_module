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

## 4. Lỗi Kiến trúc (Frontend gọi trực tiếp DB thay vì API) (AI ĐỀ XUẤT SAI VÀ TÔI PHÁT HIỆN RA)
- **Tôi muốn gì**: Kết nối dữ liệu vào giao diện React để hiển thị danh sách công việc.
- **Tôi ra lệnh thế nào**: *"Hãy lấy dữ liệu danh sách công việc từ database và hiển thị ra Table trong React."*
- **AI trả về gì**: AI đề xuất sử dụng trực tiếp Supabase-js client ngay trong `apps/web/src/api.ts` (ví dụ `supabase.from('CongViec').select('*')`) để query lấy dữ liệu cho nhanh.
- **Phát hiện lỗi & Quyết định**: **SỬA LẠI HOÀN TOÀN**. Tôi nhận ra điều này vi phạm nghiêm trọng kiến trúc hệ thống (Route -> Service -> Repository). Việc frontend bypass Fastify API để gọi thẳng vào DB sẽ làm phá vỡ toàn bộ business logic, quyền truy cập và bảo mật đã viết ở backend.
- **Kiểm tra**: Tôi kiểm tra lại `CLAUDE.md` và kiến trúc yêu cầu. Sau đó yêu cầu AI chuyển thành mô hình chuẩn: Page -> Hook -> API Client (`fetch`) -> Fastify API (`http://localhost:3000`). Xóa bỏ hoàn toàn Supabase client khỏi dự án frontend. Đảm bảo UI phải giao tiếp qua backend Rest API.
