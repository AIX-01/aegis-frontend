import { NextRequest, NextResponse } from 'next/server';
import { mockDailyStats, mockEventTypeStats, mockMonthlyEventData, mockSummaryStats, mockSystemStatus, mockStorageInfo } from '@/lib/mock-data';

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
    case 'system':
      return NextResponse.json(mockSystemStatus);
    case 'storage':
      return NextResponse.json(mockStorageInfo);
    default:
      return NextResponse.json({
        daily: mockDailyStats,
        eventTypes: mockEventTypeStats,
        monthly: mockMonthlyEventData,
        summary: mockSummaryStats,
        system: mockSystemStatus,
        storage: mockStorageInfo,
      });
  }
}
