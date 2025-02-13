import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 这里可以添加更多的健康检查逻辑
    // 例如：检查数据库连接、检查外部服务等

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 