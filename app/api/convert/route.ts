import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import CloudConvert from 'cloudconvert';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 初始化 CloudConvert
const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const format = formData.get('format') as string;

    if (!file || !format) {
      return NextResponse.json({ error: 'File and format are required' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let convertedBuffer;
    if (format === 'pdf') {
      // Convert image to PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      let image;
      if (file.type.startsWith('image/jpeg')) {
        image = await pdfDoc.embedJpg(buffer);
      } else if (file.type.startsWith('image/png')) {
        image = await pdfDoc.embedPng(buffer);
      } else {
        // Convert other image formats to PNG first
        const pngBuffer = await sharp(buffer).png().toBuffer();
        image = await pdfDoc.embedPng(pngBuffer);
      }
      const { width, height } = image.scale(1);
      page.setSize(width, height);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
      });
      convertedBuffer = await pdfDoc.save();
    } else if (file.type === 'application/pdf') {
      try {
        // 创建转换任务
        const job = await cloudConvert.jobs.create({
          tasks: {
            'import-1': {
              operation: 'import/upload'
            },
            'convert-1': {
              operation: 'convert',
              input: 'import-1',
              output_format: format,
              engine: 'graphicsmagick',
              input_format: 'pdf',
              engine_version: '1.3.33',
              filename: 'converted.' + format,
              page_range: '1',
              pixel_density: 300
            },
            'export-1': {
              operation: 'export/url',
              input: 'convert-1'
            }
          }
        });

        // 上传文件
        const uploadTask = job.tasks.filter(task => task.operation === 'import/upload')[0];
        const inputFile = Buffer.from(buffer);
        await cloudConvert.tasks.upload(uploadTask, inputFile, 'document.pdf');

        // 等待任务完成
        const jobResult = await cloudConvert.jobs.wait(job.id);
        
        // 获取导出任务
        const exportTask = jobResult.tasks.filter(task => task.operation === 'export/url')[0];
        const file = exportTask.result.files[0];
        
        // 下载转换后的文件
        const response = await fetch(file.url);
        convertedBuffer = Buffer.from(await response.arrayBuffer());
      } catch (error) {
        console.error('CloudConvert error:', error);
        return NextResponse.json({ 
          error: 'PDF conversion failed. Please try again later.' 
        }, { status: 500 });
      }
    } else {
      // Image to image conversion
      convertedBuffer = await sharp(buffer).toFormat(format as keyof sharp.FormatEnum).toBuffer();
    }

    return new NextResponse(convertedBuffer, {
      status: 200,
      headers: {
        'Content-Type': format === 'pdf' ? 'application/pdf' : `image/${format}`,
        'Content-Disposition': `attachment; filename="converted.${format}"`,
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json({ error: 'Conversion failed: ' + (error as Error).message }, { status: 500 });
  }
}