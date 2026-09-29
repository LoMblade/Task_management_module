import { randomUUID } from 'node:crypto';
import type { CongViec, LichSuThayDoi, ViecCon, BinhLuan } from '@erp/contracts';
import { 
  AuthContext, CongViecRepository, LichSuRepository, ViecConRepository, 
  BinhLuanRepository, DanhMucRepository, DomainError, isQuaHan 
} from '../domain';

function todayVN(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
}

export class CongViecService {
  constructor(
    private congViecRepo: CongViecRepository,
    private lichSuRepo: LichSuRepository,
    private viecConRepo: ViecConRepository,
    private binhLuanRepo: BinhLuanRepository,
    private danhMucRepo: DanhMucRepository,
    private clock: () => string = () => new Date().toISOString()
  ) {}

  private checkVisibility(ctx: AuthContext, task: CongViec) {
    if (task.congTyId !== ctx.congTyId) throw new DomainError('NOT_FOUND', 'Không tìm thấy công việc', 404);
    if (ctx.isAdmin) return;
    if (task.nguoiGiaoId !== ctx.userId && !task.nguoiThucHienIds.includes(ctx.userId) && !task.nguoiTheoDoiIds?.includes(ctx.userId)) {
      throw new DomainError('NOT_FOUND', 'Không tìm thấy công việc', 404);
    }
  }

  async list(ctx: AuthContext, query: any) {
    const today = todayVN();
    const result = await this.congViecRepo.list({
      congTyId: ctx.congTyId,
      userId: ctx.userId,
      isAdmin: ctx.isAdmin,
      today,
      ...query
    });
    
    result.items = result.items.map(t => ({ ...t, quaHan: isQuaHan(t, today) }));
    return result;
  }

  async get(ctx: AuthContext, id: string) {
    const task = await this.congViecRepo.findById(ctx.congTyId, id);
    if (!task) throw new DomainError('NOT_FOUND', 'Không tìm thấy công việc', 404);
    this.checkVisibility(ctx, task);
    return { ...task, quaHan: isQuaHan(task, todayVN()) };
  }

  async create(ctx: AuthContext, input: any) {
    const ma = await this.congViecRepo.nextMa(ctx.congTyId);
    const now = this.clock();
    const task: CongViec = {
      id: randomUUID(),
      congTyId: ctx.congTyId,
      ma,
      ten: input.ten,
      moTa: input.moTa,
      duAnId: input.duAnId,
      nguoiGiaoId: ctx.userId,
      nguoiThucHienIds: input.nguoiThucHienIds || [],
      nguoiTheoDoiIds: input.nguoiTheoDoiIds || [],
      trangThai: 'CHUA_BAT_DAU',
      uuTien: input.uuTien || 'BINH_THUONG',
      batDau: input.batDau,
      hetHan: input.hetHan,
      tienDo: 0,
      taoLuc: now,
      capNhatLuc: now
    };
    
    const created = await this.congViecRepo.insert(task);
    await this.lichSuRepo.insert({
      id: randomUUID(),
      congViecId: created.id,
      userId: ctx.userId,
      truong: 'trangThai',
      tuGiaTri: undefined,
      sangGiaTri: 'CHUA_BAT_DAU',
      taoLuc: now
    });
    return created;
  }

  async update(ctx: AuthContext, id: string, input: any) {
    const task = await this.get(ctx, id);
    if (task.nguoiGiaoId !== ctx.userId && !task.nguoiThucHienIds.includes(ctx.userId)) {
      throw new DomainError('FORBIDDEN', 'Chỉ người giao hoặc người thực hiện được cập nhật');
    }
    
    if (task.trangThai === 'HOAN_THANH') {
      throw new DomainError('INVALID_STATE', 'Không thể sửa công việc đã hoàn thành');
    }

    const isThucHien = task.nguoiThucHienIds.includes(ctx.userId) && task.nguoiGiaoId !== ctx.userId;
    if (isThucHien) {
      const allowed = ['tienDo', 'moTa'];
      for (const key of Object.keys(input)) {
        if (!allowed.includes(key)) throw new DomainError('FORBIDDEN', 'Người thực hiện không được sửa trường này');
      }
    }

    const history: LichSuThayDoi[] = [];
    const now = this.clock();
    for (const key of Object.keys(input)) {
      if ((task as any)[key] !== input[key]) {
        history.push({
          id: randomUUID(),
          congViecId: id,
          userId: ctx.userId,
          truong: key,
          tuGiaTri: String((task as any)[key] || ''),
          sangGiaTri: String(input[key] || ''),
          taoLuc: now
        });
      }
    }

    if (history.length) await this.lichSuRepo.insertMany(history);
    
    return await this.congViecRepo.update(ctx.congTyId, id, input);
  }

