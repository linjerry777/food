import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV,
      },
      message: '系統運行正常',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '系統檢查失敗',
      },
      { status: 500 }
    );
  }
}
