import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';

// PATCH /api/users/{id}/approve - 사용자 승인
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    mockUsers[index] = { ...mockUsers[index], approved: true };
    return NextResponse.json(mockUsers[index]);
  } catch {
    return NextResponse.json(
      { error: '사용자 승인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
