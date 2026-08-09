@echo off
setlocal EnableDelayedExpansion
REM ==========================================================================
REM  Forge - KHOI DONG NHANH (dung cho autostart cung Windows).
REM
REM  Khac run-local.bat: KHONG build, KHONG migrate, KHONG cai app, KHONG pause.
REM  Chi bat worker + Desk. Dung khi da chay run-local.bat it nhat mot lan.
REM
REM  Lan dau tien / sau khi doi code hay metadata: chay run-local.bat.
REM ==========================================================================
cd /d C:\alumdoor 2>nul || exit /b 1
set LOG=C:\alumdoor\start-forge.log
echo Forge autostart - %DATE% %TIME% > "%LOG%"

REM .dev.vars phai ton tai va nam CANH wrangler config, neu khong moi request 401.
if not exist server\apps\tenant-worker\.dev.vars (
  call node server\scripts\ensure-dev-vars.mjs >> "%LOG%" 2>&1
)
call node server\scripts\ensure-alumdoor-local-vars.mjs >> "%LOG%" 2>&1
if errorlevel 1 exit /b 1

REM Chua co D1 -> chua tung chay run-local.bat -> khong tu doan, bao ro rang.
if not exist server\apps\tenant-worker\.wrangler (
  echo [DUNG] Chua co D1 cuc bo. Chay run-local.bat mot lan truoc. >> "%LOG%"
  exit /b 1
)

REM ---- Alumdoor local luon dung cum 3 Worker tren 8799 ----
set PORT=8799
set REUSE=
node -e "fetch('http://127.0.0.1:8799/api/method/metaforge.api.get_boot').then(r=>process.exit(r.status===403?0:2)).catch(()=>process.exit(1))" >nul 2>&1
if not errorlevel 1 (
  powershell -NoProfile -Command "$ok=Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*wrangler.alumdoor-local.jsonc*' }; if($ok){exit 0}else{exit 1}" >nul 2>&1
  if not errorlevel 1 set REUSE=1
)
if defined REUSE (
  echo Cum Alumdoor worker da chay san tren !PORT! >> "%LOG%"
) else (
  node -e "fetch('http://127.0.0.1:8799/api/method/metaforge.api.get_boot').then(()=>process.exit(2)).catch(()=>process.exit(0))" >nul 2>&1
  if errorlevel 2 (
    echo [DUNG] Cong 8799 dang bi worker cu chiem. Dong worker cu roi chay lai. >> "%LOG%"
    exit /b 1
  )
  echo Khoi dong cum Alumdoor worker tren !PORT! >> "%LOG%"
  start "Forge workers Alumdoor" /min cmd /k "cd /d C:\alumdoor\server && pnpm run dev:alumdoor-local"
)

REM ---- cho worker san sang (toi da 180 giay) ----
set READY=
for /l %%i in (1,1,90) do (
  if not defined READY (
    node -e "fetch('http://127.0.0.1:!PORT!/api/method/metaforge.api.get_boot').then(r=>process.exit(r.status===403?0:1)).catch(()=>process.exit(1))" >nul 2>&1
    if not errorlevel 1 (set READY=1) else (timeout /t 2 /nobreak >nul)
  )
)
if not defined READY (
  echo [LOI] Worker khong len sau 180 giay tren !PORT! >> "%LOG%"
  exit /b 1
)
echo Worker san sang tren !PORT! >> "%LOG%"

REM ---- Desk: bo qua neu 5173 da phuc vu ----
node -e "fetch('http://127.0.0.1:5173/').then(()=>process.exit(0)).catch(()=>process.exit(1))" >nul 2>&1
if not errorlevel 1 (
  echo Desk da chay san tren 5173 >> "%LOG%"
) else (
  echo Khoi dong Desk, backend = !PORT! >> "%LOG%"
  start "Forge Desk" /min cmd /k "cd /d C:\alumdoor\client\apps\runtime && set \"VITE_FORGE_BACKEND=http://127.0.0.1:!PORT!\" && pnpm run dev"
)

echo XONG. Desk http://localhost:5173  Backend http://localhost:!PORT! >> "%LOG%"
exit /b 0
