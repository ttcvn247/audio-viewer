"use client";

import { useState } from "react";

export default function PasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ text: "", type: "" });
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "Mật khẩu xác nhận không khớp.", type: "error" });
      return;
    }
    setLoadingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ text: "Đổi mật khẩu thành công!", type: "success" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setPasswordMessage({ text: data.message || "Lỗi khi đổi mật khẩu.", type: "error" });
      }
    } catch (error) {
      setPasswordMessage({ text: "Không thể kết nối máy chủ.", type: "error" });
    }
    setLoadingPassword(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        <div className="bg-blue-900 px-4 py-3 flex justify-between items-center text-white">
          <h3 className="font-normal text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Đổi Mật Khẩu
          </h3>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-normal mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-normal mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-normal mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500 text-sm"
                required
              />
            </div>

            {passwordMessage.text && (
              <div className={`p-2 rounded text-xs font-medium ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {passwordMessage.text}
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
                disabled={loadingPassword}
                className="bg-blue-900 hover:bg-blue-950 text-white font-medium py-2 px-4 rounded shadow focus:outline-none disabled:opacity-50 text-sm transition-colors cursor-pointer"
              >
                {loadingPassword ? "Đang xử lý..." : "Xác nhận đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
