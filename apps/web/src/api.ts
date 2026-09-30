export function tokenFor(userId: string, chucVu?: string): string {
  const isAdmin = chucVu === 'Giám đốc' || chucVu === 'Tổng giám đốc';
  return `Bearer ${btoa(JSON.stringify({ userId, congTyId: 'ct-long-do', isAdmin }))}`;
}

const API_URL = 'http://localhost:3000';

async function request<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...options?.headers,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || body.error?.message || 'API Error');
  }

  return body;
}

export const congViecApi = {
  list: async (token: string, params: URLSearchParams) => {
    return request<any>(`/api/cong-viec?${params.toString()}`, token);
  },
  get: async (token: string, id: string) => {
    return request<any>(`/api/cong-viec/${id}`, token);
  },
  create: async (token: string, input: any) => {
    return request<any>('/api/cong-viec', token, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update: async (token: string, id: string, input: any) => {
    return request<any>(`/api/cong-viec/${id}`, token, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  transition: async (token: string, id: string, body: any) => {
    return request<any>(`/api/cong-viec/${id}/trang-thai`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  remove: async (token: string, id: string) => {
    return request<any>(`/api/cong-viec/${id}`, token, {
      method: 'DELETE',
    });
  },
  getHistory: async (token: string, id: string) => {
    return request<any>(`/api/cong-viec/${id}/lich-su`, token);
  },
  listViecCon: async (token: string, id: string) => {
    return request<any>(`/api/cong-viec/${id}/viec-con`, token);
  },
  addViecCon: async (token: string, id: string, input: any) => {
    return request<any>(`/api/cong-viec/${id}/viec-con`, token, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  updateViecCon: async (token: string, congViecId: string, viecConId: string, input: any) => {
    return request<any>(`/api/cong-viec/${congViecId}/viec-con/${viecConId}`, token, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  deleteViecCon: async (token: string, congViecId: string, viecConId: string) => {
    return request<any>(`/api/cong-viec/${congViecId}/viec-con/${viecConId}`, token, {
      method: 'DELETE',
    });
  },
  listBinhLuan: async (token: string, id: string, page = 1, limit = 10) => {
    return request<any>(`/api/cong-viec/${id}/binh-luan?page=${page}&limit=${limit}`, token);
  },
  addBinhLuan: async (token: string, id: string, input: any) => {
    return request<any>(`/api/cong-viec/${id}/binh-luan`, token, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

export const danhMucApi = {
  listNhanVien: async (token: string) => {
    return request<any>('/api/nhan-vien', token);
  },
  createNhanVien: async (token: string, input: any) => {
    return request<any>('/api/nhan-vien', token, { method: 'POST', body: JSON.stringify(input) });
  },
  updateNhanVien: async (token: string, id: string, input: any) => {
    return request<any>(`/api/nhan-vien/${id}`, token, { method: 'PUT', body: JSON.stringify(input) });
  },
  deleteNhanVien: async (token: string, id: string) => {
    return request<any>(`/api/nhan-vien/${id}`, token, { method: 'DELETE' });
  },
  listDuAn: async (token: string) => {
    return request<any>('/api/du-an', token);
  },
};
