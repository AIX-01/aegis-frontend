export const QUERY_KEYS = {
  STREAMS: {
    ALL: ['streams'] as const,
    DETAIL: (id: string) => ['streams', id] as const,
  },
  EVENT_LOGS: {
    ALL: ['eventLogs'] as const,
    DETAIL: (id: string) => ['eventLogs', id] as const,
    FILTER: (filter: Record<string, unknown>) => ['eventLogs', filter] as const,
  },
  STATS: {
    ALL: ['stats'] as const,
    DAILY: ['stats', 'daily'] as const,
    MONTHLY: ['stats', 'monthly'] as const,
    SUMMARY: ['stats', 'summary'] as const,
  },
} as const;
