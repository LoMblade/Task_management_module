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
    const { userId, isAdmin } = parseToken(token);
    const scope = params.get('scope') || 'TAT_CA';
    
    const { data: allTasks, error } = await supabase.from('CongViec').select('*');
    if (error) throw error;
    
    // Lọc bỏ các công việc đã xóa mềm (deletedAt)
    const activeTasks = (allTasks || []).filter(t => !t.deletedAt);
    
    const cuaToi = activeTasks.filter(t => t.nguoiThucHienIds?.includes(userId)).length;
    const toiGiao = activeTasks.filter(t => t.nguoiGiaoId === userId).length;
    const theoDoi = activeTasks.filter(t => t.nguoiTheoDoiIds?.includes(userId)).length;
    const tatCa = isAdmin ? activeTasks.length : activeTasks.filter(t => 
      t.nguoiGiaoId === userId || 
      t.nguoiThucHienIds?.includes(userId) || 
      t.nguoiTheoDoiIds?.includes(userId)
    ).length;
    
    let filtered = activeTasks;
    if (scope === 'CUA_TOI') filtered = activeTasks.filter(t => t.nguoiThucHienIds?.includes(userId));
    else if (scope === 'TOI_GIAO') filtered = activeTasks.filter(t => t.nguoiGiaoId === userId);
    else if (scope === 'THEO_DOI') filtered = activeTasks.filter(t => t.nguoiTheoDoiIds?.includes(userId));
    else if (scope === 'TAT_CA' && !isAdmin) {
      filtered = activeTasks.filter(t => 
        t.nguoiGiaoId === userId || 
        t.nguoiThucHienIds?.includes(userId) || 
        t.nguoiTheoDoiIds?.includes(userId)
      );
    }
    
    const duAnId = params.get('duAnId');
    if (duAnId === 'viec-chung') filtered = filtered.filter(t => !t.duAnId);
    else if (duAnId) filtered = filtered.filter(t => t.duAnId === duAnId);
    
    const trangThai = params.get('trangThai');
    if (trangThai === 'QUA_HAN') {
      const now = new Date();
      filtered = filtered.filter(t => t.hetHan && new Date(t.hetHan) < now && t.trangThai !== 'HOAN_THANH');
    } else if (trangThai) {
      filtered = filtered.filter(t => t.trangThai === trangThai);
    }

    const search = params.get('search')?.toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(t => 
        t.ten?.toLowerCase().includes(search) || 
        t.ma?.toLowerCase().includes(search)
      );
    }
    
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
    const { userId } = parseToken(token);
    const { data: oldTask } = await supabase.from('CongViec').select('*').eq('id', id).single();
    
    input.capNhatLuc = new Date().toISOString();
    const { data, error } = await supabase.from('CongViec').update(input).eq('id', id).select().single();
    if (error) throw error;

    // Ghi nhận lịch sử nếu cập nhật tiến độ
    if (input.tienDo !== undefined && oldTask && input.tienDo !== oldTask.tienDo) {
      await supabase.from('LichSuThayDoi').insert([{
        congViecId: id,
        userId: userId || null,
        truong: 'tienDo',
        tuGiaTri: String(oldTask.tienDo),
        sangGiaTri: String(input.tienDo),
        lyDo: 'Cập nhật tiến độ thi công',
        taoLuc: new Date().toISOString()
      }]);
    }

    return { data };
  },
  transition: async (token: string, id: string, body: any) => {
    const { userId } = parseToken(token);
    const { data: oldTask } = await supabase.from('CongViec').select('*').eq('id', id).single();

    const updatePayload: any = { 
      trangThai: body.trangThai,
      capNhatLuc: new Date().toISOString()
    };
    // Yêu cầu: Chuyển sang CHO_DUYET thì tiến độ tự thành 100%
    if (body.trangThai === 'CHO_DUYET' || body.trangThai === 'HOAN_THANH') {
      updatePayload.tienDo = 100;
    }

    const { data, error } = await supabase.from('CongViec').update(updatePayload).eq('id', id).select().single();
    if (error) throw error;

    // Ghi vết lịch sử chuyển trạng thái kèm lý do
    let lyDoMacDinh = 'Chuyển trạng thái';
    if (body.trangThai === 'HOAN_THANH') lyDoMacDinh = 'Duyệt hoàn thành';
    else if (body.trangThai === 'DANG_LAM' && oldTask?.trangThai === 'CHO_DUYET') lyDoMacDinh = body.lyDo || 'Trả lại yêu cầu làm lại';
    else if (body.trangThai === 'CHO_DUYET') lyDoMacDinh = 'Gửi phê duyệt (Tự động cập nhật 100% tiến độ)';
    else if (body.trangThai === 'DANG_LAM') lyDoMacDinh = 'Bắt đầu thực hiện';

    await supabase.from('LichSuThayDoi').insert([{
      congViecId: id,
      userId: userId || null,
      truong: 'trangThai',
      tuGiaTri: oldTask?.trangThai || 'CHUA_BAT_DAU',
      sangGiaTri: body.trangThai,
      lyDo: body.lyDo || lyDoMacDinh,
      taoLuc: new Date().toISOString()
    }]);

    return { data };
  },
  remove: async (token: string, id: string) => {
    // Yêu cầu: Xóa là xóa mềm (deletedAt), không xóa được việc đã hoàn thành
    const { data: task } = await supabase.from('CongViec').select('trangThai').eq('id', id).single();
    if (task?.trangThai === 'HOAN_THANH') {
      throw new Error('Không thể xóa công việc đã hoàn thành');
    }
    const { error } = await supabase.from('CongViec').update({ deletedAt: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    return { data: { success: true } };
  },
  getHistory: async (token: string, id: string) => {
    const { data, error } = await supabase.from('LichSuThayDoi').select('*').eq('congViecId', id).order('taoLuc', { ascending: false });
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
    if (input.hoanThanh === undefined) input.hoanThanh = false;
    const { data, error } = await supabase.from('ViecCon').insert([input]).select().single();
    if (error) throw error;

    // Tự động tính lại tiến độ việc cha theo việc con
    const { data: subtasks } = await supabase.from('ViecCon').select('hoanThanh').eq('congViecId', id);
    if (subtasks && subtasks.length > 0) {
      const completed = subtasks.filter(s => s.hoanThanh).length;
      const newProgress = Math.round((completed / subtasks.length) * 100);
      await supabase.from('CongViec').update({ tienDo: newProgress }).eq('id', id);
    }

    return { data };
  },
  updateViecCon: async (token: string, congViecId: string, viecConId: string, input: any) => {
    if (input.daXong !== undefined && input.hoanThanh === undefined) {
      input.hoanThanh = input.daXong;
      delete input.daXong;
    }
    const { data, error } = await supabase.from('ViecCon').update(input).eq('id', viecConId).select().single();
    if (error) throw error;

    // Yêu cầu (Bonus): tiến độ việc cha tự tính theo việc con
    const { data: subtasks } = await supabase.from('ViecCon').select('hoanThanh').eq('congViecId', congViecId);
    if (subtasks && subtasks.length > 0) {
      const completed = subtasks.filter(s => s.hoanThanh).length;
      const newProgress = Math.round((completed / subtasks.length) * 100);
      await supabase.from('CongViec').update({ tienDo: newProgress }).eq('id', congViecId);
    }

    return { data };
  },
  deleteViecCon: async (token: string, congViecId: string, viecConId: string) => {
    const { error } = await supabase.from('ViecCon').delete().eq('id', viecConId);
    if (error) throw error;

    // Tự động tính lại tiến độ việc cha sau khi xóa việc con
    const { data: subtasks } = await supabase.from('ViecCon').select('hoanThanh').eq('congViecId', congViecId);
    if (subtasks && subtasks.length > 0) {
      const completed = subtasks.filter(s => s.hoanThanh).length;
      const newProgress = Math.round((completed / subtasks.length) * 100);
      await supabase.from('CongViec').update({ tienDo: newProgress }).eq('id', congViecId);
    }

    return { data: { success: true } };
  },
  listBinhLuan: async (token: string, id: string, page = 1, limit = 10) => {
    const { data, error } = await supabase.from('BinhLuan').select('*').eq('congViecId', id).order('taoLuc', { ascending: false });
    if (error) throw error;
    return { data: data || [], meta: { page, limit, total: data?.length || 0 } };
  },
  addBinhLuan: async (token: string, id: string, input: any) => {
    const { userId } = parseToken(token);
    input.congViecId = id;
    if (!input.userId) input.userId = userId || null;
    input.taoLuc = new Date().toISOString();
    input.capNhatLuc = new Date().toISOString();
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
