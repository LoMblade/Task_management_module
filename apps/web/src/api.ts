import type { CongViec, TaoCongViec } from '@erp/contracts';

export type ApiList = { data: CongViec[]; meta: { page: number; limit: number; total: number } };
export type DemoUser = { id: string; name: string; role: string };
export const users: DemoUser[] = [
  { id: 'u-chi-huy', name: 'Nguyễn Minh Chỉ huy', role: 'Chỉ huy công trình' },
  { id: 'u-truong-phong', name: 'Trần Lan Trưởng phòng', role: 'Trưởng phòng' },
  { id: 'u-ky-su-1', name: 'Lê Hoàng Kỹ sư', role: 'Kỹ sư' },
  { id: 'u-ky-su-2', name: 'Phạm An Kỹ sư', role: 'Kỹ sư' },
  { id: 'u-ky-su-3', name: 'Đỗ Bình Kỹ sư', role: 'Kỹ sư' },
  { id: 'u-ky-su-4', name: 'Vũ Mai Kỹ sư', role: 'Kỹ sư' },
  { id: 'u-to-doi-1', name: 'Tổ đội thi công A', role: 'Tổ đội' },
  { id: 'u-ke-toan', name: 'Ngô Hà Kế toán', role: 'Nhân viên' },
];
const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const tokenFor = (userId: string) => `Bearer ${btoa(JSON.stringify({ userId, congTyId: 'ct-long-do' }))}`;

async function request<T>(path: string, userId: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { 'content-type': 'application/json', authorization: tokenFor(userId), ...init?.headers } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? 'Không thể kết nối máy chủ');
  return body as T;
}
export const listCongViec = (userId: string, params: URLSearchParams) => request<ApiList>(`/api/cong-viec?${params}`, userId);
export const createCongViec = (userId: string, input: TaoCongViec) => request<{ data: CongViec }>('/api/cong-viec', userId, { method: 'POST', body: JSON.stringify(input) });
export const transitionCongViec = (userId: string, id: string, trangThai: string, lyDo?: string) => request<{ data: CongViec }>(`/api/cong-viec/${id}/trang-thai`, userId, { method: 'POST', body: JSON.stringify({ trangThai, lyDo }) });
