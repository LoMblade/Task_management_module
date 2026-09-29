import type { CongViec, LichSuThayDoi, ViecCon, BinhLuan, NhanVien, DuAn } from '@erp/contracts';

export type AuthContext = { userId: string; congTyId: string; isAdmin?: boolean };

export interface CongViecRepository {
  list(filter: CongViecFilter): Promise<{ items: CongViec[]; total: number; counts: ScopeCounts }>;
  findById(congTyId: string, id: string): Promise<CongViec | null>;
  insert(task: CongViec): Promise<CongViec>;
  update(congTyId: string, id: string, patch: Partial<CongViec>): Promise<CongViec>;
  nextMa(congTyId: string): Promise<string>;
}

export interface LichSuRepository {
  insert(entry: LichSuThayDoi): Promise<LichSuThayDoi>;
  insertMany(entries: LichSuThayDoi[]): Promise<void>;
  findByCongViec(congViecId: string): Promise<LichSuThayDoi[]>;
}

export interface ViecConRepository {
  findByCongViec(congViecId: string): Promise<ViecCon[]>;
  insert(item: ViecCon): Promise<ViecCon>;
  update(congViecId: string, id: string, patch: Partial<ViecCon>): Promise<ViecCon>;
  delete(congViecId: string, id: string): Promise<void>;
  countCompleted(congViecId: string): Promise<{ total: number; completed: number }>;
}

export interface BinhLuanRepository {
  findByCongViec(congViecId: string, page: number, limit: number): Promise<{ items: BinhLuan[]; total: number }>;
  insert(item: BinhLuan): Promise<BinhLuan>;
}

export interface DanhMucRepository {
  listNhanVien(congTyId: string): Promise<NhanVien[]>;
  insertNhanVien(item: NhanVien): Promise<void>;
  updateNhanVien(congTyId: string, id: string, patch: Partial<NhanVien>): Promise<NhanVien>;
  deleteNhanVien(congTyId: string, id: string): Promise<void>;
  listDuAn(congTyId: string): Promise<DuAn[]>;
}

export type ScopeCounts = { cuaToi: number; toiGiao: number; theoDoi: number; tatCa: number };

export type CongViecFilter = {
  congTyId: string; userId: string; isAdmin?: boolean; today: string;
  page: number; limit: number;
  scope: 'CUA_TOI' | 'TOI_GIAO' | 'THEO_DOI' | 'TAT_CA';
  duAnId?: string; trangThai?: string; uuTien?: string;
  q?: string; quaHan?: boolean;
  sort: string;
};

export function isQuaHan(task: CongViec, today: string): boolean {
  return task.trangThai !== 'HOAN_THANH' && Boolean(task.hetHan && task.hetHan < today);
}

export class DomainError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}
