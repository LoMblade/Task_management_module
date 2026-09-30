import { z } from 'zod';

// 1. Enums
export const uuTienSchema = z.enum(['THAP', 'BINH_THUONG', 'CAO']);
export const trangThaiCongViecSchema = z.enum(['CHUA_BAT_DAU', 'DANG_LAM', 'CHO_DUYET', 'HOAN_THANH']);
export const vaiTroSchema = z.enum(['QUAN_LY', 'NHAN_VIEN']);
export const loaiScopeSchema = z.enum(['CUA_TOI', 'TOI_GIAO', 'THEO_DOI', 'TAT_CA']);

export type UuTien = z.infer<typeof uuTienSchema>;
export type TrangThaiCongViec = z.infer<typeof trangThaiCongViecSchema>;
export type VaiTro = z.infer<typeof vaiTroSchema>;
export type LoaiScope = z.infer<typeof loaiScopeSchema>;

// Helper for date validation
export const ngaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Định dạng ngày phải là YYYY-MM-DD' });

// 2. NhanVien
export const nhanVienSchema = z.object({
  id: z.string().optional(),
  ten: z.string().min(1, { message: 'Tên nhân viên là bắt buộc' }),
  chucVu: z.string(),
  congTyId: z.string().optional(),
  matKhau: z.string().optional(),
});
export type NhanVien = z.infer<typeof nhanVienSchema>;

export const passwordSchema = z.string().optional();

export const taoNhanVienSchema = nhanVienSchema.omit({ congTyId: true }).extend({
  id: z.string().optional(),
  matKhau: passwordSchema,
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tài khoản'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

// 3. DuAn
export const duAnSchema = z.object({
  id: z.string(),
  ten: z.string().min(1, { message: 'Tên dự án là bắt buộc' }),
  moTa: z.string().optional(),
  congTyId: z.string(),
});
export type DuAn = z.infer<typeof duAnSchema>;

// 4. CongViec
export const congViecSchema = z.object({
  id: z.string(),
  ma: z.string(),
  ten: z.string().min(1, { message: 'Tên công việc là bắt buộc' }),
  moTa: z.string().optional(),
  duAnId: z.string().optional(),
  nguoiGiaoId: z.string(),
  nguoiThucHienIds: z.array(z.string()).min(1, { message: 'Chọn ít nhất một người thực hiện' }),
  nguoiTheoDoiIds: z.array(z.string()),
  uuTien: uuTienSchema,
  batDau: ngaySchema.optional(),
  hetHan: ngaySchema.optional(),
  trangThai: trangThaiCongViecSchema,
  tienDo: z.number().min(0).max(100),
  congTyId: z.string(),
  taoLuc: z.string(),
  capNhatLuc: z.string(),
  deletedAt: z.string().optional(),
});
export type CongViec = z.infer<typeof congViecSchema>;

// 5. LichSuThayDoi
export const lichSuThayDoiSchema = z.object({
  id: z.string(),
  congViecId: z.string(),
  userId: z.string(),
  truong: z.string(),
  tuGiaTri: z.unknown(),
  sangGiaTri: z.unknown(),
  lyDo: z.string().optional(),
  taoLuc: z.string(),
});
export type LichSuThayDoi = z.infer<typeof lichSuThayDoiSchema>;

// 6. ViecCon
export const viecConSchema = z.object({
  id: z.string(),
  congViecId: z.string(),
  ten: z.string().min(1, { message: 'Tên việc con là bắt buộc' }).max(200, { message: 'Tên việc con không được vượt quá 200 ký tự' }),
  hoanThanh: z.boolean(),
  thuTu: z.number(),
  taoLuc: z.string(),
  capNhatLuc: z.string(),
});
export type ViecCon = z.infer<typeof viecConSchema>;

// 7. BinhLuan
export const binhLuanSchema = z.object({
  id: z.string(),
  congViecId: z.string(),
  userId: z.string(),
  noiDung: z.string().min(1, { message: 'Nội dung bình luận là bắt buộc' }).max(2000, { message: 'Nội dung bình luận không được vượt quá 2000 ký tự' }),
  taoLuc: z.string(),
  capNhatLuc: z.string(),
});
export type BinhLuan = z.infer<typeof binhLuanSchema>;

// 8. API Input Schemas
const taoCongViecBaseSchema = z.object({
  ten: z.string().min(1, { message: 'Tên công việc là bắt buộc' }),
  moTa: z.string().optional(),
  duAnId: z.string().optional(),
  nguoiThucHienIds: z.array(z.string()).min(1, { message: 'Chọn ít nhất một người thực hiện' }),
  nguoiTheoDoiIds: z.array(z.string()).optional().default([]),
  uuTien: uuTienSchema.optional().default('BINH_THUONG'),
  batDau: ngaySchema.optional(),
  hetHan: ngaySchema.optional(),
});

export const taoCongViecSchema = taoCongViecBaseSchema.superRefine((data, ctx) => {
  if (data.batDau && data.hetHan) {
    if (new Date(data.hetHan) < new Date(data.batDau)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Hạn không được trước ngày bắt đầu',
        path: ['hetHan']
      });
    }
  }
});
export type TaoCongViecInput = z.infer<typeof taoCongViecSchema>;

export const capNhatCongViecSchema = taoCongViecBaseSchema.partial().superRefine((data, ctx) => {
  if (data.batDau && data.hetHan) {
    if (new Date(data.hetHan) < new Date(data.batDau)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Hạn không được trước ngày bắt đầu',
        path: ['hetHan']
      });
    }
  }
});
export type CapNhatCongViecInput = z.infer<typeof capNhatCongViecSchema>;

export const chuyenTrangThaiSchema = z.object({
  trangThai: trangThaiCongViecSchema,
  lyDo: z.string().optional(),
});
export type ChuyenTrangThaiInput = z.infer<typeof chuyenTrangThaiSchema>;

export const congViecQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).optional().default(10),
  scope: loaiScopeSchema.optional().default('TAT_CA'),
  duAnId: z.string().optional(),
  trangThai: trangThaiCongViecSchema.optional(),
  uuTien: uuTienSchema.optional(),
  q: z.string().optional(),
  quaHan: z.coerce.boolean().optional(),
  sort: z.string().optional(),
});
export type CongViecQueryInput = z.infer<typeof congViecQuerySchema>;

export const taoViecConSchema = z.object({
  ten: z.string().min(1, { message: 'Tên việc con là bắt buộc' }).max(200, { message: 'Tên việc con không được vượt quá 200 ký tự' }),
});
export type TaoViecConInput = z.infer<typeof taoViecConSchema>;

export const capNhatViecConSchema = z.object({
  ten: z.string().min(1, { message: 'Tên việc con là bắt buộc' }).max(200, { message: 'Tên việc con không được vượt quá 200 ký tự' }).optional(),
  hoanThanh: z.boolean().optional(),
  thuTu: z.number().optional(),
});
export type CapNhatViecConInput = z.infer<typeof capNhatViecConSchema>;

export const taoBinhLuanSchema = z.object({
  noiDung: z.string().min(1, { message: 'Nội dung bình luận là bắt buộc' }).max(2000, { message: 'Nội dung bình luận không được vượt quá 2000 ký tự' }),
});
export type TaoBinhLuanInput = z.infer<typeof taoBinhLuanSchema>;

// 9. API Response types
export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

// Backward-compatible type aliases
export type TaoCongViec = TaoCongViecInput;
export type CapNhatCongViec = CapNhatCongViecInput;
export type ChuyenTrangThai = ChuyenTrangThaiInput;
export type CongViecQuery = CongViecQueryInput;
