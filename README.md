# 🎧 HỆ THỐNG TRA CỨU & NGHE GHI ÂM TỔNG ĐÀI AVAYA (AVAYA VIEWER)

Phần mềm web tra cứu, lọc và nghe trực tuyến các file ghi âm cuộc gọi tổng đài Avaya IPCC. Hỗ trợ quét tự động theo cấu trúc thư mục ngày (`YYYYMM/YYYY/MM/DD`), chuyển đổi âm thanh trực tiếp (transcoding WAV sang MP3) để phát mượt mà trên mọi trình duyệt web.

---

## 📋 MỤC LỤC
1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Hướng dẫn cài đặt chi tiết (Dành cho máy khách hàng)](#2-hướng-dẫn-cài-đặt-chi-tiết)
3. [Tài khoản đăng nhập mặc định](#3-tài-khoản-đăng-nhập-mặc-định)
4. [Cấu hình đường dẫn thư mục ghi âm](#4-cấu-hình-đường-dẫn-thư-mục-ghi-âm)
5. [Cho phép các máy tính khác trong mạng LAN truy cập](#5-cho-phép-các-máy-tính-khác-trong-mạng-lan-truy-cập)
6. [Cài đặt tự động khởi động cùng Windows](#6-cài-đặt-tự-động-khởi-động-cùng-windows)

---

## 1. Yêu cầu hệ thống

Trước khi cài đặt, máy tính máy chủ (Server/PC cài ứng dụng) cần đáp ứng:
- **Hệ điều hành:** Windows 10, Windows 11 hoặc Windows Server 2016/2019/2022 (64-bit).
- **RAM:** Tối thiểu 4 GB (Khuyến nghị 8 GB trở lên).
- **Phần mềm cần cài trước:** **Node.js LTS (bản 20.x hoặc 22.x)**.

---

## 2. Hướng dẫn cài đặt chi tiết

### Bước 2.1: Cài đặt Node.js (Nếu máy chưa có)
1. Truy cập trang chủ Node.js: **[https://nodejs.org](https://nodejs.org)**
2. Tải bản **LTS (Recommended for Most Users)** - dạng file `.msi` (Windows Installer).
3. Mở file vừa tải về, nhấn **Next** liên tục theo mặc định cho đến khi **Finish**.
4. Kiểm tra cài đặt thành công:
   - Mở cửa sổ **Command Prompt (CMD)** hoặc **PowerShell** trên Windows.
   - Gõ lệnh sau và nhấn Enter:
     ```powershell
     node -v
     npm -v
     ```
   - Nếu hiển thị phiên bản (ví dụ: `v20.x.x` hoặc `v22.x.x`) là đã cài thành công.

---

### Bước 2.2: Đưa mã nguồn vào thư mục cài đặt
1. Tải source code từ GitHub hoặc copy thư mục `audio-viewer` từ USB/mạng nội bộ vào máy.
2. Đặt vào một thư mục cố định, ví dụ: `D:\Recording IPCC\audio-viewer` hoặc `C:\audio-viewer`.

---

### Bước 2.3: Cài đặt các gói thư viện phụ thuộc
1. Mở **PowerShell** hoặc **Command Prompt (CMD)**.
2. Di chuyển vào thư mục phần mềm:
   ```powershell
   cd "D:\Recording IPCC\audio-viewer"
   ```
3. Chạy lệnh cài đặt thư viện:
   ```powershell
   npm install
   ```
   *(Đợi khoảng 1 - 3 phút để hệ thống tải và nạp các gói phụ thuộc)*.

---

### Bước 2.4: Biên dịch và Khởi chạy ứng dụng (Production Mode)

Để phần mềm đạt tốc độ nhanh nhất và ổn định nhất cho nhiều người dùng:

1. **Biên dịch hệ thống (Build):**
   ```powershell
   npm run build
   ```
   *(Chỉ cần chạy lệnh này một lần sau khi cài đặt hoặc khi có cập nhật code mới)*.

2. **Khởi động website (Chọn 1 trong 2 cách):**
   - **Cách 1 (Khuyên dùng - Cực dễ):** Nhấp đúp chuột trực tiếp vào file **`audio-viewer.exe`**.
     - Phần mềm sẽ tự động khởi động máy chủ web.
     - **Tự động mở trình duyệt web** đến `http://localhost:3000` sau 3 giây.
   - **Cách 2:** Chạy lệnh thủ công trong PowerShell / CMD:
     ```powershell
     npm run start
     ```
     Sau đó mở trình duyệt truy cập: 👉 **[http://localhost:3000](http://localhost:3000)**

---

## 3. Tài khoản đăng nhập mặc định

Khi truy cập trang web lần đầu, hệ thống sẽ yêu cầu đăng nhập:

- **Tên đăng nhập (Email):** `demo@mobifoneservice.com.vn`
- **Mật khẩu mặc định:** `demo@123`

> **Lưu ý bảo mật:** Sau khi đăng nhập thành công, hãy nhấn vào biểu tượng **👤 Tài khoản** góc trên bên phải màn hình để **Đổi mật khẩu** ngay.

---

## 4. Cấu hình đường dẫn thư mục ghi âm

Hệ thống cho phép cấu hình đường dẫn file ghi âm trực tiếp trên giao diện web mà không cần sửa code:

1. Đăng nhập bằng tài khoản Quản trị viên (Admin).
2. Nhấn vào nút **⚙️ Cài đặt** ở góc trên bên phải màn hình.
3. Tại ô **Đường dẫn thư mục ghi âm**, nhập đường dẫn chứa file:
   - **Thư mục trên ổ đĩa nội bộ máy:** Ví dụ `D:\Recordings` hoặc `C:\Users\Admin\Desktop\202606`.
   - **Thư mục chia sẻ mạng (Network Share):** Ví dụ `\\172.16.8.10\Recordings`.
4. Nhấn **Lưu Cài Đặt**. Hệ thống sẽ tự động cập nhật và sẵn sàng tra cứu.

---

## 5. Cho phép các máy tính khác trong mạng LAN truy cập

Nếu bạn muốn các máy tính của nhân viên, kiểm soát viên khác trong công ty cùng truy cập vào website:

### Bước 5.1: Mở Port 3000 trên Windows Firewall (Tường lửa)
Mở **PowerShell với quyền Administrator** (chuột phải chọn *Run as Administrator*) và chạy lệnh duy nhất sau:
```powershell
New-NetFirewallRule -DisplayName "Audio Viewer Web Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Bước 5.2: Chạy server lắng nghe toàn mạng
Khởi động website với cờ `-H 0.0.0.0`:
```powershell
npm run start -- -H 0.0.0.0 -p 3000
```

### Bước 5.3: Lấy địa chỉ IP máy chủ để các máy khác truy cập
1. Trên máy chủ, gõ lệnh: `ipconfig` trong PowerShell.
2. Tìm dòng **IPv4 Address**, ví dụ: `192.168.1.100`.
3. Từ máy tính khác trong văn phòng, mở trình duyệt web và truy cập:
   👉 **`http://192.168.1.100:3000`**

---

## 6. Cài đặt tự động khởi động cùng Windows

Để website tự động chạy mỗi khi máy chủ bật nguồn hoặc khởi động lại mà không cần ai phải mở cửa sổ lệnh gõ thủ công:

### Cách nhanh nhất:
1. Nhấn tổ hợp phím `Windows + R`, gõ `shell:startup` rồi nhấn **Enter** (thư mục Startup của Windows sẽ mở ra).
2. Tạo một **Shortcut** của file **`audio-viewer.exe`** (hoặc `start_server.bat`) kéo thả vào thư mục Startup này.
3. Xong! Từ nay mỗi khi bật máy chủ, website sẽ tự động chạy và bật trình duyệt.
