import { NextRequest, NextResponse } from 'next/server';
import { mockDailyStats, mockEventTypeStats, mockMonthlyEventData, mockSummaryStats } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  switch (type) {
    case 'daily':
      return NextResponse.json(mockDailyStats);
    case 'event-types':
      return NextResponse.json(mockEventTypeStats);
    case 'monthly':
      return NextResponse.json(mockMonthlyEventData);
    case 'summary':
      return NextResponse.json(mockSummaryStats);
    default:
      return NextResponse.json({
        daily: mockDailyStats,
        eventTypes: mockEventTypeStats,
        monthly: mockMonthlyEventData,
        summary: mockSummaryStats,
      });
  }
}
