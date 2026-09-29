import type { CongViec, LichSuThayDoi, ViecCon, BinhLuan, NhanVien, DuAn } from '@erp/contracts';
import { CongViecRepository, LichSuRepository, ViecConRepository, BinhLuanRepository, DanhMucRepository, CongViecFilter, ScopeCounts, isQuaHan } from '../domain';

export class MemoryCongViecRepository implements CongViecRepository {
  private items: CongViec[] = [];

  async list(filter: CongViecFilter): Promise<{ items: CongViec[]; total: number; counts: ScopeCounts }> {
    const { congTyId, userId, isAdmin, today, page, limit, scope, duAnId, trangThai, uuTien, q, quaHan, sort } = filter;
    
    const visibleTasks = this.items.filter(t => t.congTyId === congTyId && !t.deletedAt && 
      (isAdmin || t.nguoiGiaoId === userId || t.nguoiThucHienIds?.includes(userId) || t.nguoiTheoDoiIds?.includes(userId)));

    const counts: ScopeCounts = { cuaToi: 0, toiGiao: 0, theoDoi: 0, tatCa: 0 };
    visibleTasks.forEach(t => {
      let counted = false;
      if (t.nguoiThucHienIds?.includes(userId)) { counts.cuaToi++; counted = true; }
      if (t.nguoiGiaoId === userId) { counts.toiGiao++; counted = true; }
      if (t.nguoiTheoDoiIds?.includes(userId)) { counts.theoDoi++; counted = true; }
      if (counted || isAdmin) counts.tatCa++;
    });

    let filtered = visibleTasks;
    
    if (scope === 'CUA_TOI') filtered = filtered.filter(t => t.nguoiThucHienIds?.includes(userId));
    else if (scope === 'TOI_GIAO') filtered = filtered.filter(t => t.nguoiGiaoId === userId);
    else if (scope === 'THEO_DOI') filtered = filtered.filter(t => t.nguoiTheoDoiIds?.includes(userId));

    if (duAnId !== undefined) {
      if (duAnId === 'null') {
          filtered = filtered.filter(t => !t.duAnId);
      } else {
          filtered = filtered.filter(t => t.duAnId === duAnId);
      }
    }
    if (trangThai) filtered = filtered.filter(t => t.trangThai === trangThai);
    if (uuTien) filtered = filtered.filter(t => t.uuTien === uuTien);
    if (q) {
      const qs = q.toLowerCase();
      filtered = filtered.filter(t => t.ma.toLowerCase().includes(qs) || t.ten.toLowerCase().includes(qs));
    }
    if (quaHan) filtered = filtered.filter(t => isQuaHan(t, today));

    if (sort === '-hetHan') filtered.sort((a, b) => (b.hetHan || '').localeCompare(a.hetHan || ''));
    else if (sort === 'hetHan') filtered.sort((a, b) => (a.hetHan || '').localeCompare(b.hetHan || ''));
    else if (sort === '-capNhatLuc') filtered.sort((a, b) => new Date(b.capNhatLuc).getTime() - new Date(a.capNhatLuc).getTime());
    else if (sort === 'capNhatLuc') filtered.sort((a, b) => new Date(a.capNhatLuc).getTime() - new Date(b.capNhatLuc).getTime());

    const total = filtered.length;
    const items = filtered.slice((page - 1) * limit, page * limit);

    return { items, total, counts };
  }

  async findById(congTyId: string, id: string): Promise<CongViec | null> {
    return this.items.find(t => t.id === id && t.congTyId === congTyId && !t.deletedAt) || null;
  }

  async insert(task: CongViec): Promise<CongViec> {
    this.items.push(task);
    return task;
  }

  async update(congTyId: string, id: string, patch: Partial<CongViec>): Promise<CongViec> {
    const idx = this.items.findIndex(t => t.id === id && t.congTyId === congTyId);
    if (idx > -1) {
      this.items[idx] = { ...this.items[idx], ...patch, capNhatLuc: new Date().toISOString() };
      return this.items[idx];
    }
    throw new Error('Not found');
  }

  async nextMa(congTyId: string): Promise<string> {
    const count = this.items.filter(t => t.congTyId === congTyId).length;
    return `CV-${String(count + 1).padStart(4, '0')}`;
  }
}

export class MemoryLichSuRepository implements LichSuRepository {
  private items: LichSuThayDoi[] = [];

  async insert(entry: LichSuThayDoi): Promise<LichSuThayDoi> {
    this.items.push(entry);
    return entry;
  }

  async insertMany(entries: LichSuThayDoi[]): Promise<void> {
    this.items.push(...entries);
  }

  async findByCongViec(congViecId: string): Promise<LichSuThayDoi[]> {
    return this.items.filter(t => t.congViecId === congViecId).sort((a, b) => new Date(b.taoLuc).getTime() - new Date(a.taoLuc).getTime());
  }
}

export class MemoryViecConRepository implements ViecConRepository {
  private items: ViecCon[] = [];

  async findByCongViec(congViecId: string): Promise<ViecCon[]> {
    return this.items.filter(t => t.congViecId === congViecId).sort((a, b) => a.thuTu - b.thuTu);
  }

  async insert(item: ViecCon): Promise<ViecCon> {
    this.items.push(item);
    return item;
  }

  async update(congViecId: string, id: string, patch: Partial<ViecCon>): Promise<ViecCon> {
    const idx = this.items.findIndex(t => t.id === id && t.congViecId === congViecId);
    if (idx > -1) {
      this.items[idx] = { ...this.items[idx], ...patch, capNhatLuc: new Date().toISOString() };
      return this.items[idx];
    }
    throw new Error('Not found');
  }

  async delete(congViecId: string, id: string): Promise<void> {
    const idx = this.items.findIndex(t => t.id === id && t.congViecId === congViecId);
    if (idx > -1) {
      this.items.splice(idx, 1);
    }
  }

  async countCompleted(congViecId: string): Promise<{ total: number; completed: number }> {
    const list = this.items.filter(t => t.congViecId === congViecId);
    return {
      total: list.length,
      completed: list.filter(t => t.hoanThanh === true).length
    };
  }
}

export class MemoryBinhLuanRepository implements BinhLuanRepository {
  private items: BinhLuan[] = [];

  async findByCongViec(congViecId: string, page: number, limit: number): Promise<{ items: BinhLuan[]; total: number }> {
    const all = this.items.filter(t => t.congViecId === congViecId).sort((a, b) => new Date(b.taoLuc).getTime() - new Date(a.taoLuc).getTime());
    return {
      items: all.slice((page - 1) * limit, page * limit),
      total: all.length
    };
  }

  async insert(item: BinhLuan): Promise<BinhLuan> {
    this.items.push(item);
    return item;
  }
}

export class MemoryDanhMucRepository implements DanhMucRepository {
  private nhanVien: NhanVien[] = [];
  private duAn: DuAn[] = [];

  async listNhanVien(congTyId: string): Promise<NhanVien[]> {
    return this.nhanVien.filter(nv => nv.congTyId === congTyId);
  }

  async listDuAn(congTyId: string): Promise<DuAn[]> {
    return this.duAn.filter(da => da.congTyId === congTyId);
  }

  async insertNhanVien(item: NhanVien): Promise<void> {
    this.nhanVien.push(item);
  }

  async insertDuAn(item: DuAn): Promise<void> {
    this.duAn.push(item);
  }
}
