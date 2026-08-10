@echo off
setlocal EnableExtensions
REM Safe one-shot GitHub -> local refresh. It only accepts a clean local main.
cd /d C:\alumdoor
if errorlevel 1 (echo [LOI] Khong vao duoc C:\alumdoor & exit /b 1)

call node server\scripts\sync-local-from-github.mjs --check
set "SYNC_RESULT=%ERRORLEVEL%"
if "%SYNC_RESULT%"=="0" (
  echo [OK] Local da dung commit main tren GitHub. Khong can build lai.
  exit /b 0
)
if not "%SYNC_RESULT%"=="10" (
  echo [DUNG] Khong dong bo de tranh mat thay doi local.
  exit /b %SYNC_RESULT%
)

echo.
echo === 1. Dung server local truoc khi dong vao D1/R2 ===
powershell -NoProfile -Command "$ports=8799,5173; foreach($port in $ports){Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction Stop }}"
if errorlevel 1 (echo [LOI] Khong dung duoc server local & exit /b 1)

echo.
echo === 2. Sao luu D1/R2/DO local ===
call node server\scripts\backup-local-state.mjs
if errorlevel 1 (echo [LOI] Sao luu local state that bai & exit /b 1)

echo.
echo === 3. Dong bo main tu GitHub ===
call node server\scripts\sync-local-from-github.mjs --apply
if errorlevel 1 (echo [LOI] Khong the fast-forward main tu GitHub & exit /b 1)

echo.
echo === 4. Dong bo dependency dung lockfile ===
call pnpm install --frozen-lockfile
if errorlevel 1 (echo [LOI] Dependency khong khop lockfile & exit /b 1)

echo.
echo === 5. Build, test day du, migrate va cai metadata ===
call run-local.bat --noninteractive --verify
exit /b %ERRORLEVEL%
