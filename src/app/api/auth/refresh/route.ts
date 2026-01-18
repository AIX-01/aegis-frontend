import { NextRequest, NextResponse } from 'next/server';
import { validateRefreshToken, generateAccessToken, mockUsers } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token이 없습니다.' },
        { status: 401 }
      );
    }

    const userId = validateRefreshToken(refreshToken);

    if (!userId) {
      return NextResponse.json(
        { error: '유효하지 않은 refresh token입니다.' },
        { status: 401 }
      );
    }

    const user = mockUsers.find(u => u.id === userId);

    if (!user || !user.approved) {
      return NextResponse.json(
        { error: '유효하지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const accessToken = generateAccessToken(userId);

    return NextResponse.json({ accessToken });
  } catch {
    return NextResponse.json(
      { error: '토큰 갱신 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
