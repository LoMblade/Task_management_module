import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { congViecApi, danhMucApi } from './api';
import { useAuth } from './auth';

export function useCongViecList(filters: URLSearchParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['cong-viec', filters.toString()],
    queryFn: () => congViecApi.list(token, filters),
  });
}

export function useCongViec(id: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['cong-viec', id],
    queryFn: () => congViecApi.get(token, id!),
    enabled: !!id,
  });
}

export function useCreateCongViec() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => congViecApi.create(token, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cong-viec'] }),
  });
}

export function useUpdateCongViec() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => congViecApi.update(token, id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cong-viec', id] });
      queryClient.invalidateQueries({ queryKey: ['cong-viec'] });
    },
  });
}

export function useTransitionCongViec() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => congViecApi.transition(token, id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cong-viec', id] });
      queryClient.invalidateQueries({ queryKey: ['cong-viec'] });
    },
  });
}

export function useDeleteCongViec() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => congViecApi.remove(token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cong-viec'] }),
  });
}

export function useLichSu(congViecId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['cong-viec-lich-su', congViecId],
    queryFn: () => congViecApi.getHistory(token, congViecId!),
    enabled: !!congViecId,
  });
}

export function useViecCon(congViecId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['cong-viec-viec-con', congViecId],
    queryFn: () => congViecApi.listViecCon(token, congViecId!),
    enabled: !!congViecId,
  });
}

export function useAddViecCon() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => congViecApi.addViecCon(token, id, input),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['cong-viec-viec-con', id] }),
  });
}

export function useUpdateViecCon() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ congViecId, viecConId, input }: { congViecId: string; viecConId: string; input: any }) => congViecApi.updateViecCon(token, congViecId, viecConId, input),
    onSuccess: (_, { congViecId }) => queryClient.invalidateQueries({ queryKey: ['cong-viec-viec-con', congViecId] }),
  });
}

export function useDeleteViecCon() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ congViecId, viecConId }: { congViecId: string; viecConId: string }) => congViecApi.deleteViecCon(token, congViecId, viecConId),
    onSuccess: (_, { congViecId }) => queryClient.invalidateQueries({ queryKey: ['cong-viec-viec-con', congViecId] }),
  });
}

export function useBinhLuan(congViecId: string | null, page = 1, limit = 10) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['cong-viec-binh-luan', congViecId, page, limit],
    queryFn: () => congViecApi.listBinhLuan(token, congViecId!, page, limit),
    enabled: !!congViecId,
  });
}

export function useAddBinhLuan() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => congViecApi.addBinhLuan(token, id, input),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['cong-viec-binh-luan', id] }),
  });
}

export function useNhanVien() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['nhan-vien'],
    queryFn: () => danhMucApi.listNhanVien(token),
  });
}

export function useDuAn() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['du-an'],
    queryFn: () => danhMucApi.listDuAn(token),
  });
}