  async softDelete(ctx: AuthContext, id: string) {
    const task = await this.get(ctx, id);
    if (task.nguoiGiaoId !== ctx.userId) throw new DomainError('FORBIDDEN', 'Chỉ người giao được xóa');
    if (task.trangThai === 'HOAN_THANH') throw new DomainError('INVALID_STATE', 'Không thể xóa công việc đã hoàn thành');
    
    await this.congViecRepo.update(ctx.congTyId, id, { deletedAt: this.clock() });
  }

  async transition(ctx: AuthContext, id: string, payload: { trangThai: string, lyDo?: string }) {
    const task = await this.get(ctx, id);
    if (task.trangThai === 'HOAN_THANH') throw new DomainError('INVALID_STATE', 'Công việc đã hoàn thành');

    const isGiao = task.nguoiGiaoId === ctx.userId;
    const isThucHien = task.nguoiThucHienIds.includes(ctx.userId);

    const from = task.trangThai;
    const to = payload.trangThai;
    
    const patch: Partial<CongViec> = { trangThai: to as any };

    if (from === 'CHUA_BAT_DAU' && to === 'DANG_LAM') {
      if (!isThucHien) throw new DomainError('FORBIDDEN', 'Chỉ người thực hiện mới được bắt đầu');
    } else if (from === 'DANG_LAM' && to === 'CHO_DUYET') {
      if (!isThucHien) throw new DomainError('FORBIDDEN', 'Chỉ người thực hiện mới được gửi duyệt');
      patch.tienDo = 100;
    } else if (from === 'CHO_DUYET' && to === 'HOAN_THANH') {
      if (!isGiao) throw new DomainError('FORBIDDEN', 'Chỉ người giao được duyệt hoàn thành', 403);
    } else if (from === 'CHO_DUYET' && to === 'DANG_LAM') {
      if (!isGiao) throw new DomainError('FORBIDDEN', 'Chỉ người giao được trả lại', 403);
      if (!payload.lyDo) throw new DomainError('INVALID_INPUT', 'Cần có lý do từ chối');
    } else {
      throw new DomainError('INVALID_STATE', `Chuyển trạng thái từ ${from} sang ${to} không hợp lệ`);
    }

    const updated = await this.congViecRepo.update(ctx.congTyId, id, patch);
    await this.lichSuRepo.insert({
      id: randomUUID(),
      congViecId: id,
      userId: ctx.userId,
      truong: 'trangThai',
      tuGiaTri: from,
      sangGiaTri: to,
      lyDo: payload.lyDo,
      taoLuc: this.clock()
    });

    return updated;
  }

  async getHistory(ctx: AuthContext, id: string) {
    await this.get(ctx, id);
    return await this.lichSuRepo.findByCongViec(id);
  }

  async listViecCon(ctx: AuthContext, id: string) {
    await this.get(ctx, id);
    return await this.viecConRepo.findByCongViec(id);
  }

  async addViecCon(ctx: AuthContext, id: string, input: { ten: string }) {
    await this.get(ctx, id);
    const existing = await this.viecConRepo.findByCongViec(id);
    const thuTu = existing.length > 0 ? Math.max(...existing.map(v => v.thuTu)) + 1 : 1;
    
    const now = this.clock();
    return await this.viecConRepo.insert({
      id: randomUUID(),
      congViecId: id,
      ten: input.ten,
      hoanThanh: false,
      thuTu,
      taoLuc: now,
      capNhatLuc: now
    });
  }

  async updateViecCon(ctx: AuthContext, id: string, vcId: string, patch: any) {
    await this.get(ctx, id);
    const updated = await this.viecConRepo.update(id, vcId, patch);
    
    // Auto update parent progress
    if (patch.hoanThanh !== undefined) {
      const counts = await this.viecConRepo.countCompleted(id);
      if (counts.total > 0) {
        const tienDo = Math.round((counts.completed / counts.total) * 100);
        await this.congViecRepo.update(ctx.congTyId, id, { tienDo });
      }
    }
    
    return updated;
  }

  async deleteViecCon(ctx: AuthContext, id: string, vcId: string) {
    await this.get(ctx, id);
    await this.viecConRepo.delete(id, vcId);
  }

  async listBinhLuan(ctx: AuthContext, id: string, page: number, limit: number) {
    await this.get(ctx, id);
    return await this.binhLuanRepo.findByCongViec(id, page, limit);
  }

  async addBinhLuan(ctx: AuthContext, id: string, input: { noiDung: string }) {
    await this.get(ctx, id);
    const now = this.clock();
    return await this.binhLuanRepo.insert({
      id: randomUUID(),
      congViecId: id,
      userId: ctx.userId,
      noiDung: input.noiDung,
      taoLuc: now,
      capNhatLuc: now
    });
  }
}
