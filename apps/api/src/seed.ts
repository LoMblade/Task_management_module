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
    { id: 'admin', congTyId, ten: 'Admin (Giám đốc)', chucVu: 'Giám đốc' },
    { id: 'chihuy', congTyId, ten: 'Trần Minh Quang', chucVu: 'Chỉ huy công trình' },
    { id: 'truongphong', congTyId, ten: 'Lê Thị Lan', chucVu: 'Trưởng phòng kỹ thuật' },
    { id: 'kysu1', congTyId, ten: 'Phạm Hoàng An', chucVu: 'Kỹ sư xây dựng' },
    { id: 'kysu2', congTyId, ten: 'Đỗ Văn Bình', chucVu: 'Kỹ sư điện' },
    { id: 'kysu3', congTyId, ten: 'Vũ Thị Mai', chucVu: 'Kỹ sư thủy lợi' },
    { id: 'kysu4', congTyId, ten: 'Hoàng Đức Tài', chucVu: 'Kỹ sư giám sát' },
    { id: 'todoi1', congTyId, ten: 'Ngô Thanh Hà', chucVu: 'Tổ trưởng thi công' },
    { id: 'todoi2', congTyId, ten: 'Bùi Quang Huy', chucVu: 'Tổ trưởng cơ giới' },
    { id: 'ketoan', congTyId, ten: 'Đinh Thị Ngọc', chucVu: 'Kế toán công trình' }
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
      duAnId: 'du-an-cau-nam-can', nguoiGiaoId: 'chihuy', nguoiThucHienIds: ['kysu1'], nguoiTheoDoiIds: ['admin'],
      trangThai: 'HOAN_THANH', uuTien: 'CAO', hetHan: past, tienDo: 100, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0002', ten: 'Lập bản vẽ thi công', moTa: '',
      duAnId: 'du-an-cau-nam-can', nguoiGiaoId: 'chihuy', nguoiThucHienIds: ['truongphong'], nguoiTheoDoiIds: [],
      trangThai: 'DANG_LAM', uuTien: 'CAO', hetHan: future, tienDo: 50, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0003', ten: 'Chuẩn bị vật tư điện', moTa: '',
      duAnId: 'du-an-dien-luc-linh-dam', nguoiGiaoId: 'truongphong', nguoiThucHienIds: ['kysu2'], nguoiTheoDoiIds: [],
      trangThai: 'CHO_DUYET', uuTien: 'BINH_THUONG', hetHan: past, tienDo: 100, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0004', ten: 'Kiểm tra máy xúc', moTa: '',
      duAnId: 'du-an-thuy-loi-bac-hung-hai', nguoiGiaoId: 'chihuy', nguoiThucHienIds: ['todoi2'], nguoiTheoDoiIds: [],
      trangThai: 'CHUA_BAT_DAU', uuTien: 'THAP', hetHan: future, tienDo: 0, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0005', ten: 'Họp giao ban công trường', moTa: 'Việc chung không thuộc dự án',
      duAnId: undefined, nguoiGiaoId: 'admin', nguoiThucHienIds: ['chihuy', 'truongphong'], nguoiTheoDoiIds: [],
      trangThai: 'CHUA_BAT_DAU', uuTien: 'CAO', hetHan: future, tienDo: 0, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0006', ten: 'Tự đánh giá năng lực', moTa: 'Tự giao tự làm',
      duAnId: undefined, nguoiGiaoId: 'kysu1', nguoiThucHienIds: ['kysu1'], nguoiTheoDoiIds: [],
      trangThai: 'DANG_LAM', uuTien: 'BINH_THUONG', hetHan: future, tienDo: 30, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0007', ten: 'Tính toán thủy lực', moTa: 'Nhiệm vụ cho kỹ sư thủy lợi',
      duAnId: 'du-an-thuy-loi-bac-hung-hai', nguoiGiaoId: 'truongphong', nguoiThucHienIds: ['kysu3'], nguoiTheoDoiIds: ['admin'],
      trangThai: 'DANG_LAM', uuTien: 'CAO', hetHan: past, tienDo: 60, batDau: past, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0008', ten: 'Giám sát thi công cọc nhồi', moTa: '',
      duAnId: 'du-an-cau-nam-can', nguoiGiaoId: 'chihuy', nguoiThucHienIds: ['kysu4'], nguoiTheoDoiIds: ['truongphong'],
      trangThai: 'DANG_LAM', uuTien: 'BINH_THUONG', hetHan: soon, tienDo: 40, batDau: past, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0009', ten: 'Đổ bê tông mố cầu', moTa: '',
      duAnId: 'du-an-cau-nam-can', nguoiGiaoId: 'kysu4', nguoiThucHienIds: ['todoi1'], nguoiTheoDoiIds: [],
      trangThai: 'CHUA_BAT_DAU', uuTien: 'CAO', hetHan: future, tienDo: 0, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0010', ten: 'Thanh toán đợt 1', moTa: 'Làm hồ sơ thanh toán khối lượng',
      duAnId: 'du-an-dien-luc-linh-dam', nguoiGiaoId: 'chihuy', nguoiThucHienIds: ['ketoan'], nguoiTheoDoiIds: ['admin'],
      trangThai: 'CHO_DUYET', uuTien: 'CAO', hetHan: soon, tienDo: 100, batDau: past, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0011', ten: 'Nghiệm thu trạm biến áp', moTa: '',
      duAnId: 'du-an-dien-luc-linh-dam', nguoiGiaoId: 'admin', nguoiThucHienIds: ['chihuy', 'kysu2'], nguoiTheoDoiIds: [],
      trangThai: 'DANG_LAM', uuTien: 'CAO', hetHan: past, tienDo: 80, taoLuc: nowStr, capNhatLuc: nowStr
    },
    {
      id: randomUUID(), congTyId, ma: 'CV-0012', ten: 'Bảo dưỡng định kỳ máy đào', moTa: '',
      duAnId: 'du-an-thuy-loi-bac-hung-hai', nguoiGiaoId: 'kysu3', nguoiThucHienIds: ['todoi2'], nguoiTheoDoiIds: [],
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
    id: randomUUID(), congViecId: tasks[6].id, userId: 'kysu3', noiDung: 'Đang thiếu số liệu mực nước', taoLuc: nowStr, capNhatLuc: nowStr
  });
}
