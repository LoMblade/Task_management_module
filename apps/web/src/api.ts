const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function tokenFor(userId: string, chucVu?: string): string {
  const isAdmin = chucVu === 'Giám đốc' || chucVu === 'Tổng giám đốc';
  return `Bearer ${btoa(JSON.stringify({ userId, congTyId: 'ct-long-do', isAdmin }))}`;
}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', authorization: token, ...init?.headers },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? 'Lỗi kết nối máy chủ');
  return body as T;
}

export const congViecApi = {
  list: (token: string, params: URLSearchParams) =>
    request<{ data: any[]; meta: { page: number; limit: number; total: number }; counts: { cuaToi: number; toiGiao: number; theoDoi: number; tatCa: number } }>(`/api/cong-viec?${params}`, token),
  get: (token: string, id: string) =>
    request<{ data: any }>(`/api/cong-viec/${id}`, token),
  create: (token: string, input: any) =>
    request<{ data: any }>('/api/cong-viec', token, { method: 'POST', body: JSON.stringify(input) }),
  update: (token: string, id: string, input: any) =>
    request<{ data: any }>(`/api/cong-viec/${id}`, token, { method: 'PATCH', body: JSON.stringify(input) }),
  transition: (token: string, id: string, body: any) =>
    request<{ data: any }>(`/api/cong-viec/${id}/trang-thai`, token, { method: 'POST', body: JSON.stringify(body) }),
  remove: (token: string, id: string) =>
    request<{ data: any }>(`/api/cong-viec/${id}`, token, { method: 'DELETE' }),
  getHistory: (token: string, id: string) =>
    request<{ data: any[] }>(`/api/cong-viec/${id}/lich-su`, token),
  listViecCon: (token: string, id: string) =>
    request<{ data: any[] }>(`/api/cong-viec/${id}/viec-con`, token),
  addViecCon: (token: string, id: string, input: any) =>
    request<{ data: any }>(`/api/cong-viec/${id}/viec-con`, token, { method: 'POST', body: JSON.stringify(input) }),
  updateViecCon: (token: string, congViecId: string, viecConId: string, input: any) =>
    request<{ data: any }>(`/api/cong-viec/${congViecId}/viec-con/${viecConId}`, token, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteViecCon: (token: string, congViecId: string, viecConId: string) =>
    request<{ data: any }>(`/api/cong-viec/${congViecId}/viec-con/${viecConId}`, token, { method: 'DELETE' }),
  listBinhLuan: (token: string, id: string, page = 1, limit = 10) =>
    request<{ data: any[]; meta: { page: number; limit: number; total: number } }>(`/api/cong-viec/${id}/binh-luan?page=${page}&limit=${limit}`, token),
  addBinhLuan: (token: string, id: string, input: any) =>
    request<{ data: any }>(`/api/cong-viec/${id}/binh-luan`, token, { method: 'POST', body: JSON.stringify(input) }),
};

export const danhMucApi = {
  listNhanVien: (token: string) =>
    request<{ data: any[] }>('/api/nhan-vien', token),
  createNhanVien: (token: string, input: any) =>
    request<{ data: any }>('/api/nhan-vien', token, { method: 'POST', body: JSON.stringify(input) }),
  updateNhanVien: (token: string, id: string, input: any) =>
    request<{ data: any }>(`/api/nhan-vien/${id}`, token, { method: 'PUT', body: JSON.stringify(input) }),
  deleteNhanVien: (token: string, id: string) =>
    request<{ data: any }>(`/api/nhan-vien/${id}`, token, { method: 'DELETE' }),
  listDuAn: (token: string) =>
    request<{ data: any[] }>('/api/du-an', token),
};
