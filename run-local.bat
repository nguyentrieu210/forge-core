@echo off
setlocal EnableDelayedExpansion
REM ==========================================================================
REM  Forge - chay HOAN TOAN CUC BO, khong deploy Cloudflare.
REM  Chi tiet: server\RUNBOOK_LOCAL.md
REM
REM  Script nay lam buoc 1-6: dev.vars -> build -> migrate D1 local -> seed
REM  -> chay worker -> smoke test. Sau do tu mo Desk (huong dan o cuoi).
REM
REM  KHONG co lenh nao cham Cloudflare. Tat ca deu --local.
REM ==========================================================================
cd /d C:\alumdoor
if errorlevel 1 (echo [LOI] Khong vao duoc C:\alumdoor & pause & exit /b 1)
set LOG=C:\alumdoor\run-local.log
echo Forge local run - %DATE% %TIME% > "%LOG%"
echo   Log: %LOG%

echo.
echo === 0. Kiem tra moi truong ===
call node --version || (echo [LOI] Chua cai Node 22+ & pause & exit /b 1)
call corepack enable >nul 2>&1
call pnpm --version || (echo [LOI] Chua co pnpm. Chay: corepack enable & pause & exit /b 1)

if not exist node_modules (
  echo.
  echo === Cai dependency lan dau - co the vai phut ===
  call pnpm install || (echo [LOI] pnpm install that bai. Neu chet o "xlsx" thi may can ra duoc cdn.sheetjs.com & pause & exit /b 1)
)

echo.
echo === 1. Secret cuc bo ===
REM Wrangler doc .dev.vars CANH FILE CONFIG: server\apps\tenant-worker\.dev.vars
REM Dat o server\.dev.vars thi wrangler KHONG nap -> moi request 401.
call node server\scripts\ensure-dev-vars.mjs
if errorlevel 1 (echo [LOI] Khong sinh duoc .dev.vars & pause & exit /b 1)
call node server\scripts\ensure-alumdoor-local-vars.mjs
if errorlevel 1 (echo [LOI] Khong dong bo duoc secret cho Alumdoor validator & pause & exit /b 1)

echo.
echo === 2. Build server ===
cd /d C:\alumdoor\server
call pnpm run build >> "%LOG%" 2>&1 || (echo [LOI] Build server that bai - xem %LOG% & pause & exit /b 1)

echo.
echo === 3. Migration len D1 CUC BO ===
call npx wrangler d1 migrations apply cloudforge-demo --local --config apps/tenant-worker/wrangler.jsonc >> "%LOG%" 2>&1
if errorlevel 1 (echo [LOI] Migration that bai - xem %LOG% & pause & exit /b 1)

echo.
echo === 4. Seed tai khoan dang nhap ===
call pnpm run dev:seed >> "%LOG%" 2>&1 || (echo [LOI] Seed that bai - xem %LOG% & pause & exit /b 1)

echo.
echo === 5. Chay worker ===
REM Alumdoor validator can ba Worker noi nhau. Cau hinh nay co PUBLIC_ORIGIN co dinh 8799.
set PORT=8799
set REUSE=
node -e "fetch('http://127.0.0.1:8799/api/method/metaforge.api.get_boot').then(r=>process.exit(r.status===403?0:2)).catch(()=>process.exit(1))" >nul 2>&1
if not errorlevel 1 (
  powershell -NoProfile -Command "$ok=Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*wrangler.alumdoor-local.jsonc*' }; if($ok){exit 0}else{exit 1}" >nul 2>&1
  if not errorlevel 1 set REUSE=1
)
if defined REUSE (
  echo   Dung lai cum Alumdoor worker dang chay tren 8799.
) else (
  node -e "fetch('http://127.0.0.1:8799/').then(()=>process.exit(2)).catch(()=>process.exit(0))" >nul 2>&1
  if errorlevel 2 (
    echo [LOI] Cong 8799 dang bi worker cu chiem. Dong cua so Forge worker cu roi chay lai.
    pause
    exit /b 1
  )
  echo   Khoi dong worker tren cong !PORT! ...
  start "Forge workers Alumdoor (local)" cmd /k "cd /d C:\alumdoor\server && pnpm run dev:alumdoor-local"
)

echo   Cho worker san sang ^(toi da 180 giay^)...
set READY=
for /l %%i in (1,1,90) do (
  if not defined READY (
    node -e "fetch('http://127.0.0.1:!PORT!/api/method/metaforge.api.get_boot').then(r=>process.exit(r.status===403?0:1)).catch(()=>process.exit(1))" >nul 2>&1
    if not errorlevel 1 (set READY=1) else (timeout /t 2 /nobreak >nul)
  )
)
if not defined READY (
  echo.
  echo [LOI] Worker khong san sang sau 180 giay tren cong !PORT!.
  echo       Mo cua so "Forge worker" de doc log.
  pause
  exit /b 1
)
echo   Worker san sang tren cong !PORT!.

