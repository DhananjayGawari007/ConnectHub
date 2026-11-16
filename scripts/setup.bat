@echo off
setlocal

echo =======================================================
echo  ConnectHub - Complete Environment Setup
echo =======================================================

echo [1/4] Compiling C++ Data Structures & Engine...
call "%~dp0build-cpp.bat"
if %errorlevel% neq 0 (
    echo [ERROR] C++ build failed.
    exit /b 1
)

echo [2/4] Installing backend dependencies...
cd /d "%~dp0..\backend"
call npm install

echo [3/4] Installing frontend dependencies & building bundle...
cd /d "%~dp0..\frontend"
call npm install
call npm run build

echo [4/4] Verifying C++ Test Suite...
cd /d "%~dp0..\cpp-data-structures"
build\TestAll.exe

echo.
echo =======================================================
echo  [SUCCESS] ConnectHub setup complete!
echo  Run scripts\start.bat to start the entire platform.
echo =======================================================
