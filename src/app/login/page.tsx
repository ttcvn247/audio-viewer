import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-sm w-full bg-white p-8 rounded shadow-sm border border-gray-200">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-blue-900 rounded-2xl shadow-lg flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-normal text-gray-800 mb-2 tracking-tight">Chào mừng trở lại</h1>
        <p className="text-sm text-gray-500 font-medium">Vui lòng đăng nhập để tiếp tục hệ thống.</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
