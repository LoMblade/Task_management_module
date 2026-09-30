import { describe, expect, it } from 'vitest';
import { 
  MemoryCongViecRepository, 
  MemoryLichSuRepository, 
  MemoryViecConRepository, 
  MemoryBinhLuanRepository, 
  MemoryDanhMucRepository 
} from '../src/repositories/memory.js';
import { CongViecService } from '../src/services/cong-viec.service.js';
import { seedDb } from '../src/seed.js';

const manager = { userId: 'chihuy', congTyId: 'ct-long-do' };
const assignee = { userId: 'kysu1', congTyId: 'ct-long-do' };

async function fixture() {
  const congViecRepo = new MemoryCongViecRepository();
  const lichSuRepo = new MemoryLichSuRepository();
  const viecConRepo = new MemoryViecConRepository();
  const binhLuanRepo = new MemoryBinhLuanRepository();
  const danhMucRepo = new MemoryDanhMucRepository();

  await seedDb(congViecRepo, lichSuRepo, viecConRepo, binhLuanRepo, danhMucRepo);
  const service = new CongViecService(congViecRepo, lichSuRepo, viecConRepo, binhLuanRepo, danhMucRepo, () => new Date('2026-09-26T01:00:00.000Z').toISOString());
  
  const result = await service.list(manager, { page: 1, limit: 20, scope: 'TAT_CA', sort: 'hetHan' });
  
  return { 
    service, 
    activeTask: result.items.find((item: any) => item.ma === 'CV-0001')!, 
    pendingTask: result.items.find((item: any) => item.ma === 'CV-0010')! 
  };
}

describe('CongViecService', () => {
  it('cho phep nguoi thuc hien di qua luong lam viec', async () => {
    const { service, activeTask } = await fixture();
    // activeTask is HOAN_THANH, let's use another task
    const result = await service.list(manager, { page: 1, limit: 20, scope: 'TAT_CA', sort: 'hetHan' });
    const task = result.items.find((item: any) => item.ma === 'CV-0004')!; // CHUA_BAT_DAU, assignee: todoi2
    const todoAssignee = { userId: 'todoi2', congTyId: 'ct-long-do' };
    
    await service.transition(todoAssignee, task.id, { trangThai: 'DANG_LAM' });
    await service.transition(todoAssignee, task.id, { trangThai: 'CHO_DUYET' });
    await expect(service.transition(todoAssignee, task.id, { trangThai: 'HOAN_THANH' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('bat buoc ly do khi nguoi giao tra lai', async () => {
    const { service, pendingTask } = await fixture();
    // pendingTask is CHO_DUYET. manager is 'chihuy'
    const pendingManager = { userId: 'chihuy', congTyId: 'ct-long-do' };
    await expect(service.transition(pendingManager, pendingTask.id, { trangThai: 'DANG_LAM' })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('nguoi khac khong duoc sua hoac thay doi', async () => {
    const { service, activeTask } = await fixture();
    await expect(service.update({ userId: 'u-khac', congTyId: 'ct-long-do' }, activeTask.id, { ten: 'Sai quyen' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('tinh qua han theo ngay Viet Nam', async () => {
    const { service } = await fixture();
    const result = await service.list(manager, { page: 1, limit: 20, scope: 'TAT_CA', sort: 'hetHan', quaHan: true });
    // past is 7 days ago.
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
    expect(result.items.every((item: any) => item.hetHan! < today)).toBe(true);
  });
});

import { isQuaHan } from '../src/domain.js';
import type { CongViec } from '@erp/contracts';

describe('isQuaHan mốc nửa đêm giờ Việt Nam', () => {
  it('xác định chính xác trạng thái quá hạn quanh mốc nửa đêm', () => {
    const task = { trangThai: 'DANG_LAM', hetHan: '2026-06-10' } as CongViec;
    
    // Nếu hôm nay là 2026-06-10 (chưa qua ngày), thì chưa quá hạn
    expect(isQuaHan(task, '2026-06-10')).toBe(false);
    
    // Nếu hôm nay là 2026-06-11 (đã qua nửa đêm sang ngày mới), thì quá hạn
    expect(isQuaHan(task, '2026-06-11')).toBe(true);
    
    // Công việc đã hoàn thành thì không bao giờ quá hạn
    const taskDone = { trangThai: 'HOAN_THANH', hetHan: '2026-06-10' } as CongViec;
    expect(isQuaHan(taskDone, '2026-06-11')).toBe(false);
  });
});
