"use client";

import { useState, useEffect } from "react";

export default function ForgotModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/settings/public")
        .then((res) => res.json())
        .then((data) => {
          setPhone(data.ADMIN_PHONE || "");
          setEmail(data.ADMIN_EMAIL || "");
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        <div className="bg-blue-900 px-4 py-3 flex justify-between items-center text-white">
          <h3 className="font-normal text-lg">Quên mật khẩu?</h3>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-900">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Vui lòng liên hệ với Quản trị viên hệ thống để được cấp lại mật khẩu.
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-left">
            <p className="text-xs font-normal text-gray-500 mb-1">Thông tin liên hệ:</p>
            {phone && <p className="text-sm font-medium text-blue-900">📞 {phone}</p>}
            {email && <p className="text-sm font-medium text-blue-900 mt-1">✉️ {email}</p>}
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-blue-900 hover:bg-blue-950 text-white font-medium py-2 rounded focus:outline-none transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
