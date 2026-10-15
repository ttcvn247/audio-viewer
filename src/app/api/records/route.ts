import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import db from '@/lib/db';
import { getLicenseStatus } from '@/lib/license';

export const dynamic = 'force-dynamic';

function matchesLike(text: string, pattern: string): boolean {
  if (!pattern) return true;
  // If no wildcard is provided, default to 'contains' (like %pattern%) for user convenience,
  // OR we can check if they explicitly used %.
  // The user asked to support %5%. Let's treat % as .* 
  if (pattern.includes('%')) {
    const escapeRegex = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regexPattern = '^' + pattern.split('%').map(escapeRegex).join('.*') + '$';
    return new RegExp(regexPattern, 'i').test(text);
  }
  // Fallback to simple includes if no % is used
  return text.toLowerCase().includes(pattern.toLowerCase());
}

export async function GET(request: NextRequest) {
  try {
    const license = getLicenseStatus();
    if (license.isLocked) {
      return NextResponse.json({
        error: 'LICENSE_LOCKED',
        message: 'Hệ thống đã hết hạn sử dụng. Vui lòng liên hệ quản trị viên để kích hoạt gia hạn.'
      }, { status: 423 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dateStart = searchParams.get('dateStart') || '';
    const dateEnd = searchParams.get('dateEnd') || '';
    const receiverFilter = searchParams.get('receiver') || '';
    const callerFilter = searchParams.get('caller') || '';
    const agentFilter = searchParams.get('agent') || '';
    const directionFilter = searchParams.get('direction') || '';
    const durationFilter = searchParams.get('duration') || '';

    // If no filters are provided at all (initial load), we can return empty to save bandwidth
    if (!dateStart && !dateEnd && !receiverFilter && !callerFilter && !agentFilter && !directionFilter && !durationFilter) {
       return NextResponse.json({ records: [], debugPath: '' });
    }

    // Lấy thư mục âm thanh từ SQLite
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('AUDIO_DIRECTORY') as { value: string } | undefined;
    const audioDir = setting?.value || './public/mock_records';
    
    // Check if directory exists
    if (!fs.existsSync(audioDir)) {
      return NextResponse.json({ error: 'Directory not found', path: audioDir }, { status: 404 });
    }

    // Generate list of days to scan
    let datesToScan: string[] = [];
    if (dateStart && dateEnd) {
      const current = new Date(dateStart.split(' ')[0]);
      const end = new Date(dateEnd.split(' ')[0]);
      while (current <= end) {
        datesToScan.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    } else if (dateStart) {
      datesToScan.push(dateStart.split(' ')[0]);
    } else if (dateEnd) {
      datesToScan.push(dateEnd.split(' ')[0]);
    } else {
      // Default to today if no dates provided
      datesToScan.push(new Date().toISOString().split('T')[0]);
    }

    let files: string[] = [];
    
    // Read from YYYYMM/YYYY/MM/DD and also fallback to root audioDir for testing
    for (const d of datesToScan) {
      const parts = d.split('-'); // [YYYY, MM, DD]
      const yyyy = parts[0];
      const mm = parts[1];
      const dd = parts[2];
      
      const folderPath = path.join(audioDir, yyyy, mm, dd);
      if (fs.existsSync(folderPath)) {
        const folderFiles = fs.readdirSync(folderPath);
        files = files.concat(folderFiles);
      }
    }
    
    // Fallback: also scan the root folder for testing/mock records if not explicitly empty
    if (fs.existsSync(audioDir) && audioDir.includes('mock_records')) {
       const rootFiles = fs.readdirSync(audioDir);
       files = files.concat(rootFiles);
    }
    
    // Deduplicate files in case of overlap (though unlikely)
    files = [...new Set(files)];
    let records = files
      .filter(file => file.toLowerCase().endsWith('.wav'))
      .map(file => {
        // Example: 0228383474_18006588_184_20260608101844_85101.wav
        // Remove .wav or .WAV
        const basename = file.substring(0, file.length - 4);
        const parts = basename.split('_');
        
        if (parts.length === 5) {
          const [caller, receiver, duration, timestamp, agent] = parts;
          
          // Format timestamp: 20260608101844 -> 2026-06-08 10:18:44
          const year = timestamp.substring(0, 4);
          const month = timestamp.substring(4, 6);
          const day = timestamp.substring(6, 8);
          const hour = timestamp.substring(8, 10);
          const minute = timestamp.substring(10, 12);
          const second = timestamp.substring(12, 14);
          const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
          
          return {
            filename: file,
            caller,
            receiver,
            duration: parseInt(duration, 10) || 0,
            timestamp,
            formattedDate,
            agent,
            // Mock data for unknown columns
            direction: 'Incoming',
            serviceBranch: '0005516(GPS 18001290)'
          };
        }
        
        return null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .filter(r => {
         if (dateStart && r.formattedDate < dateStart) return false;
         if (dateEnd && r.formattedDate > dateEnd) return false;
         if (receiverFilter && !matchesLike(r.receiver, receiverFilter)) return false;
         if (callerFilter && !matchesLike(r.caller, callerFilter)) return false;
         if (agentFilter && !matchesLike(r.agent, agentFilter)) return false;
         if (directionFilter && !matchesLike(r.direction, directionFilter)) return false;
         if (durationFilter && r.duration.toString() !== durationFilter) return false;
         return true;
      });

    // Limit to max 1000 records to prevent browser crash
    if (records.length > 1000) {
      records = records.slice(0, 1000);
    }

    return NextResponse.json({ records, debugPath: audioDir });
  } catch (error: any) {
    console.error('Error reading records:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.toString() }, { status: 500 });
  }
}
