import { describe, expect, it } from 'vitest';
import { MemoryCongViecRepository } from '../src/repositories/memory.js';
import { CongViecService, DomainError } from '../src/services/cong-viec.service.js';
import { seedData } from '../src/seed.js';

const manager = { userId: 'u-chi-huy', congTyId: 'ct-long-do' };
const assignee = { userId: 'u-ky-su-1', congTyId: 'ct-long-do' };

async function fixture() {
  const repository = new MemoryCongViecRepository();
  await seedData(repository);
  const service = new CongViecService(repository, () => new Date('2026-09-26T01:00:00.000Z'));
  const result = await service.list(manager, { page: 1, limit: 20, scope: 'TAT_CA', sort: 'hetHan', today: '2026-09-26' });
  return { service, activeTask: result.items.find((item) => item.ma === 'CV-1001')!, pendingTask: result.items.find((item) => item.ma === 'CV-1002')! };
}

describe('CongViecService', () => {
  it('cho phep nguoi thuc hien di qua luong lam viec', async () => {
    const { service, activeTask } = await fixture();
    await service.transition(assignee, activeTask.id, { trangThai: 'CHO_DUYET' });
    await expect(service.transition(assignee, activeTask.id, { trangThai: 'HOAN_THANH' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('bat buoc ly do khi nguoi giao tra lai', async () => {
    const { service, pendingTask } = await fixture();
    await expect(service.transition(manager, pendingTask.id, { trangThai: 'DANG_LAM' })).rejects.toMatchObject({ code: 'REASON_REQUIRED' });
  });

  it('nguoi khac khong duoc sua hoac thay doi', async () => {
    const { service, activeTask } = await fixture();
    await expect(service.update({ userId: 'u-khac', congTyId: 'ct-long-do' }, activeTask.id, { ten: 'Sai quyen' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('tinh qua han theo ngay Viet Nam', async () => {
    const { service } = await fixture();
    const result = await service.list(manager, { page: 1, limit: 20, scope: 'TAT_CA', sort: 'hetHan', quaHan: true, today: '2026-09-26' });
    expect(result.items.every((item) => item.hetHan! < '2026-09-26')).toBe(true);
  });
});
