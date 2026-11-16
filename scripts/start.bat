@echo off
setlocal

echo =======================================================
echo  Starting CONNECTHUB (C++ Engine + MySQL + Backend + Frontend)
echo =======================================================

:: 1. Start MySQL 8.4 on Port 3307
echo [*] Starting dedicated MySQL 8.4 Server (port 3307)...
set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe
set INI_PATH=%~dp0..\database\my.ini

if exist "%MYSQL_BIN%" (
    start "ConnectHub MySQL Server" /min "%MYSQL_BIN%" --defaults-file="%INI_PATH%"
    timeout /t 3 /nobreak >nul
) else (
    echo [WARNING] MySQL binary not found at %MYSQL_BIN%.
)

:: 2. Start Backend Server
echo [*] Starting ConnectHub Express & Socket.IO Backend (port 5000)...
cd /d "%~dp0..\backend"
start "ConnectHub Backend" cmd /k "title ConnectHub Backend && node server.js"
timeout /t 2 /nobreak >nul

:: 3. Start Frontend Server
echo [*] Starting ConnectHub React Frontend (port 3000)...
cd /d "%~dp0..\frontend"
start "ConnectHub Frontend" cmd /k "title ConnectHub Frontend && npm run dev"
timeout /t 3 /nobreak >nul

:: 4. Open Application in Browser
echo [*] Launching ConnectHub in your browser...
start http://localhost:3000

echo.
echo =======================================================
echo  ConnectHub is running!
echo  - Frontend: http://localhost:3000
echo  - Backend API: http://localhost:5000
echo  - MySQL Port: 3307 (Database: connecthub_db)
echo.
echo  To shut down all services, run scripts\stop.bat
echo =======================================================
