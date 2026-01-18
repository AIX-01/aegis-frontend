import { useQuery } from '@tanstack/react-query';
import { camerasApi, eventsApi, aiResponsesApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/queryKeys';
import type { Camera, ManagedCamera } from '@/types';

export const useStreams = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STREAMS.ALL,
    queryFn: async () => {
      const data = await camerasApi.getAll();
      // Transform Camera to ManagedCamera format if needed
      // This logic was previously in CCTVPageContent.tsx
      return data.map((cam: Camera, index: number) => ({
        ...cam,
        ipAddress: `192.168.1.${100 + index}`,
        resolution: '1920x1080',
        active: cam.status !== 'offline',
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
