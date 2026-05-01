@echo off
cd /d "%~dp0"
echo Instalando dependencias do React...
call npm install
if %errorlevel% neq 0 (
  echo Erro na instalacao!
  pause
  exit /b 1
)
echo.
echo Instalacao concluida!
pause
