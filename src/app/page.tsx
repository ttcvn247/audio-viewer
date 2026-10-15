"use client";

import { useState, useEffect } from 'react';
import { signOut, getSession } from 'next-auth/react';
import ConfigModal from '@/components/ConfigModal';
import PasswordModal from '@/components/PasswordModal';
import AlertModal from '@/components/AlertModal';
import UsersModal from '@/components/UsersModal';
import LockModal from '@/components/LockModal';

type RecordType = {
  filename: string;
  caller: string;
  receiver: string;
  duration: number;
  timestamp: string;
  formattedDate: string;
  agent: string;
  direction: string;
  serviceBranch: string;
};

export default function Home() {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Audio state
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [appName, setAppName] = useState("Avaya Viewer");
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "" });
  const [isLicenseLocked, setIsLicenseLocked] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState<{ contactPhone?: string; contactEmail?: string }>({});

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [filters, setFilters] = useState({
    dateStart: '',
    dateEnd: '',
    receiver: '',
    duration: '',
    agent: '',
    caller: '',
    direction: '',
  });

  // Fetch initial data
  useEffect(() => {
    fetch('/api/records')
      .then(res => res.json())
      .then(data => {
        if (data.error === 'LICENSE_LOCKED') {
          setIsLicenseLocked(true);
        } else if (!data.error) {
          setRecords(data.records || []);
        }
      })
      .catch(console.error);

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

    Promise.all([
      getSession(),
      fetch('/api/settings/public', { cache: 'no-store' }).then(res => res.json())
    ]).then(([session, settings]) => {
      const currentUserEmail = session?.user?.email;
      const adminEmail = settings?.ADMIN_EMAIL;
      
      if (settings?.APP_NAME) {
        setAppName(settings.APP_NAME);
      }

      if (currentUserEmail) {
        setUserEmail(currentUserEmail);
      }

      if (currentUserEmail && adminEmail && currentUserEmail.toLowerCase() === adminEmail.toLowerCase()) {
        setIsAdmin(true);
      }
    }).catch(console.error);
  }, []);

  const handleSearch = () => {
    if (!filters.dateStart && !filters.dateEnd) {
      setAlertModal({ 
        isOpen: true, 
        title: "Thiếu thông tin", 
        message: "Vui lòng chọn ít nhất một mốc thời gian (Từ ngày hoặc Đến ngày) để hệ thống biết cần quét dữ liệu ở đâu nhé!" 
      });
      return;
    }

    if (filters.dateStart && filters.dateEnd) {
      const start = new Date(filters.dateStart.split('T')[0]);
      const end = new Date(filters.dateEnd.split('T')[0]);
      
      const diffTime = end.getTime() - start.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24); 
      
      if (diffDays < 0) {
        setAlertModal({ 
          isOpen: true, 
          title: "Lỗi chọn ngày", 
          message: "Từ ngày không được lớn hơn Đến ngày." 
        });
        return;
      }

      if (diffDays > 183) { // 183 days is approx 6 months
        setAlertModal({ 
          isOpen: true, 
          title: "Giới hạn dữ liệu", 
          message: "Khoảng thời gian tìm kiếm không được vượt quá 6 tháng.\nVui lòng thu hẹp khoảng cách giữa Từ ngày và Đến ngày để tránh quá tải hệ thống." 
        });
        return;
      }
    }

    setLoading(true);
    setHasSearched(true);
    
    // Build query params
    const params = new URLSearchParams();
    if (filters.dateStart) {
      params.append('dateStart', filters.dateStart.replace('T', ' '));
    }
    if (filters.dateEnd) {
      params.append('dateEnd', filters.dateEnd.replace('T', ' '));
    }
    if (filters.receiver) params.append('receiver', filters.receiver);
    if (filters.duration) params.append('duration', filters.duration);
    if (filters.agent) params.append('agent', filters.agent);
    if (filters.caller) params.append('caller', filters.caller);
    if (filters.direction) params.append('direction', filters.direction);
    
    fetch(`/api/records?${params.toString()}`, { cache: 'no-store' })
      .then(res => {
        if (res.status === 423) {
          setIsLicenseLocked(true);
        }
        return res.json();
      })
      .then(data => {
        if (data.error === 'LICENSE_LOCKED') {
          setIsLicenseLocked(true);
        } else if (data.records) {
          setRecords(data.records);
        } else {
          setRecords([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch records:', err);
        setLoading(false);
      });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const playAudio = (filename: string) => {
    setCurrentFile(filename);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-sm text-gray-800">
      
      {/* Sidebar / Filters */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="bg-blue-900 p-4 text-white font-normal flex items-center gap-2 text-lg tracking-wide shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
          <span className="truncate">{appName}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h3 className="text-lg font-normal text-blue-900 mb-6 flex items-center gap-2 border-b pb-2">Tìm kiếm & Lọc</h3>
          
          <div className="space-y-1">
            <label className="text-xs font-normal text-gray-500">Từ ngày giờ</label>
            <input 
              type="datetime-local" 
              step="1" 
              name="dateStart" 
              value={filters.dateStart} 
              onChange={handleFilterChange} 
              onFocus={() => {
                if (!filters.dateStart) {
                  setFilters(prev => ({ ...prev, dateStart: `${todayStr}T00:00:00` }));
                }
              }}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-normal text-gray-500">Đến ngày giờ</label>
            <input 
              type="datetime-local" 
              step="1" 
              name="dateEnd" 
              value={filters.dateEnd} 
              onChange={handleFilterChange} 
              onFocus={() => {
                if (!filters.dateEnd) {
                  setFilters(prev => ({ ...prev, dateEnd: `${todayStr}T23:59:59` }));
                }
              }}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-normal text-gray-500">Số INum (Tiếp nhận)</label>
            <input type="text" name="receiver" value={filters.receiver} onChange={handleFilterChange} className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-normal text-gray-500">Thời lượng (giây)</label>
            <input type="text" name="duration" value={filters.duration} onChange={handleFilterChange} className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-normal text-gray-500">ĐTV (Agent ID)</label>
            <input type="text" name="agent" value={filters.agent} onChange={handleFilterChange} className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-normal text-gray-500">Số Gọi (Caller)</label>
            <input type="text" name="caller" value={filters.caller} onChange={handleFilterChange} className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-normal text-gray-500">Hướng Gọi</label>
            <input type="text" name="direction" value={filters.direction} onChange={handleFilterChange} className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Incoming / Outgoing" />
          </div>

          <div className="pt-4">
            <button onClick={handleSearch} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-medium py-2 px-4 rounded shadow focus:outline-none disabled:opacity-50 cursor-pointer transition-colors">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tìm...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  Tìm kiếm
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="font-normal text-blue-900">Kết quả: {records.length} files</h2>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full font-medium mr-2">
                👤 {userEmail}
              </span>
            )}
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-900 font-medium cursor-pointer transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              Đổi mật khẩu
            </button>
            {isAdmin && (
              <>
                <button 
                  onClick={() => setShowUsersModal(true)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-900 font-medium cursor-pointer transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  Quản lý User
                </button>
                <button 
                  onClick={() => setShowConfigModal(true)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-900 font-medium cursor-pointer transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Cài đặt
                </button>
              </>
            )}
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1 text-sm text-blue-900 hover:text-blue-950 font-medium cursor-pointer transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white m-4 rounded shadow">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 sticky top-0 shadow-sm">
              <tr>
                <th className="p-3 border-b text-center font-normal text-gray-600 w-12">Phát</th>
                <th className="p-3 border-b font-normal text-gray-600">Thời Gian Bắt Đầu</th>
                <th className="p-3 border-b font-normal text-gray-600">Số INum</th>
                <th className="p-3 border-b font-normal text-gray-600">Số Gọi</th>
                <th className="p-3 border-b font-normal text-gray-600">ĐTV</th>
                <th className="p-3 border-b font-normal text-gray-600">Nhánh Dịch Vụ</th>
                <th className="p-3 border-b font-normal text-gray-600">Hướng Gọi</th>
                <th className="p-3 border-b font-normal text-gray-600 text-right">T/gian (s)</th>
              </tr>
            </thead>
            <tbody>
              {!hasSearched ? (
                <tr><td colSpan={8} className="p-4 text-center text-gray-500">Vui lòng chọn điều kiện và bấm Tìm kiếm.</td></tr>
              ) : loading ? (
                <tr><td colSpan={8} className="p-4 text-center text-gray-500">Đang tìm dữ liệu...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} className="p-4 text-center text-gray-500">Không tìm thấy dữ liệu.</td></tr>
              ) : (
                records.map((record, idx) => (
                  <tr key={idx} className={`hover:bg-blue-50 transition-colors ${currentFile === record.filename ? 'bg-blue-100' : 'even:bg-gray-50'}`}>
                    <td className="p-2 border-b text-center">
                      <button 
                        onClick={() => playAudio(record.filename)}
                        className="text-blue-900 hover:text-blue-950 focus:outline-none cursor-pointer transition-colors"
                        title="Nghe file này"
                      >
                        ▶
                      </button>
                    </td>
                    <td className="p-2 border-b text-gray-700">{record.formattedDate}</td>
                    <td className="p-2 border-b font-medium">{record.receiver}</td>
                    <td className="p-2 border-b">{record.caller}</td>
                    <td className="p-2 border-b">{record.agent}</td>
                    <td className="p-2 border-b text-gray-500">{record.serviceBranch}</td>
                    <td className="p-2 border-b text-gray-500">{record.direction}</td>
                    <td className="p-2 border-b text-right">{record.duration}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Audio Player Footer */}
        {currentFile && (
          <div className="bg-white border-t border-gray-300 p-4 shadow-lg flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700 w-1/3 truncate pr-4">
              <span className="text-gray-500 mr-2">Đang phát:</span> 
              {currentFile}
            </div>
            <div className="flex-1 flex justify-center">
              <audio 
                className="w-full max-w-2xl h-10 outline-none" 
                controls 
                autoPlay 
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                src={`/api/audio?filename=${encodeURIComponent(currentFile)}`}
              >
                Trình duyệt của bạn không hỗ trợ thẻ audio.
              </audio>
            </div>
            <div className="w-1/3 text-right">
               <button onClick={() => setCurrentFile(null)} className="inline-flex items-center gap-1 text-blue-900 hover:text-white hover:bg-blue-900 text-xs font-normal px-3 py-1 border border-blue-900 rounded cursor-pointer transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                 </svg>
                 Đóng
               </button>
            </div>
          </div>
        )}
      </div>

      <ConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
      <PasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      <UsersModal isOpen={showUsersModal} onClose={() => setShowUsersModal(false)} />
      <AlertModal 
        isOpen={alertModal.isOpen} 
        title={alertModal.title} 
        message={alertModal.message} 
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))} 
      />
      <LockModal 
        isOpen={isLicenseLocked} 
        contactPhone={licenseInfo.contactPhone} 
        contactEmail={licenseInfo.contactEmail} 
        onActivated={() => window.location.reload()} 
      />
    </div>
  );
}
