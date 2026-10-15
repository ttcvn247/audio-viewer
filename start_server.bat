@echo off
title Avaya Audio Viewer Server
echo ======================================================================
echo             DANG KHOI DONG HE THONG AVAYA AUDIO VIEWER
echo ======================================================================
echo.
cd /d "%~dp0"
echo Thu muc lam viec: %CD%
echo Dang khoi chay may chu web tai cong 3000...
echo.
echo 👉 Mo trinh duyet va truy cap: http://localhost:3000
echo 👉 Nhan Ctrl + C de dung server khi can.
echo ======================================================================
echo.
npm run start -- -H 0.0.0.0 -p 3000
pause
