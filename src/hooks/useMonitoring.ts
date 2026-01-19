import { useQuery } from '@tanstack/react-query';
import { camerasApi, eventsApi, aiResponsesApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/queryKeys';
import type { ManagedCamera } from '@/types';

export const useStreams = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STREAMS.ALL,
    queryFn: async () => {
      const data = await camerasApi.getAll();
      // Transform to ManagedCamera format
      // name: 미디어서버에서 오는 카메라 이름 (수정 불가)
      // connected: 물리적 연결 상태 (Online/Offline)
      // alias: 사용자 설정 별칭 (수정 가능)
      // active: ON/OFF 상태 (사용자 제어)
      return data.map((cam: any) => ({
        id: cam.id,
        name: cam.name,
        connected: cam.connected ?? true,
        alias: cam.alias ?? cam.name,
        active: cam.active ?? true,
      })) as ManagedCamera[];
    },
  });
};

export const useEventLogs = () => {
  return useQuery({
    queryKey: QUERY_KEYS.EVENT_LOGS.ALL,
    queryFn: eventsApi.getAll,
  });
};

export const useAIResponses = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AI_RESPONSES.ALL,
    queryFn: aiResponsesApi.getAll,
  });
};
