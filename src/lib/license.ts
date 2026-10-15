import crypto from 'crypto';
import db from './db';

// Khóa công khai Ed25519 dùng để xác thực chữ ký (chỉ kiểm tra, hoàn toàn không thể dùng để tạo mã)
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEALnA4dEV3k1th+xkNo1lNRqIKK/etTG2VFC+lpYFNCbA=
-----END PUBLIC KEY-----`;

/**
 * Kiểm tra tính hợp lệ của mã kích hoạt bằng Khóa công khai Ed25519
 * Định dạng mã: ACT-<days>-<nonce>.<signature_base64url>
 */
export function verifyLicenseKey(rawKey: string): { valid: boolean; days?: number; error?: string; cleanKey?: string } {
  if (!rawKey || typeof rawKey !== 'string') {
    return { valid: false, error: 'Mã kích hoạt không được để trống.' };
  }

  const cleanKey = rawKey.trim();
  const dotIndex = cleanKey.indexOf('.');

  if (dotIndex === -1) {
    return { valid: false, error: 'Định dạng mã kích hoạt không hợp lệ.' };
  }

  const payload = cleanKey.substring(0, dotIndex);
  const signatureBase64 = cleanKey.substring(dotIndex + 1);

  const parts = payload.split('-');
  if (parts.length !== 3 || parts[0] !== 'ACT') {
    return { valid: false, error: 'Tiền tố mã kích hoạt không đúng chuẩn (Ví dụ: ACT-30-XXXXXXXX.chữ_ký).' };
  }

  const days = parseInt(parts[1], 10);
  if (isNaN(days) || days <= 0) {
    return { valid: false, error: 'Số ngày gia hạn trong mã không hợp lệ.' };
  }

  try {
    const signatureBuffer = Buffer.from(signatureBase64, 'base64url');
    const isSignatureValid = crypto.verify(
      null,
      Buffer.from(payload),
      PUBLIC_KEY_PEM,
      signatureBuffer
    );

    if (!isSignatureValid) {
      return { valid: false, error: 'Mã kích hoạt không chính xác hoặc đã bị sửa đổi.' };
    }
  } catch (err) {
    return { valid: false, error: 'Chữ ký số của mã kích hoạt không hợp lệ.' };
  }

  // Kiểm tra xem mã này đã từng được sử dụng trước đây chưa
  const used = db.prepare('SELECT key FROM used_licenses WHERE key = ?').get(cleanKey);
  if (used) {
    return { valid: false, error: 'Mã kích hoạt này đã được sử dụng trước đó. Vui lòng liên hệ để nhận mã mới.' };
  }

  return { valid: true, days, cleanKey };
}

/**
 * Lấy trạng thái bản quyền hiện tại
 */
export function getLicenseStatus() {
  let expiresSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('LICENSE_EXPIRES_AT') as { value: string } | undefined;

  if (!expiresSetting || !expiresSetting.value) {
    const initialExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('LICENSE_EXPIRES_AT', initialExpiry);
    expiresSetting = { value: initialExpiry };
  }

  const expiresTime = new Date(expiresSetting.value).getTime();
  const now = Date.now();
  const isLocked = now > expiresTime;
  const msRemaining = expiresTime - now;
  const daysRemaining = isLocked ? 0 : Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  const phoneSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('ADMIN_PHONE') as { value: string } | undefined;
  const emailSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('ADMIN_EMAIL') as { value: string } | undefined;

  return {
    isLocked,
    expiresAt: expiresSetting.value,
    daysRemaining,
    contactPhone: phoneSetting?.value || '0936658668',
    contactEmail: emailSetting?.value || 'phuongvb@mobifoneservice.com.vn',
  };
}

/**
 * Kích hoạt gia hạn bản quyền bằng mã
 */
export function activateLicenseKey(rawKey: string): { success: boolean; message?: string; error?: string; newExpiresAt?: string; daysAdded?: number } {
  const verification = verifyLicenseKey(rawKey);
  if (!verification.valid || !verification.cleanKey || !verification.days) {
    return { success: false, error: verification.error || 'Mã không hợp lệ.' };
  }

  const { cleanKey, days } = verification;
  const currentStatus = getLicenseStatus();
  
  const currentExpiryTime = new Date(currentStatus.expiresAt).getTime();
  const baseTime = Math.max(Date.now(), isNaN(currentExpiryTime) ? Date.now() : currentExpiryTime);
  const newExpiryDate = new Date(baseTime + days * 24 * 60 * 60 * 1000);
  const newExpiresAt = newExpiryDate.toISOString();

  // Cập nhật Database
  const updateSettings = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const recordUsed = db.prepare('INSERT INTO used_licenses (key, used_at) VALUES (?, ?)');

  const tx = db.transaction(() => {
    updateSettings.run('LICENSE_EXPIRES_AT', newExpiresAt);
    recordUsed.run(cleanKey, new Date().toISOString());
  });

  try {
    tx();
    return {
      success: true,
      message: `Kích hoạt thành công! Đã gia hạn thêm ${days} ngày sử dụng.`,
      newExpiresAt,
      daysAdded: days,
    };
  } catch (err: any) {
    console.error('Activation transaction error:', err);
    return { success: false, error: 'Lỗi hệ thống khi lưu trạng thái kích hoạt.' };
  }
}
