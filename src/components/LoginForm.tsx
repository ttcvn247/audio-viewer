"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import ForgotModal from "./ForgotModal";
import LockModal from "./LockModal";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isReadOnlyEmail, setIsReadOnlyEmail] = useState(true);
  const [isReadOnlyPassword, setIsReadOnlyPassword] = useState(true);
  const [isLicenseLocked, setIsLicenseLocked] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState<{ contactPhone?: string; contactEmail?: string }>({});
  const router = useRouter();

  useEffect(() => {
    fetch('/api/license/status')
      .then(res => res.json())
      .then(data => {
        if (data.isLocked) {
          setIsLicenseLocked(true);
        }
        setLicenseInfo({
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
        });
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        rememberMe: rememberMe ? "true" : "false",
      });

      if (res?.error) {
        setError("Email hoặc mật khẩu không chính xác");
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="w-full flex flex-col items-center mt-6">
      {/* Trick to prevent aggressive browser autofill */}
      <input type="email" style={{ opacity: 0, position: 'absolute', zIndex: -1, top: -9999 }} autoComplete="off" tabIndex={-1} aria-hidden="true" />
      <input type="password" style={{ opacity: 0, position: 'absolute', zIndex: -1, top: -9999 }} autoComplete="new-password" tabIndex={-1} aria-hidden="true" />
      
      {/* Email Input */}
      <div className="w-full mb-4">
        <label className="block text-xs text-gray-500 mb-1" htmlFor="email">
          Email / Tên đăng nhập
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setIsReadOnlyEmail(false)}
          readOnly={isReadOnlyEmail}
          className="w-full border-b border-gray-300 py-1 focus:outline-none focus:border-blue-900 text-sm"
          autoComplete="new-password"
          required
        />
      </div>

      {/* Password Input */}
      <div className="w-full mb-6 relative">
        <label className="block text-xs text-gray-500 mb-1" htmlFor="password">
          Mật khẩu
        </label>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setIsReadOnlyPassword(false)}
          readOnly={isReadOnlyPassword}
          className="w-full border-b border-gray-300 py-1 focus:outline-none focus:border-blue-900 text-sm pr-8"
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 bottom-2 text-gray-400 focus:outline-none cursor-pointer"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Options */}
      <div className="w-full flex items-center justify-between mb-8">
        <label className="flex items-center text-xs text-gray-600 cursor-pointer">
          <input 
            type="checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2 rounded text-blue-900 focus:ring-blue-900 border-gray-300 cursor-pointer" 
          />
          Duy trì đăng nhập
        </label>
        <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs text-blue-900 hover:underline font-medium cursor-pointer bg-transparent border-none p-0">
          QUÊN MẬT KHẨU?
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="w-full text-red-500 text-xs mb-4 text-center">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-medium py-2 rounded focus:outline-none transition-colors disabled:bg-blue-700 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ĐANG ĐĂNG NHẬP...
          </>
        ) : (
          <>
            ĐĂNG NHẬP
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </>
        )}
      </button>

      <ForgotModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
      <LockModal 
        isOpen={isLicenseLocked} 
        contactPhone={licenseInfo.contactPhone} 
        contactEmail={licenseInfo.contactEmail} 
        onActivated={() => window.location.reload()} 
      />
    </form>
  );
}
