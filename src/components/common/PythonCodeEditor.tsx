'use client';

import React, { useState, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PythonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  height?: string;
  label?: string;
  required?: boolean;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
}

export function PythonCodeEditor({
  value,
  onChange,
  className,
  height = '340px',
  label,
  required,
}: PythonCodeEditorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const pyodideRef = useRef<any>(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);

  // Pyodide 로드 (검사 버튼 클릭 시 lazy load)
  const loadPyodide = async () => {
    if (pyodideRef.current) return pyodideRef.current;

    setPyodideLoading(true);
    try {
      // CDN에서 Pyodide 스크립트 동적 로드
      if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Pyodide 스크립트 로드 실패'));
          document.head.appendChild(script);
        });
      }

      const pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
      });
      pyodideRef.current = pyodide;
      return pyodide;
    } catch (error) {
      console.error('Pyodide 로드 실패:', error);
      throw error;
    } finally {
      setPyodideLoading(false);
    }
  };

  // Python 문법 검사 (ast.parse 사용, 실행하지 않음)
  const validatePythonSyntax = async () => {
    if (!value.trim()) {
      setValidationResult({ valid: false, error: '코드를 입력해주세요.' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const pyodide = await loadPyodide();

      // ast.parse로 문법만 검사 (실행하지 않음)
      const result = await pyodide.runPythonAsync(`
import ast
import json

code = ${JSON.stringify(value)}

try:
    ast.parse(code)
    result = {"valid": True}
except SyntaxError as e:
    result = {
        "valid": False,
        "error": str(e.msg) if e.msg else "구문 오류",
        "line": e.lineno
    }

json.dumps(result)
      `);

      const parsed = JSON.parse(result);
      setValidationResult(parsed);
    } catch (error) {
      setValidationResult({
        valid: false,
        error: error instanceof Error ? error.message : '검사 중 오류 발생',
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Monaco Editor 설정
  const handleEditorMount: OnMount = (editor, monaco) => {
    // Python 테마 설정
    monaco.editor.defineTheme('python-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
      },
    });
    monaco.editor.setTheme('python-dark');
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* 라벨, 검사 결과, 문법 검사 버튼 */}
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-sm font-medium">
            {label} {required && <span className="text-destructive">*</span>}
          </span>
        )}
        <div className="flex items-center gap-3 ml-auto">
          {validationResult && (
            <div
              className={cn(
                'flex items-center gap-2 text-sm',
                validationResult.valid ? 'text-success' : 'text-destructive'
              )}
            >
              {validationResult.valid ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>문법 검사 통과</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>
                    {validationResult.line
                      ? `${validationResult.line}행: ${validationResult.error}`
                      : validationResult.error}
                  </span>
                </>
              )}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={validatePythonSyntax}
            disabled={isValidating || pyodideLoading}
          >
            {isValidating || pyodideLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {pyodideLoading ? 'Python 로딩...' : '검사 중...'}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                문법 검사
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Python 코드 에디터 */}
      <div className="border rounded-lg overflow-hidden">
        <Editor
          height={height}
          language="python"
          value={value}
          onChange={(v) => onChange(v || '')}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            padding: { top: 8, bottom: 8 },
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-muted/30">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        />
      </div>
    </div>
  );
}

