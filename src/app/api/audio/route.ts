import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import db from '@/lib/db';
import { getLicenseStatus } from '@/lib/license';

export async function GET(request: NextRequest) {
  const license = getLicenseStatus();
  if (license.isLocked) {
    return new NextResponse('Hệ thống đã hết hạn sử dụng. Vui lòng liên hệ quản trị viên để kích hoạt.', { status: 423 });
  }

  const searchParams = request.nextUrl.searchParams;
  const filename = searchParams.get('filename');

  if (!filename) {
    return new NextResponse('Filename is required', { status: 400 });
  }

  // Prevent directory traversal attacks
  if (filename.includes('..') || filename.includes('/\\')) {
    return new NextResponse('Invalid filename', { status: 400 });
  }

  // Lấy thư mục âm thanh từ SQLite
  const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('AUDIO_DIRECTORY') as { value: string } | undefined;
  const audioDir = setting?.value || './public/mock_records';
  
  let filePath = path.join(audioDir, filename);

  // If filename format is standard (e.g. 0228383474_18006588_184_20260608101844_85101.wav), reconstruct folder path
  const basename = filename.substring(0, filename.length - 4);
  const parts = basename.split('_');
  if (parts.length === 5) {
    const timestamp = parts[3]; // 20260608101844
    if (timestamp && timestamp.length >= 8) {
      const yyyy = timestamp.substring(0, 4);
      const mm = timestamp.substring(4, 6);
      const dd = timestamp.substring(6, 8);
      const folderPath = path.join(audioDir, yyyy, mm, dd);
      const candidatePath = path.join(folderPath, filename);
      if (fs.existsSync(candidatePath)) {
        filePath = candidatePath;
      }
    }
  }

  console.log(`[Audio API] Request for file: ${filename}, Range: ${request.headers.get('range')}`);
  console.log(`[Audio API] Resolved path: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`[Audio API] File not found: ${filePath}`);
    return new NextResponse('File not found', { status: 404 });
  }

  // Transcode to MP3 in temp folder if it doesn't exist
  const tmpPath = path.join(os.tmpdir(), `${filename}.mp3`);
  if (!fs.existsSync(tmpPath)) {
    console.log(`[Audio API] Transcoding ${filename} to MP3...`);
    
    // Fix Next.js Webpack path resolution bug for ffmpeg-static
    let ffmpegPath = ffmpeg as string;
    if (ffmpegPath.startsWith('\\ROOT') || ffmpegPath.startsWith('/ROOT')) {
      ffmpegPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
    } else if (!fs.existsSync(ffmpegPath)) {
      ffmpegPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
    }

    try {
      await new Promise((resolve, reject) => {
        const ff = spawn(ffmpegPath, ['-i', filePath, '-y', '-f', 'mp3', tmpPath]);
        
        ff.stderr.on('data', (data) => {
          // ffmpeg logs to stderr
          // console.log(`ffmpeg: ${data}`);
        });

        ff.on('close', (code) => {
          if (code === 0) resolve(true);
          else reject(new Error(`ffmpeg exited with code ${code}`));
        });
      });
      console.log(`[Audio API] Transcode complete: ${tmpPath}`);
    } catch (e) {
      console.error(`[Audio API] Transcode failed:`, e);
      return new NextResponse('Error transcoding audio', { status: 500 });
    }
  }

  // Now serve the MP3 file instead of the WAV file
  const servePath = tmpPath;
  const stat = fs.statSync(servePath);
  const fileSize = stat.size;
  const range = request.headers.get('range');

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    
    const fileStream = fs.createReadStream(servePath, { start, end });
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk: any) => controller.enqueue(new Uint8Array(chunk)));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err: Error) => controller.error(err));
      }
    });

    console.log(`[Audio API] Sending partial content: ${start}-${end}/${fileSize}`);
    return new NextResponse(webStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'audio/mpeg',
      },
    });
  } else {
    const fileStream = fs.createReadStream(servePath);
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk: any) => controller.enqueue(new Uint8Array(chunk)));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err: Error) => {
          console.error(`[Audio API] Stream error:`, err);
          controller.error(err);
        });
      }
    });

    console.log(`[Audio API] Sending full content: ${fileSize} bytes`);
    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
      },
    });
  }
}
