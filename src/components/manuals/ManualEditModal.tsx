'use client';

import React, { useState, useEffect } from 'react';
import type { Manual } from '@/types';
import { manualsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

interface ManualEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manual?: Manual;
  onSuccess: () => void;
  onDelete?: (id: string) => void;
}

export function ManualEditModal({
  open,
  onOpenChange,
  manual,
  onSuccess,
  onDelete,
}: ManualEditModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 상태
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  // 초기값 설정
  useEffect(() => {
    if (manual) {
      setName(manual.name);
      setContent(manual.content);
    } else {
      setName('');
      setContent('');
    }
  }, [manual, open]);

  // 저장
  const handleSubmit = async () => {
    if (!name.trim() || !content.trim()) {
      toast({
        title: '입력 오류',
        description: '이름과 내용은 필수입니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (manual) {
        await manualsApi.update(manual.id, {
          name: name.trim(),
          content: content.trim(),
        });
        toast({ title: '수정 완료', description: '매뉴얼이 수정되었습니다.' });
      } else {
        await manualsApi.create({
          name: name.trim(),
          content: content.trim(),
        });
        toast({ title: '생성 완료', description: '매뉴얼이 생성되었습니다.' });
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: '오류',
        description: manual ? '매뉴얼 수정에 실패했습니다.' : '매뉴얼 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 삭제
  const handleDelete = () => {
    if (manual && onDelete) {
      onDelete(manual.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{manual ? '매뉴얼 수정' : '새 매뉴얼'}</DialogTitle>
          <DialogDescription>
            AI Agent가 참조할 대응 매뉴얼을 작성합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="폭행 대응 매뉴얼"
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`1. 현장 확인 및 상황 파악
2. 피해자 안전 확보
3. 112 신고
4. CCTV 영상 확보
...`}
              className="min-h-[300px]"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {manual && onDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

