import { supabase } from './supabase';

function parseToken(token: string) {
  try {
    return JSON.parse(atob(token.replace('Bearer ', '')));
  } catch {
    return { userId: '', isAdmin: false };
  }
}

export function tokenFor(userId: string, chucVu?: string): string {
  const isAdmin = chucVu === 'Giám đốc' || chucVu === 'Tổng giám đốc';
  return `Bearer ${btoa(JSON.stringify({ userId, congTyId: 'ct-long-do', isAdmin }))}`;
}

export const congViecApi = {
  list: async (token: string, params: URLSearchParams) => {
    const { userId } = parseToken(token);
    const scope = params.get('scope') || 'TAT_CA';
    
    const { data: allTasks, error } = await supabase.from('CongViec').select('*');
    if (error) throw error;
    
    const tasks = allTasks || [];
    const cuaToi = tasks.filter(t => t.nguoiThucHienIds?.includes(userId)).length;
    const toiGiao = tasks.filter(t => t.nguoiGiaoId === userId).length;
    const theoDoi = tasks.filter(t => t.nguoiTheoDoiIds?.includes(userId)).length;
    const tatCa = tasks.length;
    
    let filtered = tasks;
    if (scope === 'CUA_TOI') filtered = tasks.filter(t => t.nguoiThucHienIds?.includes(userId));
    if (scope === 'TOI_GIAO') filtered = tasks.filter(t => t.nguoiGiaoId === userId);
    if (scope === 'THEO_DOI') filtered = tasks.filter(t => t.nguoiTheoDoiIds?.includes(userId));
    
    const duAnId = params.get('duAnId');
    if (duAnId === 'viec-chung') filtered = filtered.filter(t => !t.duAnId);
    else if (duAnId) filtered = filtered.filter(t => t.duAnId === duAnId);
    
    const trangThai = params.get('trangThai');
    if (trangThai) filtered = filtered.filter(t => t.trangThai === trangThai);
    
    return {
      data: filtered,
      meta: { page: 1, limit: filtered.length, total: filtered.length },
      counts: { cuaToi, toiGiao, theoDoi, tatCa }
    };
  },
  get: async (token: string, id: string) => {
    const { data, error } = await supabase.from('CongViec').select('*').eq('id', id).single();
    if (error) throw error;
    return { data };
  },
  create: async (token: string, input: any) => {
    const { data, error } = await supabase.from('CongViec').insert([input]).select().single();
    if (error) throw error;
    return { data };
  },
  update: async (token: string, id: string, input: any) => {
    const { data, error } = await supabase.from('CongViec').update(input).eq('id', id).select().single();
    if (error) throw error;
    return { data };
  },
  transition: async (token: string, id: string, body: any) => {
    const { data, error } = await supabase.from('CongViec').update({ trangThai: body.trangThai }).eq('id', id).select().single();
    if (error) throw error;
    return { data };
  },
  remove: async (token: string, id: string) => {
    const { error } = await supabase.from('CongViec').delete().eq('id', id);
    if (error) throw error;
    return { data: { success: true } };
  },
  getHistory: async (token: string, id: string) => {
    const { data, error } = await supabase.from('LichSuThayDoi').select('*').eq('congViecId', id);
    if (error) throw error;
    return { data: data || [] };
  },
  listViecCon: async (token: string, id: string) => {
    const { data, error } = await supabase.from('ViecCon').select('*').eq('congViecId', id).order('thuTu');
    if (error) throw error;
    return { data: data || [] };
  },
  addViecCon: async (token: string, id: string, input: any) => {
    input.congViecId = id;
    const { data, error } = await supabase.from('ViecCon').insert([input]).select().single();
    if (error) throw error;
    return { data };
  },
  updateViecCon: async (token: string, congViecId: string, viecConId: string, input: any) => {
    const { data, error } = await supabase.from('ViecCon').update(input).eq('id', viecConId).select().single();
    if (error) throw error;
    return { data };
  },
  deleteViecCon: async (token: string, congViecId: string, viecConId: string) => {
    const { error } = await supabase.from('ViecCon').delete().eq('id', viecConId);
    if (error) throw error;
    return { data: { success: true } };
  },
  listBinhLuan: async (token: string, id: string, page = 1, limit = 10) => {
    const { data, error } = await supabase.from('BinhLuan').select('*').eq('congViecId', id).order('taoLuc', { ascending: false });
    if (error) throw error;
    return { data: data || [], meta: { page, limit, total: data?.length || 0 } };
  },
  addBinhLuan: async (token: string, id: string, input: any) => {
    input.congViecId = id;
    const { data, error } = await supabase.from('BinhLuan').insert([input]).select().single();
    if (error) throw error;
    return { data };
  },
};

export const danhMucApi = {
  listNhanVien: async (token: string) => {
    const { data, error } = await supabase.from('NhanVien').select('*');
    if (error) throw error;
    return { data: data || [] };
  },
  createNhanVien: async (token: string, input: any) => {
    const { data, error } = await supabase.from('NhanVien').insert([input]).select().single();
    if (error) throw error;
    return { data };
  },
  updateNhanVien: async (token: string, id: string, input: any) => {
    const { data, error } = await supabase.from('NhanVien').update(input).eq('id', id).select().single();
    if (error) throw error;
    return { data };
  },
  deleteNhanVien: async (token: string, id: string) => {
    const { error } = await supabase.from('NhanVien').delete().eq('id', id);
    if (error) throw error;
    return { data: { success: true } };
  },
  listDuAn: async (token: string) => {
    const { data, error } = await supabase.from('DuAn').select('*');
    if (error) throw error;
    return { data: data || [] };
  },
};
