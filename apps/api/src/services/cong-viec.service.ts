import { randomUUID } from 'node:crypto';
import { taoCongViecSchema, capNhatCongViecSchema, chuyenTrangThaiSchema, capNhatTienDoSchema } from '@erp/contracts';
import type { AuthContext, CongViecRepository, CreateInput, UpdateInput, StatusInput, CongViecRecord, CongViecFilter } from '../domain.js';

export class DomainError extends Error { constructor(public readonly code: string, message: string, public readonly status = 400) { super(message); } }

export class CongViecService {
  constructor(private readonly repository: CongViecRepository, private readonly clock = () => new Date()) {}
  private now() { return this.clock().toISOString(); }
  private require(task: CongViecRecord | null): CongViecRecord { if (!task) throw new DomainError('NOT_FOUND', 'Không tìm thấy công việc', 404); return task; }
  private isAssignee(task: CongViecRecord, userId: string) { return task.nguoiThucHienIds.includes(userId); }
  private isManager(task: CongViecRecord, userId: string) { return task.nguoiGiaoId === userId; }

  async list(context: AuthContext, query: Omit<CongViecFilter, 'congTyId' | 'userId'>) { return this.repository.list({ ...query, congTyId: context.congTyId, userId: context.userId }); }

  async get(context: AuthContext, id: string) {
    return this.require(await this.repository.findById(context.congTyId, id));
  }

  async create(context: AuthContext, input: CreateInput) {
    const value = taoCongViecSchema.parse(input);
    const now = this.now();
    const task: CongViecRecord = { ...value, id: randomUUID(), ma: await this.repository.nextMa(context.congTyId), nguoiGiaoId: context.userId, congTyId: context.congTyId, trangThai: 'CHUA_BAT_DAU', tienDo: 0, taoLuc: now, capNhatLuc: now, lichSu: [] };
    return this.repository.insert(task);
  }

  async update(context: AuthContext, id: string, input: UpdateInput) {
    const task = this.require(await this.repository.findById(context.congTyId, id));
    if (!this.isManager(task, context.userId)) throw new DomainError('FORBIDDEN', 'Chỉ người giao được sửa công việc', 403);
    if (task.trangThai === 'HOAN_THANH') throw new DomainError('FINAL_STATE', 'Công việc đã hoàn thành không thể sửa');
    const value = capNhatCongViecSchema.parse(input);
    const changes = Object.entries(value).filter(([, next]) => next !== undefined).map(([truong, sang]) => ({ userId: context.userId, truong, tu: task[truong as keyof CongViecRecord], sang, luc: this.now() }));
    return this.repository.update(context.congTyId, id, { ...value, capNhatLuc: this.now(), lichSu: [...task.lichSu, ...changes] });
  }

  async progress(context: AuthContext, id: string, input: unknown) {
    const task = this.require(await this.repository.findById(context.congTyId, id));
    if (!this.isAssignee(task, context.userId)) throw new DomainError('FORBIDDEN', 'Bạn không phải người thực hiện công việc', 403);
    if (task.trangThai === 'HOAN_THANH') throw new DomainError('FINAL_STATE', 'Công việc đã hoàn thành không thể cập nhật');
    const value = capNhatTienDoSchema.parse(input);
    if (value.trangThai === 'CHO_DUYET' && value.tienDo !== 100) throw new DomainError('INVALID_STATUS', 'Chuyển chờ duyệt sẽ tự đặt tiến độ 100%');
    return this.repository.update(context.congTyId, id, { tienDo: value.trangThai === 'CHO_DUYET' ? 100 : value.tienDo, trangThai: value.trangThai ?? (value.tienDo > 0 ? 'DANG_LAM' : 'CHUA_BAT_DAU'), capNhatLuc: this.now() });
  }

  async transition(context: AuthContext, id: string, input: StatusInput) {
    const task = this.require(await this.repository.findById(context.congTyId, id));
    const value = chuyenTrangThaiSchema.parse(input);
    if (value.trangThai === 'HOAN_THANH' || (task.trangThai === 'CHO_DUYET' && value.trangThai === 'DANG_LAM')) {
      if (!this.isManager(task, context.userId)) throw new DomainError('FORBIDDEN', 'Chỉ người giao được duyệt hoặc trả lại', 403);
      if (value.trangThai === 'DANG_LAM' && !value.lyDo) throw new DomainError('REASON_REQUIRED', 'Trả lại bắt buộc phải ghi lý do');
    } else if (!this.isAssignee(task, context.userId)) throw new DomainError('FORBIDDEN', 'Bạn không có quyền chuyển trạng thái', 403);
    const allowed = task.trangThai === 'CHUA_BAT_DAU' && value.trangThai === 'DANG_LAM' || task.trangThai === 'DANG_LAM' && value.trangThai === 'CHO_DUYET' || task.trangThai === 'CHO_DUYET' && ['DANG_LAM', 'HOAN_THANH'].includes(value.trangThai);
    if (!allowed) throw new DomainError('INVALID_STATUS', 'Luồng trạng thái không hợp lệ');
    const now = this.now();
    return this.repository.update(context.congTyId, id, { trangThai: value.trangThai, tienDo: value.trangThai === 'CHO_DUYET' || value.trangThai === 'HOAN_THANH' ? 100 : task.tienDo, capNhatLuc: now, lichSu: [...task.lichSu, { userId: context.userId, truong: 'trangThai', tu: task.trangThai, sang: value.trangThai, luc: now, lyDo: value.lyDo }] });
  }

  async softDelete(context: AuthContext, id: string) {
    const task = this.require(await this.repository.findById(context.congTyId, id));
    if (!this.isManager(task, context.userId)) throw new DomainError('FORBIDDEN', 'Chỉ người giao được xóa công việc', 403);
    if (task.trangThai === 'HOAN_THANH') throw new DomainError('FINAL_STATE', 'Không thể xóa công việc đã hoàn thành');
    return this.repository.update(context.congTyId, id, { deletedAt: this.now(), capNhatLuc: this.now() });
  }
}
