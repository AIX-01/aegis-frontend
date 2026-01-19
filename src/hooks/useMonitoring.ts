import { useQuery } from '@tanstack/react-query';
import { camerasApi, eventsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/queryKeys';

export const useStreams = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STREAMS.ALL,
    queryFn: camerasApi.getAll,
  });
};

export const useEventLogs = () => {
  return useQuery({
    queryKey: QUERY_KEYS.EVENT_LOGS.ALL,
    queryFn: eventsApi.getAll,
  });
};

