import { NextRequest, NextResponse } from 'next/server';
import { mockUsers, mockPasswords, generateAccessToken, generateRefreshToken } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { error: '등록되지 않은 이메일입니다.' },
        { status: 401 }
      );
    }

    if (mockPasswords[user.email] !== password) {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    if (!user.approved) {
      return NextResponse.json(
        { error: '관리자 승인 대기 중입니다.' },
        { status: 403 }
      );
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const response = NextResponse.json({
      accessToken,
      user,
    });

    // Refresh Token을 httpOnly 쿠키로 설정
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7일
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
