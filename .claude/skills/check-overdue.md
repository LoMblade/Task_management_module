---
name: check-overdue
description: Công cụ giúp tính toán nhanh logic Quá Hạn của phân hệ Công Việc để Developer dễ dàng Unit Test hoặc kiểm tra lại thuật toán.
---

# Kỹ năng kiểm tra Quá hạn (check-overdue)

Bạn là một chuyên gia về Javascript/Typescript. Nhiệm vụ của bạn khi được gọi là hỗ trợ developer kiểm thử logic "Quá hạn" cho các task.

## Ngữ cảnh
Logic quá hạn của ERP Long Đỗ quy định: 
- Một công việc bị coi là quá hạn nếu `trangThai` khác `HOAN_THANH` VÀ `hetHan` (định dạng YYYY-MM-DD) nhỏ hơn ngày hiện tại theo giờ Việt Nam.

## Hướng dẫn thực thi
1. Khi user cung cấp 1 object Công Việc hoặc 1 mảng các Công Việc.
2. Bạn phải tạo ngay một Script nhỏ bằng Nodejs để lấy ngày giờ `Asia/Ho_Chi_Minh` hiện tại.
3. Chạy script đó và in ra bảng danh sách Công Việc kèm cột "Tình trạng: Đúng hạn / Quá hạn".
4. Nếu user muốn tạo unit test, hãy sinh mã Jest (hoặc Vitest) cover các mốc thời gian: 23:59 ngày deadline, 00:00 ngày hôm sau (để chứng minh logic múi giờ chuẩn xác).
