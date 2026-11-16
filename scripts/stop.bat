@echo off
setlocal

echo =======================================================
echo  Stopping ConnectHub Services...
echo =======================================================

echo [*] Stopping Node.js processes...
taskkill /f /im node.exe 2>nul

echo [*] Stopping ConnectHub MySQL Server (port 3307)...
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqladmin.exe" -u root -pConnectHub2024! -P 3307 --protocol=tcp shutdown 2>nul
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqladmin.exe" -u connecthub_user -pConnectHub2024! -P 3307 --protocol=tcp shutdown 2>nul
taskkill /f /fi "WINDOWTITLE eq ConnectHub MySQL Server*" 2>nul

echo.
echo =======================================================
echo  ConnectHub services stopped.
echo =======================================================
