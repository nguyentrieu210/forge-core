@echo off
setlocal
REM ==========================================================================
REM  Dang ky Forge chay cung Windows, roi bat server luon.
REM  Chay MOT LAN. Sau do moi lan bat may, server tu len.
REM
REM  Go bo: xoa file trong thu muc Startup (huong dan in ra o cuoi).
REM ==========================================================================
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set LINK=%STARTUP%\Forge-local.vbs

echo.
echo === Dang ky tu khoi dong ===
if not exist "C:\alumdoor\start-forge-hidden.vbs" (
  echo [LOI] Thieu C:\alumdoor\start-forge-hidden.vbs
  pause
  exit /b 1
)
copy /y "C:\alumdoor\start-forge-hidden.vbs" "%LINK%" >nul
if errorlevel 1 (
  echo [LOI] Khong ghi duoc vao thu muc Startup:
  echo       %STARTUP%
  pause
  exit /b 1
)
echo   Da dat: %LINK%

echo.
echo === Kiem tra da co D1 chua ===
if not exist "C:\alumdoor\server\apps\tenant-worker\.wrangler" (
  echo   Chua co D1 cuc bo - chay run-local.bat day du lan dau...
  call "C:\alumdoor\run-local.bat"
  goto done
)

echo.
echo === Bat server ngay bay gio ===
call "C:\alumdoor\start-forge.bat"
if errorlevel 1 (
  echo.
  echo [LOI] Khoi dong that bai. Nhat ky: C:\alumdoor\start-forge.log
  type "C:\alumdoor\start-forge.log" 2>nul
  pause
  exit /b 1
)

:done
echo.
echo ==========================================================
echo   XONG.
echo.
echo   Tu bay gio moi lan bat may, Forge tu chay ngam.
echo   Desk: http://localhost:5173
echo   Dang nhap: dev@example.com / local-dev-password-1
echo.
echo   Nhat ky  : C:\alumdoor\start-forge.log
echo   Go bo    : xoa file
echo              %LINK%
echo ==========================================================
type "C:\alumdoor\start-forge.log" 2>nul
echo.
pause
