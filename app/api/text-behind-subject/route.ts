import { NextRequest, NextResponse } from 'next/server';

// 使用 Redis 或其他数据库来存储使用次数
let monthlyUsage = 0;
let lastResetDate = new Date();

export async function POST(req: NextRequest) {
  try {
    // 检查是否需要重置计数器（每月1号重置）
    const now = new Date();
    if (now.getMonth() !== lastResetDate.getMonth()) {
      monthlyUsage = 0;
      lastResetDate = now;
    }

    // 检查使用次数
    if (monthlyUsage >= 50) {
      return NextResponse.json({
        error: '已达到本月免费使用次数限制',
        message: '您可以：\n1. 等待下月重置\n2. 使用自己的 API Key\n3. 升级到付费版本',
        link: 'https://www.remove.bg/pricing'
      }, { status: 429 });
    }

    const formData = await req.formData();
    const image = formData.get('image') as File;
    const apiKey = formData.get('api_key') as string;

    if (!image) {
      return NextResponse.json({ error: '未找到图片' }, { status: 400 });
    }

    try {
      const apiFormData = new FormData();
      apiFormData.append('image_file', image);
      apiFormData.append('size', 'regular');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey || process.env.REMOVE_BG_API_KEY || '',
        },
        body: apiFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 402) {
          return NextResponse.json({
            error: 'API 使用次数已达上限',
            message: '建议：\n1. 使用自己的 API Key\n2. 升级到付费版本以获得更多次数',
            link: 'https://www.remove.bg/pricing'
          }, { status: 402 });
        }
        throw new Error(errorData.message || '处理图片时出错');
      }

      // 增加使用次数
      monthlyUsage++;

      const resultBuffer = await response.arrayBuffer();
      return new NextResponse(resultBuffer, {
        headers: {
          'Content-Type': 'image/png',
        },
      });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ 
        error: '处理图片时出错: ' + (error as Error).message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: '处理图片时出错' }, { status: 500 });
  }
}