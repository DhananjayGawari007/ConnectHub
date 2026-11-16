@echo off
setlocal

echo =======================================================
echo  ConnectHub - Comprehensive Test Suite
echo =======================================================

cd /d "%~dp0..\cpp-data-structures"
if not exist "build\TestAll.exe" (
    echo [*] Test executable not found. Running build-cpp.bat first...
    call "%~dp0build-cpp.bat"
)

echo [*] Running C++ Data Structure Test Suite...
echo.
build\TestAll.exe

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo  [SUCCESS] All 69 C++ Data Structure tests passed!
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo  [FAILURE] Tests failed.
    echo =======================================================
)
