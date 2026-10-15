"use client";

import { useState } from "react";

interface LockModalProps {
  isOpen: boolean;
  contactPhone?: string;
  contactEmail?: string;
  onActivated?: () => void;
}

export default function LockModal({
  isOpen,
  contactPhone = "0936658668",
  contactEmail = "phuongvb@mobifoneservice.com.vn",
  onActivated,
}: LockModalProps) {
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setErrorMsg("Vui lòng nhập mã kích hoạt.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: licenseKey.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Mã kích hoạt không chính xác.");
      } else {
        setSuccessMsg(data.message || "Kích hoạt thành công!");
        setTimeout(() => {
          if (onActivated) {
            onActivated();
          } else {
            window.location.reload();
          }
        }, 1500);
      }
    } catch (err) {
      setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md px-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-red-200 animate-fade-in-up">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 py-5 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-black/10 rounded-full blur-xl pointer-events-none" />

          {/* Glowing Lock Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 text-white shadow-inner mb-2 ring-4 ring-white/30 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold tracking-wide uppercase">
            Hệ Thống Đã Hết Hạn Sử Dụng
          </h2>
          <p className="text-xs text-red-100 mt-1 font-light">
            Thời hạn sử dụng của phiên bản này đã kết thúc. Toàn bộ tính năng đã tạm khóa.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Contact Information Box */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">📞</span>
              <div className="text-sm">
                <p className="font-semibold text-amber-900">
                  Vui lòng liên hệ Quản trị viên để nhận mã gia hạn mới:
                </p>
                <div className="mt-2 space-y-1 text-xs text-amber-800">
                  {contactPhone && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">Số điện thoại:</span>
                      <a
                        href={`tel:${contactPhone}`}
                        className="font-bold text-blue-800 hover:underline"
                      >
                        {contactPhone}
                      </a>
                    </div>
                  )}
                  {contactEmail && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">Email:</span>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="font-bold text-blue-800 hover:underline"
                      >
                        {contactEmail}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Activation */}
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label
                htmlFor="licenseInput"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
              >
                Nhập mã kích hoạt (License Key)
              </label>
              <div className="relative">
                <input
                  id="licenseInput"
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.trim())}
                  placeholder="Dán mã kích hoạt tại đây..."
                  className="w-full border-2 border-gray-300 focus:border-red-600 rounded-lg px-3 py-2.5 font-mono text-center tracking-wider text-sm focus:outline-none transition-colors"
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5 text-center">
                Mỗi mã kích hoạt sẽ tự động mở khóa và gia hạn sử dụng thêm 30 ngày.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg text-center font-medium animate-shake">
                {errorMsg}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-3 py-2 rounded-lg text-center font-medium">
                🎉 {successMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  ĐANG XÁC THỰC MÃ...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                  KÍCH HOẠT VÀ MỞ KHÓA
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
