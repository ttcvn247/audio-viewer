const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Đường dẫn tới Private Key bí mật (chỉ có trên máy của tác giả)
const PRIVATE_KEY_PATH = path.join(__dirname, '..', 'keys', 'license_private_key.pem');

if (!fs.existsSync(PRIVATE_KEY_PATH)) {
  console.error('\n❌ LỖI BẢO MẬT: Không tìm thấy khóa bí mật (keys/license_private_key.pem).');
  console.error('👉 Chỉ có Tác giả hệ thống (người sở hữu Private Key) mới có quyền sinh mã kích hoạt.\n');
  process.exit(1);
}

const privateKeyPem = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

// Lấy số ngày từ tham số dòng lệnh (mặc định 30 ngày)
const args = process.argv.slice(2);
const days = args[0] && !isNaN(parseInt(args[0], 10)) ? parseInt(args[0], 10) : 30;

function generateKey(durationDays) {
  const nonce = crypto.randomBytes(4).toString('hex').toUpperCase();
  const payload = `ACT-${durationDays}-${nonce}`;
  
  // Ký số Ed25519 bằng Private Key bí mật
  const signature = crypto.sign(null, Buffer.from(payload), privateKeyPem).toString('base64url');
  
  return `${payload}.${signature}`;
}

const key = generateKey(days);
const now = new Date();

console.log('\n========================================================================================');
console.log('             🔑 BỘ TẠO MÃ KÍCH HOẠT HỆ THỐNG (CHUẨN BẤT ĐỐI XỨNG ED25519)');
console.log('========================================================================================');
console.log(`  MÃ KÍCH HOẠT:\n  ${key}`);
console.log('----------------------------------------------------------------------------------------');
console.log(`  THỜI HẠN GIA HẠN:  +${days} ngày`);
console.log(`  THỜI GIAN TẠO:     ${now.toLocaleString('vi-VN')}`);
console.log('----------------------------------------------------------------------------------------');
console.log('  👉 Hướng dẫn: Copy toàn bộ chuỗi mã trên và gửi cho khách hàng.');
console.log('  👉 Khách hàng dán mã vào ô kích hoạt để mở khóa hệ thống.');
console.log('  🔒 BẢO MẬT: Chỉ có máy của bạn có Private Key mới sinh được mã hợp lệ.');
console.log('========================================================================================\n');
