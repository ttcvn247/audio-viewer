"use client";

import { useState, useEffect } from "react";

export default function ConfigModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [audioDir, setAudioDir] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [appName, setAppName] = useState("Avaya Viewer");
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState({ text: "", type: "" });
  const [licenseExpiresAt, setLicenseExpiresAt] = useState("");
  const [daysLeft, setDaysLeft] = useState(0);
  const [renewalKey, setRenewalKey] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewMessage, setRenewMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (isOpen) {
      setConfigMessage({ text: "", type: "" });
      setRenewMessage({ text: "", type: "" });
      setRenewalKey("");
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.AUDIO_DIRECTORY) setAudioDir(data.AUDIO_DIRECTORY);
          if (data.ADMIN_PHONE) setAdminPhone(data.ADMIN_PHONE);
          if (data.ADMIN_EMAIL) setAdminEmail(data.ADMIN_EMAIL);
          if (data.APP_NAME) setAppName(data.APP_NAME);
        })
        .catch((err) => console.error(err));

      fetch("/api/license/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.expiresAt) setLicenseExpiresAt(data.expiresAt);
          if (typeof data.daysRemaining === "number") setDaysLeft(data.daysRemaining);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleRenewKey = async () => {
    if (!renewalKey.trim()) return;
    setRenewing(true);
    setRenewMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: renewalKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRenewMessage({ text: data.error || "Mã không hợp lệ.", type: "error" });
      } else {
        setRenewMessage({ text: data.message || "Gia hạn thành công!", type: "success" });
        setRenewalKey("");
        if (data.newExpiresAt) setLicenseExpiresAt(data.newExpiresAt);
        // Refresh status
        fetch("/api/license/status")
          .then((res) => res.json())
          .then((d) => {
            if (d.expiresAt) setLicenseExpiresAt(d.expiresAt);
            if (typeof d.daysRemaining === "number") setDaysLeft(d.daysRemaining);
          });
      }
    } catch (err) {
      setRenewMessage({ text: "Lỗi kết nối máy chủ.", type: "error" });
    }
    setRenewing(false);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingConfig(true);
    setConfigMessage({ text: "", type: "" });
    try {
      // Save all settings in parallel
      const keysToSave = [
        { key: "AUDIO_DIRECTORY", value: audioDir },
        { key: "ADMIN_PHONE", value: adminPhone },
        { key: "ADMIN_EMAIL", value: adminEmail },
        { key: "APP_NAME", value: appName },
      ];
      
      let hasError = false;
      for (const item of keysToSave) {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!res.ok) hasError = true;
      }

      if (!hasError) {
        setConfigMessage({ text: "Lưu cấu hình thành công! Đang làm mới giao diện...", type: "success" });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setConfigMessage({ text: "Có lỗi xảy ra khi lưu.", type: "error" });
      }
    } catch (error) {
      setConfigMessage({ text: "Không thể kết nối máy chủ.", type: "error" });
    }
    setLoadingConfig(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden animate-fade-in-up">
        <div className="bg-blue-900 px-4 py-3 flex justify-between items-center text-white">
          <h3 className="font-normal text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Cài đặt Hệ thống
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-normal mb-1">
                Đường dẫn thư mục ghi âm
              </label>
              <input
                type="text"
                value={audioDir}
                onChange={(e) => setAudioDir(e.target.value)}
                placeholder="Ví dụ: C:\Recordings hoặc \\172.16.8.10\share"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
                required
              />
              <p className="text-gray-500 text-xs mt-1">Local path hoặc Network path (chia sẻ mạng)</p>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-2">
              <label className="block text-gray-700 text-sm font-normal mb-1">
                Tên hiển thị phần mềm
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Ví dụ: Avaya Viewer"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
                required
              />
            </div>

            <div className="border-t border-gray-200 pt-4 mt-2">
              <label className="block text-gray-700 text-sm font-normal mb-1 whitespace-nowrap">
                Thông tin Liên hệ Quản trị viên (Hiển thị khi Quên mật khẩu)
              </label>
              <div className="flex gap-3 mt-2">
                <div className="w-48 shrink-0">
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="Số điện thoại"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Địa chỉ Email"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin bản quyền & Hạn dùng */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-gray-700 text-sm font-semibold whitespace-nowrap">
                  Bản quyền & Hạn sử dụng
                </span>
                {licenseExpiresAt && (
                  <span className="text-xs font-normal text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 whitespace-nowrap shrink-0">
                    Hạn đến: {new Date(licenseExpiresAt).toLocaleDateString('vi-VN')} ({daysLeft} ngày)
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={renewalKey}
                  onChange={(e) => setRenewalKey(e.target.value.trim())}
                  placeholder="Dán mã kích hoạt gia hạn tại đây..."
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleRenewKey}
                  disabled={renewing || !renewalKey.trim()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-4 py-2 rounded font-medium disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {renewing ? "Đang nạp..." : "Nạp mã"}
                </button>
              </div>
              {renewMessage.text && (
                <p className={`text-xs mt-1.5 font-medium ${renewMessage.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
                  {renewMessage.text}
                </p>
              )}
            </div>
            
            {configMessage.text && (
              <div className={`p-2 rounded text-xs font-medium ${configMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {configMessage.text}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loadingConfig}
                className="bg-blue-900 hover:bg-blue-950 text-white font-medium py-2 px-4 rounded shadow focus:outline-none disabled:opacity-50 text-sm transition-colors cursor-pointer"
              >
                {loadingConfig ? "Đang lưu..." : "Lưu Cài Đặt"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
