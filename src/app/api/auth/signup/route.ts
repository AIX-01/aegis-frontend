import { NextRequest, NextResponse } from 'next/server';
import { mockUsers, mockPasswords } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      );
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'user' as const,
      assignedCameras: [],
      createdAt: new Date().toISOString(),
      approved: false,
    };

    mockUsers.push(newUser);
    mockPasswords[email] = password;

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.',
    });
  } catch {
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
