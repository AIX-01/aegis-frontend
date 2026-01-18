import { NextRequest, NextResponse } from 'next/server';
import { removeRefreshToken } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      removeRefreshToken(refreshToken);
    }

    const response = NextResponse.json({ success: true });

    // 쿠키 삭제
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
