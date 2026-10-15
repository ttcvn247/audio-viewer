"use client";

export default function AlertModal({ 
  isOpen, 
  title = "Thông báo", 
  message, 
  onClose 
}: { 
  isOpen: boolean; 
  title?: string; 
  message: string; 
  onClose: () => void 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        <div className="bg-blue-900 px-4 py-3 flex justify-between items-center text-white">
          <h3 className="font-normal text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {title}
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-700 text-sm leading-relaxed mb-6 whitespace-pre-line">
            {message}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-medium py-2 px-4 rounded shadow focus:outline-none transition-colors cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
