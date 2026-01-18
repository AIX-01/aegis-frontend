import { NextRequest, NextResponse } from 'next/server';
import { mockUsers, mockPasswords } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(mockUsers);
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const index = mockUsers.findIndex(u => u.id === userId);
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const index = mockUsers.findIndex(u => u.id === userId);
    if (index === -1) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const user = mockUsers[index];
    mockUsers.splice(index, 1);
    delete mockPasswords[user.email];

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: '사용자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
