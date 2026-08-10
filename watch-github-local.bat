@echo off
setlocal EnableExtensions
set "POLL_SECONDS=%~1"
if "%POLL_SECONDS%"=="" set "POLL_SECONDS=60"
cd /d C:\alumdoor
echo Theo doi GitHub main moi %POLL_SECONDS% giay. Dong cua so nay de dung.

:loop
call sync-local.bat
if errorlevel 1 echo [CANH BAO] Dong bo chua xong. Se thu lai o chu ky sau.
timeout /t %POLL_SECONDS% /nobreak >nul
goto loop
