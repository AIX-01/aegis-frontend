'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 외부 서비스로 전송 가능)
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Boundary]', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">문제가 발생했습니다</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            예기치 않은 오류가 발생했습니다. 다시 시도하거나 홈으로 이동해주세요.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
