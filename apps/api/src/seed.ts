import { randomUUID } from 'node:crypto';
import type { CongViecRecord, CongViecRepository } from './domain.js';

export const seedData = async (repository: CongViecRepository) => {
  const congTyId = 'ct-long-do';
  const now = new Date().toISOString();
  const tasks: CongViecRecord[] = [
    { id: randomUUID(), ma: 'CV-1001', ten: 'Nghiệm thu cọc khoan nhồi trụ T5', duAnId: 'du-an-cau-nam-can', nguoiGiaoId: 'u-chi-huy', nguoiThucHienIds: ['u-ky-su-1'], nguoiTheoDoiIds: ['u-truong-phong'], uuTien: 'CAO', batDau: '2026-09-20', hetHan: '2026-09-30', trangThai: 'DANG_LAM', tienDo: 65, congTyId, taoLuc: now, capNhatLuc: now, lichSu: [] },
    { id: randomUUID(), ma: 'CV-1002', ten: 'Lập biên bản bàn giao vật tư', nguoiGiaoId: 'u-truong-phong', nguoiThucHienIds: ['u-ky-su-2'], nguoiTheoDoiIds: [], uuTien: 'BINH_THUONG', hetHan: '2026-09-25', trangThai: 'CHO_DUYET', tienDo: 100, congTyId, taoLuc: now, capNhatLuc: now, lichSu: [] },
  ];
  for (const task of tasks) await repository.insert(task);
  return { congTyId, users: ['u-chi-huy', 'u-truong-phong', 'u-ky-su-1', 'u-ky-su-2', 'u-ky-su-3', 'u-ky-su-4', 'u-to-doi-1', 'u-ke-toan'], projects: ['du-an-cau-nam-can', 'du-an-dien-luc-linh-dam', 'du-an-thuy-loi-song-hau'] };
};
