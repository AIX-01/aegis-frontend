'use client';

import React, { useState, useEffect } from 'react';
import type { Action, ActionParameter } from '@/types';
import { actionsApi } from '@/lib/api';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, X } from 'lucide-react';

interface ParameterFormItem {
  name: string;
  type: 'str' | 'int' | 'float' | 'bool';
  description: string;
  defaultValue: string;
}

interface ActionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: Action;
  onSuccess: () => void;
  onDelete?: (id: string) => void;
}

export function ActionEditModal({
  open,
  onOpenChange,
  action,
  onSuccess,
  onDelete,
}: ActionEditModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 상태
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [parameters, setParameters] = useState<ParameterFormItem[]>([]);

  // 초기값 설정
  useEffect(() => {
    if (action) {
      setName(action.name);
      setDescription(action.description);
      setCode(action.code);
      // parameters JSON → 폼 배열 변환
      const formParams = Object.entries(action.parameters || {}).map(([paramName, info]) => ({
        name: paramName,
        type: (info as ActionParameter).type as 'str' | 'int' | 'float' | 'bool',
        description: (info as ActionParameter).description,
        defaultValue: (info as ActionParameter).default_value?.toString() ?? '',
      }));
      setParameters(formParams);
    } else {
      setName('');
      setDescription('');
      setCode('');
      setParameters([]);
    }
  }, [action, open]);

  // 파라미터 추가
  const handleAddParameter = () => {
    setParameters([...parameters, { name: '', type: 'str', description: '', defaultValue: '' }]);
  };

  // 파라미터 삭제
  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  // 파라미터 수정
  const handleUpdateParameter = (index: number, field: keyof ParameterFormItem, value: string) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  // 폼 배열 → JSON 변환
  const buildParametersJson = (): Record<string, ActionParameter> => {
    const result: Record<string, ActionParameter> = {};
    parameters.forEach((p) => {
      if (p.name.trim()) {
        result[p.name.trim()] = {
          type: p.type,
          description: p.description,
          default_value: p.defaultValue.trim() || null,
        };
      }
    });
    return result;
  };

  // 저장
  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !code.trim()) {
      toast({
        title: '입력 오류',
        description: '이름, 설명, 코드는 필수입니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const parametersJson = buildParametersJson();

      if (action) {
        await actionsApi.update(action.id, {
          name: name.trim(),
          description: description.trim(),
          parameters: parametersJson,
          code: code.trim(),
        });
        toast({ title: '수정 완료', description: '액션이 수정되었습니다.' });
      } else {
        await actionsApi.create({
          name: name.trim(),
          description: description.trim(),
          parameters: parametersJson,
          code: code.trim(),
        });
        toast({ title: '생성 완료', description: '액션이 생성되었습니다.' });
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: '오류',
        description: action ? '액션 수정에 실패했습니다.' : '액션 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 삭제
  const handleDelete = () => {
    if (action && onDelete) {
      onDelete(action.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{action ? '액션 수정' : '새 액션'}</DialogTitle>
          <DialogDescription>
            AI Agent가 사용할 Tool을 정의합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 이름 / 설명 - 1:2 비율 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="메일 발송"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">설명 *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이메일 알림 발송"
              />
            </div>
          </div>

          {/* 파라미터 / 코드 - 1:2 비율 */}
          <div className="grid grid-cols-3 gap-4">
            {/* 파라미터 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>파라미터</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddParameter}>
                  <Plus className="h-4 w-4 mr-1" />
                  추가
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                기본값이 비어있으면 LLM이 상황에 맞게 채웁니다.
              </p>

              {parameters.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {parameters.map((param, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          className="flex-1"
                          placeholder="이름"
                          value={param.name}
                          onChange={(e) => handleUpdateParameter(index, 'name', e.target.value)}
                        />
                        <Select
                          value={param.type}
                          onValueChange={(value) => handleUpdateParameter(index, 'type', value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="str">str</SelectItem>
                            <SelectItem value="int">int</SelectItem>
                            <SelectItem value="float">float</SelectItem>
                            <SelectItem value="bool">bool</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveParameter(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="설명"
                        value={param.description}
                        onChange={(e) => handleUpdateParameter(index, 'description', e.target.value)}
                      />
                      <Input
                        placeholder="기본값 (선택)"
                        value={param.defaultValue}
                        onChange={(e) => handleUpdateParameter(index, 'defaultValue', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[100px] border rounded-lg bg-muted/10 text-muted-foreground text-sm">
                  파라미터가 없습니다
                </div>
              )}
            </div>

            {/* 코드 - 2칸 차지 */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="code">Python 코드 *</Label>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`def execute(to_email: str, subject: str, body: str) -> str:
    # 실행 로직
    return "완료"`}
                className="font-mono text-sm min-h-[340px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {action && onDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          )}
          <div className="ml-auto">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

