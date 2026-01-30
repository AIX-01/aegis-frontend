import { useQuery } from '@tanstack/react-query';
import { camerasApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

// 카메라 목록 조회 (페이지네이션, SSE 캐시 무효화 연동)
export const useStreams = (page = 0, size = 9) => {
  return useQuery({
    queryKey: queryKeys.cameras.page(page, size),
    queryFn: () => camerasApi.getAll(page, size),
  });
};


