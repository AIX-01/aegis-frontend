import { NextResponse } from 'next/server';
import { mockCameras } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(mockCameras);
}
