import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCongViec, listCongViec, transitionCongViec } from './api';
import type { TaoCongViec } from '@erp/contracts';

export function useCongViecList(userId: string, scope: string, search: string) {
  return useQuery({ queryKey: ['cong-viec', userId, scope, search], queryFn: () => { const params = new URLSearchParams({ scope, page: '1', limit: '50', sort: 'hetHan' }); if (search) params.set('q', search); return listCongViec(userId, params); } });
}
export function useCreateCongViec(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: TaoCongViec) => createCongViec(userId, input), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cong-viec'] }) });
}
export function useTransitionCongViec(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, trangThai, lyDo }: { id: string; trangThai: string; lyDo?: string }) => transitionCongViec(userId, id, trangThai, lyDo), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cong-viec'] }) });
}
