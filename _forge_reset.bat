@echo off
cd /d C:\alumdoor

del /f /q ".git\index.lock" >nul 2>&1
del /f /q ".git\objects\maintenance.lock" >nul 2>&1

(
  echo === DEL LOCK DONE
  git fetch origin main
  echo === FETCH rc=%%errorlevel%%
  git reset --hard origin/main
  echo === RESET rc=%%errorlevel%%
  git clean -fd -e start-forge.bat -e start-forge-hidden.vbs -e run-local.bat -e cai-tu-khoi-dong.bat -e RUNBOOK_LOCAL.md -e ensure-dev-vars.mjs -e _forge_reset.bat -e _forge_reset_log.txt
  echo === CLEAN rc=%%errorlevel%%
  git log --oneline -1
  echo === STATUS
  git status --short
  echo === UNTRACKED
  git ls-files --others --exclude-standard
  echo === HET
) > "C:\alumdoor\_forge_reset_log.txt" 2>&1
