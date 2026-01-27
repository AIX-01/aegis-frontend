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

// 새로운 queryKeys (SSE 연동용)
export const queryKeys = {
  cameras: {
    all: ['cameras'] as const,
    managed: ['cameras', 'managed'] as const,
    detail: (id: string) => ['cameras', id] as const,
  },
  events: {
    all: ['events'] as const,
    detail: (id: string) => ['events', id] as const,
  },
  users: {
    all: ['users'] as const,
    pending: ['users', 'pending'] as const,
    detail: (id: string) => ['users', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unreadCount: ['notifications', 'unreadCount'] as const,
    detail: (id: string) => ['notifications', id] as const,
  },
} as const;

