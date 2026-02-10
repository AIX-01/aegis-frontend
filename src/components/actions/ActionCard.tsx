'use client';

import React from 'react';
import type { Action } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Code, Zap } from 'lucide-react';

interface ActionCardProps {
  action: Action;
  onToggleEnabled: () => void;
  onClick: () => void;
}

export function ActionCard({ action, onToggleEnabled, onClick }: ActionCardProps) {
  // 파라미터 개수
  const paramCount = action.parameters ? Object.keys(action.parameters).length : 0;

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* 좌측: 아이콘 + 정보 */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className={`p-2 rounded-lg ${action.enabled ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-muted'}`}>
                <Zap className={`h-5 w-5 ${action.enabled ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{action.name}</h3>
                {paramCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {paramCount}개 파라미터
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {action.description}
              </p>
            </div>
          </div>

          {/* 우측: 토글 스위치 */}
          <div
            className="flex items-center gap-3 ml-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              checked={action.enabled}
              onCheckedChange={onToggleEnabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

