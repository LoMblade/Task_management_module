# CLAUDE INSTRUCTIONS (ERP Long Đỗ)

## NGỮ CẢNH DỰ ÁN
- **Tech Stack**: pnpm workspace, Fastify 5 + MongoDB, React 19 + Vite + TanStack Query, Zod.
- **Nghiệp vụ**: Quản lý công việc cho công ty xây dựng, điện lực.
- **Cấu trúc**: `packages/contracts` (Schemas/Types chung), `apps/api` (Backend), `apps/web` (Frontend).

## KIẾN TRÚC & PHÂN TẦNG (BẮT BUỘC)
- **API**: Luôn tuân thủ luồng: `Route` (Nhận Token, Zod validate) -> `Service` (Business logic, Check quyền) -> `Repository` (Query MongoDB). KHÔNG query DB ở Route hay Service.
- **Web**: `Page/Component` -> `Hooks` (TanStack Query) -> `API Client`. KHÔNG gọi `fetch` trực tiếp trong Component.
- **Response Format**: Trả về thống nhất:
  - Thành công đơn: `{ data }`
  - Thành công danh sách: `{ data, meta: { page, limit, total } }`
  - Lỗi: `{ error: { code, message } }`
- **ID**: Mọi `id` trả về và sử dụng phải là String.

## LUẬT NGHIỆP VỤ (BUSINESS RULES)
- **Quyền theo công ty**: MỌI query MongoDB (`find`, `update`, `delete`) BẮT BUỘC phải kèm filter `{ congTyId: ctx.congTyId }` lấy từ Token. Không bao giờ tin tưởng client.
- **Xóa mềm (Soft Delete)**: KHÔNG DÙNG lệnh `deleteOne/deleteMany`. Luôn Update field `deletedAt = new Date()`. Khi query danh sách, filter `deletedAt: { $exists: false }`.
- **Múi giờ & Quá hạn**: Mọi xử lý ngày tháng (đặc biệt tính "Quá hạn") phải lấy theo mốc 00:00 của giờ Việt Nam (`Asia/Ho_Chi_Minh`).
- **Lưu Database**: KHÔNG ĐƯỢC ghi trường `undefined` vào MongoDB. Nếu không có dữ liệu, dùng `delete object[key]` hoặc set `null`.
- **Trạng thái**: Việc chuyển trạng thái từ `CHO_DUYET` -> `DANG_LAM` bắt buộc phải có lý do (lưu vào comment hoặc history).

## NHỮNG VIỆC CẤM LÀM
- KHÔNG commit file `.env` chứa mật khẩu thật, chuỗi kết nối thật (chỉ commit file `.env.example`).
- KHÔNG phá vỡ lịch sử commit. Viết Commit message theo chuẩn Conventional Commits (feat:, fix:, docs:, refactor:).
- KHÔNG sửa trực tiếp các rules này trừ khi có yêu cầu từ lead.
- KHÔNG tùy tiện sinh ID từ Client (Frontend), mọi ID quan trọng phải do Backend hoặc DB quyết định.
- KHÔNG bỏ qua việc kiểm tra quyền truy cập ở tầng API. Giao diện (Frontend) ẩn nút bấm chưa đủ, API phải chặn dứt điểm.

## LỆNH KIỂM TRA (CHẠY TRƯỚC KHI BÁO XONG)
Trước khi kết thúc phiên làm việc hoặc báo hoàn thành task, BẠN PHẢI TỰ ĐỘNG chạy các lệnh sau:
1. Kiểm tra lỗi cú pháp (Typescript): `pnpm typecheck`
2. Chạy test logic: `pnpm test`
Đảm bảo cả 2 lệnh Pass 100% mới được báo cáo kết quả.
