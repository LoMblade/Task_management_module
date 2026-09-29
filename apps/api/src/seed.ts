import { 
  MemoryCongViecRepository, 
  MemoryLichSuRepository, 
  MemoryViecConRepository, 
  MemoryBinhLuanRepository, 
  MemoryDanhMucRepository 
} from './repositories/memory';
import { randomUUID } from 'node:crypto';
import { CongViec, NhanVien, DuAn } from '@erp/contracts';

export async function seedDb(
  congViecRepo: any,
  lichSuRepo: any,
  viecConRepo: any,
  binhLuanRepo: any,
  danhMucRepo: any
) {
  const congTyId = 'ct-long-do';

  const nhanViens: NhanVien[] = [
    { id: 'u-giam-doc', congTyId, ten: 'Nguyễn Đức Dũng', chucVu: 'Giám đốc' },
    { id: 'u-chi-huy', congTyId, ten: 'Trần Minh Quang', chucVu: 'Chỉ huy công trình' },
    { id: 'u-truong-phong', congTyId, ten: 'Lê Thị Lan', chucVu: 'Trưởng phòng kỹ thuật' },
    { id: 'u-ky-su-1', congTyId, ten: 'Phạm Hoàng An', chucVu: 'Kỹ sư xây dựng' },
    { id: 'u-ky-su-2', congTyId, ten: 'Đỗ Văn Bình', chucVu: 'Kỹ sư điện' },
    { id: 'u-ky-su-3', congTyId, ten: 'Vũ Thị Mai', chucVu: 'Kỹ sư thủy lợi' },
    { id: 'u-ky-su-4', congTyId, ten: 'Hoàng Đức Tài', chucVu: 'Kỹ sư giám sát' },
    { id: 'u-to-doi-1', congTyId, ten: 'Ngô Thanh Hà', chucVu: 'Tổ trưởng thi công' },
    { id: 'u-to-doi-2', congTyId, ten: 'Bùi Quang Huy', chucVu: 'Tổ trưởng cơ giới' },
    { id: 'u-ke-toan', congTyId, ten: 'Đinh Thị Ngọc', chucVu: 'Kế toán công trình' }
  ];

  for (const nv of nhanViens) {
    await danhMucRepo.insertNhanVien(nv);
  }

  const duAns: DuAn[] = [
    { id: 'du-an-cau-nam-can', congTyId, ten: 'Cầu Nam Căn', moTa: 'Dự án xây dựng cầu bắc qua sông Năm Căn' },
    { id: 'du-an-dien-luc-linh-dam', congTyId, ten: 'Điện lực Linh Đàm', moTa: 'Trạm biến áp và đường dây trung thế' },
    { id: 'du-an-thuy-loi-bac-hung-hai', congTyId, ten: 'Thủy lợi Bắc Hưng Hải', moTa: 'Nạo vét và gia cố kênh mương' }
  ];

  for (const da of duAns) {
    await danhMucRepo.insertDuAn(da);
  }

  const now = new Date();
  const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const soon = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nowStr = now.toISOString();

  const tasks: CongViec[] = [
    {
      id: randomUUID(), congTyId, ma: 'CV-0001', ten: 'Khảo sát địa chất', moTa: '',
      duAnId: 'du-an-cau-nam-can', nguoiGiaoId: 'u-chi-huy', nguoiThucHienIds: ['u-ky-su-1'], nguoiTheoDoiIds: ['u-giam-doc'],
      trangThai: 'HOAN_THANH', uuTien: 'CAO', hetHan: past, tienDo: 100, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0002', ten: 'Lập bản vẽ thi công', moTa: '',
      duAnId: 'du-an-cau-nam-can', nguoiGiaoId: 'u-chi-huy', nguoiThucHienIds: ['u-truong-phong'], nguoiTheoDoiIds: [],
      trangThai: 'DANG_LAM', uuTien: 'CAO', hetHan: future, tienDo: 50, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0003', ten: 'Chuẩn bị vật tư điện', moTa: '',
      duAnId: 'du-an-dien-luc-linh-dam', nguoiGiaoId: 'u-truong-phong', nguoiThucHienIds: ['u-ky-su-2'], nguoiTheoDoiIds: [],
      trangThai: 'CHO_DUYET', uuTien: 'BINH_THUONG', hetHan: past, tienDo: 100, taoLuc: nowStr, capNhatLuc: nowStr // Overdue
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0004', ten: 'Kiểm tra máy xúc', moTa: '',
      duAnId: 'du-an-thuy-loi-bac-hung-hai', nguoiGiaoId: 'u-chi-huy', nguoiThucHienIds: ['u-to-doi-2'], nguoiTheoDoiIds: [],
      trangThai: 'CHUA_BAT_DAU', uuTien: 'THAP', hetHan: future, tienDo: 0, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0005', ten: 'Họp giao ban công trường', moTa: 'Việc chung không thuộc dự án',
      duAnId: undefined, nguoiGiaoId: 'u-giam-doc', nguoiThucHienIds: ['u-chi-huy', 'u-truong-phong'], nguoiTheoDoiIds: [],
      trangThai: 'CHUA_BAT_DAU', uuTien: 'CAO', hetHan: future, tienDo: 0, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0006', ten: 'Tự đánh giá năng lực', moTa: 'Tự giao tự làm',
      duAnId: undefined, nguoiGiaoId: 'u-ky-su-1', nguoiThucHienIds: ['u-ky-su-1'], nguoiTheoDoiIds: [],
      trangThai: 'DANG_LAM', uuTien: 'BINH_THUONG', hetHan: future, tienDo: 30, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0007', ten: 'Tính toán thủy lực', moTa: 'Nhiệm vụ cho kỹ sư thủy lợi',
      duAnId: 'du-an-thuy-loi-bac-hung-hai', nguoiGiaoId: 'u-truong-phong', nguoiThucHienIds: ['u-ky-su-3'], nguoiTheoDoiIds: ['u-giam-doc'],
      trangThai: 'DANG_LAM', uuTien: 'CAO', hetHan: past, tienDo: 60, batDau: past, taoLuc: nowStr, capNhatLuc: nowStr // overdue in DANG_LAM
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0008', ten: 'Giám sát thi công cọc nhồi', moTa: '',
      duAnId: 'du-an-cau-nam-can', nguoiGiaoId: 'u-chi-huy', nguoiThucHienIds: ['u-ky-su-4'], nguoiTheoDoiIds: ['u-truong-phong'],
      trangThai: 'DANG_LAM', uuTien: 'BINH_THUONG', hetHan: soon, tienDo: 40, batDau: past, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0009', ten: 'Đổ bê tông mố cầu', moTa: '',
      duAnId: 'du-an-cau-nam-can', nguoiGiaoId: 'u-ky-su-4', nguoiThucHienIds: ['u-to-doi-1'], nguoiTheoDoiIds: [],
      trangThai: 'CHUA_BAT_DAU', uuTien: 'CAO', hetHan: future, tienDo: 0, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0010', ten: 'Thanh toán đợt 1', moTa: 'Làm hồ sơ thanh toán khối lượng',
      duAnId: 'du-an-dien-luc-linh-dam', nguoiGiaoId: 'u-chi-huy', nguoiThucHienIds: ['u-ke-toan'], nguoiTheoDoiIds: ['u-giam-doc'],
      trangThai: 'CHO_DUYET', uuTien: 'CAO', hetHan: soon, tienDo: 100, batDau: past, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0011', ten: 'Nghiệm thu trạm biến áp', moTa: '',
      duAnId: 'du-an-dien-luc-linh-dam', nguoiGiaoId: 'u-giam-doc', nguoiThucHienIds: ['u-chi-huy', 'u-ky-su-2'], nguoiTheoDoiIds: [],
      trangThai: 'DANG_LAM', uuTien: 'CAO', hetHan: past, tienDo: 80, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0012', ten: 'Bảo dưỡng định kỳ máy đào', moTa: '',
      duAnId: 'du-an-thuy-loi-bac-hung-hai', nguoiGiaoId: 'u-ky-su-3', nguoiThucHienIds: ['u-to-doi-2'], nguoiTheoDoiIds: [],
      trangThai: 'CHUA_BAT_DAU', uuTien: 'BINH_THUONG', hetHan: future, tienDo: 0, taoLuc: nowStr, capNhatLuc: nowStr
    }
  ];

  for (const t of tasks) {
    await congViecRepo.insert(t);
  }

  // Thêm việc con cho một số task
  await viecConRepo.insert({
    id: randomUUID(), congViecId: tasks[6].id, ten: 'Thu thập số liệu đo đạc', hoanThanh: true, thuTu: 1, taoLuc: nowStr, capNhatLuc: nowStr
  });
  await viecConRepo.insert({
    id: randomUUID(), congViecId: tasks[6].id, ten: 'Chạy mô hình', hoanThanh: false, thuTu: 2, taoLuc: nowStr, capNhatLuc: nowStr
  });

  // Thêm bình luận
  await binhLuanRepo.insert({
    id: randomUUID(), congViecId: tasks[6].id, userId: 'u-ky-su-3', noiDung: 'Đang thiếu số liệu mực nước', taoLuc: nowStr, capNhatLuc: nowStr
  });
}
