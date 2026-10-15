# 🎧 HỆ THỐNG TRA CỨU & NGHE GHI ÂM TỔNG ĐÀI AVAYA (MOBIFONE SERVICE)

Phần mềm web tra cứu, lọc và nghe trực tuyến các file ghi âm cuộc gọi tổng đài Avaya IPCC. Hỗ trợ quét tự động theo cấu trúc thư mục ngày (`YYYYMM/YYYY/MM/DD`), chuyển đổi âm thanh trực tiếp (transcoding WAV sang MP3) để phát mượt mà trên mọi trình duyệt web.

---

## 📋 MỤC LỤC
1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Hướng dẫn cài đặt & khởi chạy (Cực kỳ đơn giản)](#2-hướng-dẫn-cài-đặt--khởi-chạy)
3. [Tài khoản đăng nhập mặc định](#3-tài-khoản-đăng-nhập-mặc-định)
4. [Cấu hình đường dẫn thư mục ghi âm Avaya](#4-cấu-hình-đường-dẫn-thư-mục-ghi-âm-avaya)
5. [Cho phép các máy tính khác trong mạng LAN truy cập](#5-cho-phép-các-máy-tính-khác-trong-mạng-lan-truy-cập)
6. [Cài đặt tự động khởi động cùng Windows](#6-cài-đặt-tự-động-khởi-động-cùng-windows)
7. [Liên hệ hỗ trợ & Cấp phép bản quyền](#7-liên-hệ-hỗ-trợ--cấp-phép-bản-quyền)

---

## 1. Yêu cầu hệ thống

Trước khi chạy phần mềm, máy tính (Server/PC) cần đáp ứng:
- **Hệ điều hành:** Windows 10, Windows 11 hoặc Windows Server 2016/2019/2022 (64-bit).
- **RAM:** Tối thiểu 4 GB (Khuyến nghị 8 GB trở lên).
- **Môi trường bắt buộc:** **Node.js LTS (bản 20.x hoặc 22.x)**.

---

## 2. Hướng dẫn cài đặt & Khởi chạy (Hoàn toàn tự động)

Bạn chỉ cần thực hiện **2 bước đơn giản**:

### Bước 1: Tải phần mềm từ GitHub
1. Nhấn nút xanh **Code** trên trang GitHub này -> Chọn **Download ZIP** (hoặc dùng lệnh `git clone https://github.com/ttcvn247/audio-viewer.git`).
2. Giải nén file ZIP vào một thư mục trên máy tính (ví dụ: `D:\audio-viewer` hoặc `C:\audio-viewer`).

---

### Bước 2: Khởi chạy phần mềm
👉 **Nhấp đúp chuột trực tiếp vào file `audio-viewer.exe`**.

Phần mềm sẽ tự động xử lý mọi thứ từ A đến Z:
- **Tự động kiểm tra & cài đặt Node.js:** Nếu máy tính của bạn chưa có Node.js, `audio-viewer.exe` sẽ tự động tải và cài đặt ngầm bản Node.js LTS chính thức (không cần người dùng thao tác).
- **Tự động nạp thư viện:** Trong lần đầu tiên chạy, hệ thống sẽ tự động cấu hình các gói cần thiết (chỉ mất 1 - 2 phút).
- **Tự động mở trình duyệt web:** Sau khi máy chủ sẵn sàng, ứng dụng sẽ tự động mở trình duyệt tới địa chỉ:
  👉 **`http://localhost:3000`**

*(Lưu ý: Không tắt cửa sổ console màu đen của `audio-viewer.exe` trong khi sử dụng phần mềm. Khi muốn dừng máy chủ, chỉ cần nhấn tổ hợp phím `Ctrl + C` hoặc đóng cửa sổ console).*

---

## 3. Tài khoản đăng nhập mặc định

Khi giao diện trang web hiện ra, đăng nhập bằng tài khoản:

- **Tên đăng nhập (Email):** `demo@mobifoneservice.com.vn`
- **Mật khẩu:** `demo@123`

> ⚠️ **Lưu ý:** Sau khi đăng nhập thành công, bạn nên bấm vào biểu tượng **👤 Tài khoản** góc trên bên phải màn hình để **Đổi mật khẩu** ngay nhằm đảm bảo an toàn.

---

## 4. Cấu hình đường dẫn thư mục ghi âm Avaya

1. Đăng nhập bằng tài khoản Quản trị viên (Admin).
2. Nhấn vào nút **⚙️ Cài đặt** ở góc trên bên phải màn hình.
3. Tại ô **Đường dẫn thư mục ghi âm**, nhập đường dẫn thư mục lưu trữ file ghi âm:
   - **Thư mục trên ổ đĩa nội bộ máy:** Ví dụ `D:\Recordings` hoặc `C:\AvayaRecords`.
   - **Thư mục chia sẻ mạng (Network Share):** Ví dụ `\\172.16.8.10\Recordings`.
4. Nhấn **Lưu Cài Đặt**. Hệ thống sẽ tự động quét và sẵn sàng tra cứu, lọc và nghe các cuộc gọi.

---

## 5. Cho phép các máy tính khác trong mạng LAN truy cập

Nếu bạn muốn các máy tính khác của nhân viên trong cùng mạng cơ quan có thể truy cập vào website:

### Bước 5.1: Mở Port 3000 trên Windows Firewall (Tường lửa)
Mở **PowerShell với quyền Administrator** (chuột phải vào Start -> chọn *Terminal (Admin)* hoặc *PowerShell (Admin)*) và dán lệnh sau:
```powershell
New-NetFirewallRule -DisplayName "Audio Viewer Web Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Bước 5.2: Lấy địa chỉ IP máy chủ
1. Trên máy cài phần mềm, mở CMD/PowerShell gõ: `ipconfig`
2. Tìm dòng **IPv4 Address**, ví dụ: `192.168.1.100`.
3. Từ các máy tính khác trong mạng nội bộ, mở trình duyệt web truy cập theo địa chỉ:
   👉 **`http://192.168.1.100:3000`**

---

## 6. Cài đặt tự động khởi động cùng Windows

Để phần mềm tự động chạy mỗi khi bật máy tính:
1. Nhấn tổ hợp phím `Windows + R`, gõ `shell:startup` rồi nhấn **Enter** (thư mục Startup của Windows sẽ mở ra).
2. Nhấp chuột phải vào file **`audio-viewer.exe`** -> Chọn **Create shortcut** (Tạo lối tắt).
3. Kéo file Shortcut vừa tạo thả vào thư mục Startup.
4. Từ nay mỗi khi bật máy tính, phần mềm sẽ tự động khởi chạy ngầm và mở sẵn sàng.

---

## 7. Liên hệ hỗ trợ & Cấp phép bản quyền

Mọi thắc mắc kỹ thuật, yêu cầu cấp lại tài khoản quản trị hoặc đăng ký gia hạn giấy phép bản quyền (License Key), vui lòng liên hệ:

- **Đơn vị cung cấp:** MobiFone Service
- **Email hỗ trợ:** `phuongvb@mobifoneservice.com.vn`
- **Hotline / Zalo:** `0936658668`