echo.
echo === 6. Smoke test HTTP ===
call node scripts\http-smoke.mjs --base http://127.0.0.1:!PORT! > "%LOG%.smoke" 2>&1
type "%LOG%.smoke"
findstr /c:"HTTP_SMOKE_PASS" "%LOG%.smoke" >nul
if errorlevel 1 (
  echo.
  echo [CANH BAO] Smoke test KHONG xanh. Backend chua san sang - dung mo UI voi.
  echo            Log day du: %LOG%.smoke
  pause
  exit /b 1
)

echo.
echo === 7. Cai app vao tenant cuc bo ===
echo   Chuoi phu thuoc: hrm -^> vn-accounting -^> alumdoor
set FORGE_ADMIN_PASSWORD=local-dev-password-1
call node scripts\forge-app.mjs apps-src\hrm --origin http://127.0.0.1:!PORT! --admin dev@example.com --provision-standard >> "%LOG%" 2>&1
if errorlevel 1 (echo [LOI] Cai hrm that bai - xem %LOG% & pause & exit /b 1)
call node scripts\forge-app.mjs apps-src\vn-accounting --origin http://127.0.0.1:!PORT! --admin dev@example.com >> "%LOG%" 2>&1
if errorlevel 1 (echo [LOI] Cai vn-accounting that bai - xem %LOG% & pause & exit /b 1)
call node scripts\forge-app.mjs briefs\alumdoor-v2.json --origin http://127.0.0.1:!PORT! --admin dev@example.com >> "%LOG%" 2>&1
if errorlevel 1 (echo [LOI] Cai alumdoor that bai - xem %LOG% & pause & exit /b 1)
set FORGE_ADMIN_PASSWORD=

echo.
echo === 8. Build package client (dist cho vite resolve) ===
REM Vite dev KHONG build workspace package. Package nao thieu dist/index.js se lam Desk
REM chet voi "Failed to resolve entry for package @metaforge/...". charts va visual truoc day
REM khong nam trong client/tsconfig.json nen chua bao gio duoc build.
cd /d C:\alumdoor\client
call npx tsc -b >> "%LOG%" 2>&1
if errorlevel 1 (echo [LOI] Build package client that bai - xem %LOG% & pause & exit /b 1)

REM tsc -b tin vao *.tsbuildinfo: neu dist bi xoa ma buildinfo con, no bao "up to date" va
REM KHONG sinh lai dist. Kiem tra that va build cuong buc neu thieu.
set MISSING=
for %%p in (core adapter-frappe ui controls charts visual views builder shell stock-vn) do (
  if not exist "packages\%%p\dist\index.js" set MISSING=1
)
if defined MISSING (
  echo   Thieu dist - build cuong buc...
  call npx tsc -b --force >> "%LOG%" 2>&1
  if errorlevel 1 (echo [LOI] Build cuong buc that bai - xem %LOG% & pause & exit /b 1)
)
set MISSING=
for %%p in (core adapter-frappe ui controls charts visual views builder shell stock-vn) do (
  if not exist "packages\%%p\dist\index.js" (
    echo   [LOI] van thieu dist: packages\%%p
    set MISSING=1
  )
)
if defined MISSING (pause & exit /b 1)
echo   Package client da co dist day du.

echo.
echo === 9. Chay MetaForge Desk ===
REM Dung dang set "VAR=value" co ngoac kep: neu khong, cmd gan ca khoang trang truoc && vao gia tri
REM -> URL proxy co space o cuoi -> vite proxy hong -> Desk trang man.
start "Forge Desk (local 5173)" cmd /k "cd /d C:\alumdoor\client\apps\runtime && set \"VITE_FORGE_BACKEND=http://127.0.0.1:!PORT!\" && pnpm run dev"

echo.
echo ==========================================================
echo   XONG.
echo.
echo   Desk    : http://localhost:5173
echo   Backend : http://localhost:!PORT!   (Desk proxy /api sang day)
echo.
echo   Dang nhap: dev@example.com / local-dev-password-1
echo.
echo   Da cai: hrm (70 doctype) + vn-accounting (13) + alumdoor (74, 57 fixture)
echo   Sales Order render bang MetaForm 4.0 - khong con React bespoke.
echo.
echo   Dung lai : dong hai cua so "Forge worker" va "Forge Desk".
echo   Lam lai  : rmdir /s /q C:\alumdoor\server\apps\tenant-worker\.wrangler
echo              roi chay lai file nay.
echo ==========================================================
echo.
pause
