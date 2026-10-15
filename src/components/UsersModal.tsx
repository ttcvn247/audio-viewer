"use client";

import { useState, useEffect } from "react";

type User = { email: string };

export default function UsersModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMessage({ text: "", type: "" });
      setNewEmail("");
      setNewPassword("");
      fetchUsers();
      
      fetch("/api/settings/public")
        .then((res) => res.json())
        .then((data) => {
          if (data.ADMIN_EMAIL) setAdminEmail(data.ADMIN_EMAIL);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Thêm người dùng thành công!", type: "success" });
        setNewEmail("");
        setNewPassword("");
        fetchUsers();
      } else {
        setMessage({ text: data.message || "Lỗi khi thêm.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Lỗi kết nối.", type: "error" });
    }
    setLoading(false);
  };

  const handleResetPassword = async (email: string) => {
    const newPwd = prompt(`Nhập mật khẩu mới cho tài khoản ${email}:`, "123456");
    if (!newPwd) return;

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Đã đổi mật khẩu thành công!");
      } else {
        alert(data.message || "Lỗi khi đổi mật khẩu.");
      }
    } catch (err) {
      alert("Lỗi kết nối.");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ${email} không?`)) return;

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Xóa tài khoản thành công!", type: "success" });
        fetchUsers();
      } else {
        setMessage({ text: data.message || "Lỗi khi xóa.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Lỗi kết nối.", type: "error" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-blue-900 px-4 py-3 flex justify-between items-center text-white shrink-0">
          <h3 className="font-normal text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            Quản Lý Người Dùng
          </h3>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Add User Form */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded p-4">
            <h4 className="text-sm font-normal text-gray-700 mb-3 border-b pb-2">Thêm tài khoản mới</h4>
            <form onSubmit={handleAddUser} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 font-normal mb-1">Email / Tên đăng nhập</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-900 text-sm"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 font-normal mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-900 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-transparent select-none mb-1">Thao tác</label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white font-medium py-1.5 px-4 rounded focus:outline-none disabled:opacity-50 text-sm transition-colors cursor-pointer"
                >
                  {loading ? "Đang xử lý..." : "Thêm User"}
                </button>
              </div>
            </form>
            {message.text && (
              <div className={`mt-3 p-2 rounded text-xs font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message.text}
              </div>
            )}
          </div>

          {/* Users List */}
          <h4 className="text-sm font-normal text-gray-700 mb-3">Danh sách Tài khoản</h4>
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wider">
                  <th className="p-3 font-normal border-b">STT</th>
                  <th className="p-3 font-normal border-b">Tài khoản (Email)</th>
                  <th className="p-3 font-normal border-b text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {users.map((user, idx) => (
                  <tr key={user.email} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-b">{idx + 1}</td>
                    <td className="p-3 border-b font-medium">{user.email}</td>
                    <td className="p-3 border-b text-right">
                      {user.email !== adminEmail && (
                        <>
                          <button
                            onClick={() => handleResetPassword(user.email)}
                            className="text-blue-600 hover:text-blue-900 font-medium mr-4 text-xs cursor-pointer"
                          >
                            Đổi mật khẩu
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.email)}
                            className="text-red-500 hover:text-red-700 font-medium text-xs cursor-pointer"
                          >
                            Xóa
                          </button>
                        </>
                      )}
                      {user.email === adminEmail && (
                        <span className="text-xs text-gray-400 italic">Admin (Không thể sửa/xóa)</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500 italic">Chưa có tài khoản nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
