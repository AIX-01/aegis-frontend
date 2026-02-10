// Query Keys (SSE 캐시 무효화 연동)
export const queryKeys = {
  cameras: {
    all: ['cameras'] as const,
    page: (page: number, size: number) => ['cameras', { page, size }] as const,
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
    detail: (id: string) => ['notifications', id] as const,
  },
  stats: {
    daily: ['stats', 'daily'] as const,
    eventTypes: ['stats', 'eventTypes'] as const,
    monthly: ['stats', 'monthly'] as const,
  },
  actions: {
    all: ['actions'] as const,
    page: (page: number, size: number) => ['actions', { page, size }] as const,
    detail: (id: string) => ['actions', id] as const,
  },
  manuals: {
    all: ['manuals'] as const,
    page: (page: number, size: number) => ['manuals', { page, size }] as const,
    detail: (id: string) => ['manuals', id] as const,
  },
} as const;

