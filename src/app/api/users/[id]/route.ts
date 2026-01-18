import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';

// PATCH /api/users/{id} - 사용자 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    mockUsers[index] = { ...mockUsers[index], ...body };
    return NextResponse.json(mockUsers[index]);
  } catch {
    return NextResponse.json(
      { error: '사용자 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/{id} - 사용자 삭제
export async function DELETE(
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

    mockUsers.splice(index, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: '사용자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
