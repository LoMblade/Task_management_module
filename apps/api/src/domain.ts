import type { CongViec, TaoCongViec, CapNhatCongViec, CongViecQuery, ChuyenTrangThai } from '@erp/contracts';

export type VaiTro = 'GIAO' | 'THUC_HIEN' | 'THEO_DOI' | 'KHAC';
export type AuthContext = { userId: string; congTyId: string };
export type ChangeLog = { userId: string; truong: string; tu: unknown; sang: unknown; luc: string; lyDo?: string };
export type CongViecRecord = CongViec & { lichSu: ChangeLog[] };
export type CongViecFilter = CongViecQuery & { congTyId: string; today: string; userId: string };

export interface CongViecRepository {
  list(filter: CongViecFilter): Promise<{ items: CongViecRecord[]; total: number }>;
  findById(congTyId: string, id: string): Promise<CongViecRecord | null>;
  insert(input: CongViecRecord): Promise<CongViecRecord>;
  update(congTyId: string, id: string, patch: Partial<CongViecRecord>): Promise<CongViecRecord>;
  nextMa(congTyId: string): Promise<string>;
}

export type CreateInput = TaoCongViec;
export type UpdateInput = CapNhatCongViec;
export type StatusInput = ChuyenTrangThai;

export function isQuaHan(task: CongViec, today: string): boolean {
  return task.trangThai !== 'HOAN_THANH' && Boolean(task.hetHan && task.hetHan < today);
}
