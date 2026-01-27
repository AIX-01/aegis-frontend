// Query Keys (SSE 캐시 무효화 연동)
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

