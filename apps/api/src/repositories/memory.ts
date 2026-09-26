import type { CongViecRepository, CongViecFilter, CongViecRecord } from '../domain.js';

export class MemoryCongViecRepository implements CongViecRepository {
  private readonly items: CongViecRecord[] = [];

  async list(filter: CongViecFilter) {
    const visible = this.items.filter((item) => {
      if (item.congTyId !== filter.congTyId || item.deletedAt) return false;
      const related = item.nguoiGiaoId === filter.userId || item.nguoiThucHienIds.includes(filter.userId) || item.nguoiTheoDoiIds.includes(filter.userId);
      if (filter.scope === 'CUA_TOI' && !item.nguoiThucHienIds.includes(filter.userId)) return false;
      if (filter.scope === 'TOI_GIAO' && item.nguoiGiaoId !== filter.userId) return false;
      if (filter.scope === 'THEO_DOI' && !item.nguoiTheoDoiIds.includes(filter.userId)) return false;
      if (filter.scope === 'TAT_CA' && !related) return false;
      if (filter.duAnId && item.duAnId !== filter.duAnId) return false;
      if (filter.trangThai && item.trangThai !== filter.trangThai) return false;
      if (filter.uuTien && item.uuTien !== filter.uuTien) return false;
      if (filter.quaHan !== undefined && (item.hetHan ? item.hetHan < filter.today && item.trangThai !== 'HOAN_THANH' : false) !== filter.quaHan) return false;
      if (filter.q && !`${item.ma} ${item.ten}`.toLocaleLowerCase('vi').includes(filter.q.toLocaleLowerCase('vi'))) return false;
      return true;
    }).sort((a, b) => (a.hetHan ?? '9999-12-31').localeCompare(b.hetHan ?? '9999-12-31'));
    const start = (filter.page - 1) * filter.limit;
    return { items: visible.slice(start, start + filter.limit), total: visible.length };
  }

  async findById(congTyId: string, id: string) {
    return this.items.find((item) => item.congTyId === congTyId && item.id === id && !item.deletedAt) ?? null;
  }

  async insert(input: CongViecRecord) { this.items.push(input); return input; }

  async update(congTyId: string, id: string, patch: Partial<CongViecRecord>) {
    const index = this.items.findIndex((item) => item.congTyId === congTyId && item.id === id);
    if (index < 0) throw new Error('NOT_FOUND');
    this.items[index] = { ...this.items[index], ...patch };
    return this.items[index];
  }

  async nextMa(congTyId: string) {
    return `CV-${String(this.items.filter((item) => item.congTyId === congTyId).length + 1001).padStart(4, '0')}`;
  }
}
