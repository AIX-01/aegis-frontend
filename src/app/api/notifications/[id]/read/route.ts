import { NextRequest, NextResponse } from 'next/server';
import { mockNotifications } from '@/lib/mock-data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const notification = mockNotifications.find(n => n.id === id);

    if (!notification) {
      return NextResponse.json(
        { error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    notification.read = true;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: '알림 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
