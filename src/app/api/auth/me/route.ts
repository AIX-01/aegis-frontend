import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    // Mock: access_userId_timestamp 형태에서 userId 추출
    const userId = token.split('_')[1];

    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
