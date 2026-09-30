# Phân hệ Công việc - ERP Long Đỗ

Phân hệ quản lý công việc của hệ thống ERP Long Đỗ, phục vụ điều hành thi công, quản lý dự án cho các công ty xây dựng, điện lực, thủy lợi.

Dự án là một monorepo (pnpm workspace) gồm 3 phần chính:
- **`packages/contracts`**: Chứa toàn bộ schemas Zod dùng chung và các types giao tiếp API.
- **`apps/api`**: RESTful API sử dụng Fastify 5 + MongoDB. Gồm các layer `routes` -> `services` -> `repositories`. 
- **`apps/web`**: Frontend React 19 + Vite + TanStack Query. Định tuyến state-based (không dùng thư viện ngoài). Tích hợp Toast notification và State management chặt chẽ.

## Hướng dẫn chạy (Tối đa 5 lệnh)

Yêu cầu đã cài đặt `Node.js`, `pnpm` và `Docker`.

```bash
# 1. Khởi chạy MongoDB thông qua Docker Compose
docker-compose up -d

# 2. Cài đặt toàn bộ dependencies
pnpm install

# 3. Bật API Server (cổng 3000, tự động seed data đầy đủ các User, Dự án, Công việc vào MongoDB)
pnpm --filter @erp/api dev

# 4. Bật Web Client (cổng 5173)
pnpm --filter @erp/web dev

# (Tùy chọn) 5. Chạy unit tests cho tầng business logic
pnpm test
```

## Các tính năng mở rộng (Bonus) đã làm
1. **Việc con (Subtasks)**: Danh sách đầu việc có check hoàn thành, tiến độ việc cha tự tính theo việc con.
2. **Bình luận (Comments)**: Thảo luận, comment trực tiếp trong công việc.

## Trả lời Câu hỏi thiết kế

### 1. Quá hạn: Lưu DB hay tính ra khi đọc? Lọc phân trang truy vấn thế nào?
- **Tính ra khi đọc & Query động** Không nên lưu `QUA_HA:N` như một trạng thái cứng trong DB (vì sẽ phải dùng Cronjob chạy lúc 00:00, rất dễ miss job hoặc lag db).
- **Lọc có phân trang**: Để lọc phân trang được, thay vì lấy ra hết rồi filter mảng, ta build MongoDB Query kết hợp giờ VN: 
  `{ trangThai: { $ne: 'HOAN_THANH' }, hetHan: { $lt: <Ngày giờ hiện tại theo VN> } }`
  Sau đó truyền vào Mongo `skip` và `limit` để phân trang như bình thường. API sẽ tự gán thêm field ảo `isQuaHan` khi map dữ liệu ra.

### 2. Mã CV: Hai người bấm tạo cùng một lúc làm sao không trùng?
Sử dụng mô hình Sequence Counter (Atomic) của MongoDB. Thay vì đếm tổng số bản ghi, ta tạo một collection `counters`.
Khi tạo mới, dùng hàm `findOneAndUpdate({ _id: congTyId }, { $inc: { seq: 1 } })`. Lệnh này của MongoDB là **Atomic**, nó trả về số thứ tự độc nhất (VD: 1, 2, 3). Ưu tiên đảm bảo uniqueness và concurrency safety. Sequence có thể có gap (bị nhảy số) nếu transaction tạo công việc thất bại, nhưng quan trọng nhất là không bao giờ trùng mã. Không nên dùng count + 1 vì rất dễ dẫn đến collision (trùng mã).

### 3. Lịch sử thay đổi: Lưu ở đâu, đổi 5 trường ghi mấy dòng?
Lưu ở 1 Collection độc lập `lich_su_thay_doi` để không làm phình Data của bảng `cong_viec`.
Mỗi thay đổi field được lưu thành một audit entry riêng: `{ truong, tuGiaTri, sangGiaTri, taoLuc, userId }`.
-> **Đổi 5 trường ghi 5 dòng**. Ưu điểm: Hiển thị giao diện "Ai đã đổi [Tiến độ] từ [10%] thành [50%]" cực kỳ dễ dàng, và có thể filter lịch sử theo đúng trường cần xem.

### 4. Tương thích ngược: App cũ gọi thiếu trường loaiCongViec
- Không được break API. Ở Zod Schema của Contracts (hoặc DTO), ta sử dụng thuộc tính `.default("KHAC")` hoặc `.optional()` cho `loaiCongViec`.
- Tức là nếu App cũ gọi lên không có field đó, Backend tự động gán giá trị mặc định là "KHAC" (hoặc "DEFAULT") để pass qua tầng Database. Đến khi nào App cũ hoàn toàn bị xóa sổ trên thị trường, ta mới update Zod Schema thành Required.
