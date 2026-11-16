@echo off
setlocal

echo =======================================================
echo  Launching CONNECTHUB DESKTOP APPLICATION
echo =======================================================

:: 1. Start MySQL 8.4 on Port 3307
echo [*] Starting dedicated MySQL 8.4 Server (port 3307)...
set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe
set INI_PATH=%~dp0..\database\my.ini

if exist "%MYSQL_BIN%" (
    start "ConnectHub MySQL Server" /min "%MYSQL_BIN%" --defaults-file="%INI_PATH%"
    timeout /t 2 /nobreak >nul
)

:: 2. Start Backend Server
echo [*] Starting ConnectHub Express & Socket.IO Backend (port 5000)...
cd /d "%~dp0..\backend"
start "ConnectHub Backend" /min cmd /c "node server.js"
timeout /t 2 /nobreak >nul

:: 3. Start Frontend Server
echo [*] Starting ConnectHub React Frontend (port 3000)...
cd /d "%~dp0..\frontend"
start "ConnectHub Frontend" /min cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

:: 4. Launch Electron Native Desktop Application
echo [*] Opening ConnectHub Native Desktop Window...
cd /d "%~dp0.."
npx electron desktop\main.js

echo.
echo ConnectHub Desktop window closed.
