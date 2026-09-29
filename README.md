# Phân hệ Công việc - ERP Long Đỗ

Phân hệ quản lý công việc của hệ thống ERP Long Đỗ, phục vụ điều hành thi công, quản lý dự án cho các công ty xây dựng, điện lực, thủy lợi.

Dự án là một monorepo (pnpm workspace) gồm 3 phần chính:
- **`packages/contracts`**: Chứa toàn bộ schemas Zod dùng chung (NhanVien, DuAn, CongViec, ViecCon, BinhLuan, v.v.) và các types giao tiếp API.
- **`apps/api`**: RESTful API sử dụng Fastify 5. Gồm các layer `routes` -> `services` -> `repositories`. Hiện tại đang sử dụng in-memory repositories cho mục đích demo (không cần MongoDB, mặc dù file `docker-compose.yml` vẫn có sẵn để sử dụng Mongo nếu cần). Dữ liệu được seed tự động khi khởi động.
- **`apps/web`**: Frontend React 19 + Vite + TanStack Query. Không dùng thư viện routing để đảm bảo tính gọn nhẹ theo yêu cầu (state-based routing).

## Hướng dẫn chạy (Tối đa 5 lệnh)

Yêu cầu đã cài đặt `Node.js` (>= 20) và `pnpm` trên máy. Nếu chưa có pnpm, chạy `npm i -g pnpm`.

```bash
# 1. Cài đặt toàn bộ dependencies
pnpm install

# 2. Bật API Server (chạy ở cổng 3000, tự động seed data)
pnpm --filter @erp/api dev

# 3. Mở Terminal mới, bật Web Client (chạy ở cổng 5173)
pnpm --filter @erp/web dev

# (Tùy chọn) 4. Kiểm tra kiểu dữ liệu toàn bộ project
pnpm typecheck

# (Tùy chọn) 5. Chạy unit tests cho tầng business logic
pnpm test
```
*Lưu ý: Bạn không cần chạy Docker Compose MongoDB ở bước này vì code đang sử dụng In-Memory Repositories theo thiết kế cho bài test.*

## Các tính năng chính (Điểm cộng đã chọn)
1. **Việc con (Subtasks)**: Công việc chính có thể có nhiều đầu việc con. Check/uncheck việc con sẽ tự động tính toán lại % tiến độ của công việc chính.
2. **Bình luận (Comments)**: Mỗi công việc có mục bình luận riêng, cho phép lưu trữ lịch sử trao đổi của những người liên quan.

## Các giả định tự đặt
1. **Cơ chế xác thực (Auth)**: Hệ thống sử dụng fake JWT (không có chữ ký). Payload là base64 JSON `{ userId, congTyId }`. Frontend có dropdown giả lập việc chuyển đổi người dùng đang đăng nhập (`UserSwitcher`) để test các luồng quyền (người giao, người thực hiện, người xem, người ngoài).
2. **Timezone**: "Quá hạn" được đánh giá tự động mỗi khi lấy danh sách, dựa theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh`).
3. **Mã công việc**: Mã công việc `CV-XXXX` là duy nhất trong một `congTyId`, tự động tăng từ 0001.
4. **Việc chung**: Nếu công việc không thuộc dự án nào, `duAnId` sẽ là `undefined` và được xem là "Việc chung".
5. **Tiến độ**: Chuyển trạng thái sang `CHO_DUYET` tự động thiết lập tiến độ thành `100%`.
6. **Không sử dụng MongoDB thật**: Nhằm đáp ứng việc khởi chạy nhanh (chỉ bằng npm scripts) và tính toàn vẹn của nghiệp vụ, repository đang dùng bản In-Memory array có chung interface, khi cần chỉ việc thay thế implementation.

## Tech Stack
- API: Fastify 5 + Zod
- Web: React 19 + Vite + TanStack Query
- Contracts: Zod
- Workspace: pnpm
