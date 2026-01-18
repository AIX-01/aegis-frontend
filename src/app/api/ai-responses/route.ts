import { NextRequest, NextResponse } from 'next/server';
import { mockAIResponses } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  if (eventId) {
    const filtered = mockAIResponses.filter(r => r.eventId === eventId);
    return NextResponse.json(filtered);
  }

  return NextResponse.json(mockAIResponses);
}
