import { useQuery } from '@tanstack/react-query';
import { camerasApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

// 카메라 목록 조회 (SSE 캐시 무효화 연동)
export const useStreams = () => {
  return useQuery({
    queryKey: queryKeys.cameras.all,
    queryFn: camerasApi.getAll,
  });
};


