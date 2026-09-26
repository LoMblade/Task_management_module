import { z } from 'zod';

export const uuTienSchema = z.enum(['THAP', 'BINH_THUONG', 'CAO']);
export const trangThaiCongViecSchema = z.enum([
  'CHUA_BAT_DAU',
  'DANG_LAM',
  'CHO_DUYET',
  'HOAN_THANH',
]);

export const congViecSchema = z.object({
  id: z.string(),
  ma: z.string(),
  ten: z.string(),
  moTa: z.string().optional(),
  duAnId: z.string().optional(),
  nguoiGiaoId: z.string(),
  nguoiThucHienIds: z.array(z.string()).min(1),
  nguoiTheoDoiIds: z.array(z.string()),
  uuTien: uuTienSchema,
  batDau: z.string().optional(),
  hetHan: z.string().optional(),
  trangThai: trangThaiCongViecSchema,
  tienDo: z.number().int().min(0).max(100),
  congTyId: z.string(),
  taoLuc: z.string(),
  capNhatLuc: z.string(),
  deletedAt: z.string().optional(),
});

const ngaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có dạng YYYY-MM-DD');

export const taoCongViecSchema = z.object({
  ten: z.string().trim().min(1, 'Tên công việc là bắt buộc').max(200),
  moTa: z.string().trim().max(2000).optional(),
  duAnId: z.string().optional(),
  nguoiThucHienIds: z.array(z.string()).min(1, 'Chọn ít nhất một người thực hiện'),
  nguoiTheoDoiIds: z.array(z.string()),
  uuTien: uuTienSchema,
  batDau: ngaySchema.optional(),
  hetHan: ngaySchema.optional(),
}).superRefine((value, context) => {
  if (value.batDau && value.hetHan && value.hetHan < value.batDau) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['hetHan'], message: 'Hạn không được trước ngày bắt đầu' });
  }
});

export const capNhatCongViecSchema = taoCongViecSchema.partial().extend({
  nguoiThucHienIds: z.array(z.string()).min(1).optional(),
});

export const capNhatTienDoSchema = z.object({
  tienDo: z.number().int().min(0).max(99),
  trangThai: z.enum(['CHUA_BAT_DAU', 'DANG_LAM', 'CHO_DUYET']).optional(),
});

export const chuyenTrangThaiSchema = z.object({
  trangThai: trangThaiCongViecSchema,
  lyDo: z.string().trim().max(500).optional(),
});

export const congViecQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  scope: z.enum(['CUA_TOI', 'TOI_GIAO', 'THEO_DOI', 'TAT_CA']).default('TAT_CA'),
  duAnId: z.string().optional(),
  trangThai: trangThaiCongViecSchema.optional(),
  uuTien: uuTienSchema.optional(),
  q: z.string().trim().optional(),
  quaHan: z.coerce.boolean().optional(),
  sort: z.enum(['hetHan', '-hetHan', 'capNhatLuc', '-capNhatLuc']).default('hetHan'),
});

export const apiErrorSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });

export type TaoCongViec = z.infer<typeof taoCongViecSchema>;
export type CapNhatCongViec = z.infer<typeof capNhatCongViecSchema>;
export type CongViecQuery = z.infer<typeof congViecQuerySchema>;
export type ChuyenTrangThai = z.infer<typeof chuyenTrangThaiSchema>;
export type CongViec = z.infer<typeof congViecSchema>;
