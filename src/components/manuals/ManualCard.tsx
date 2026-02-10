'use client';

import React from 'react';
import type { Manual } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { BookOpen } from 'lucide-react';

interface ManualCardProps {
  manual: Manual;
  onToggleEnabled: () => void;
  onClick: () => void;
}

export function ManualCard({ manual, onToggleEnabled, onClick }: ManualCardProps) {
  // 내용 미리보기 (100자)
  const contentPreview = manual.content.length > 100
    ? manual.content.substring(0, 100) + '...'
    : manual.content;

  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* 좌측: 아이콘 + 정보 */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className={`p-2 rounded-lg ${manual.enabled ? 'bg-blue-100 dark:bg-blue-900' : 'bg-muted'}`}>
                <BookOpen className={`h-5 w-5 ${manual.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{manual.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {contentPreview}
              </p>
            </div>
          </div>

          {/* 우측: 토글 스위치 */}
          <div
            className="flex items-center gap-3 ml-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              checked={manual.enabled}
              onCheckedChange={onToggleEnabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

