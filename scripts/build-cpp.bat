@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo  ConnectHub - C++ Data Structure Engine Compiler
echo =======================================================

set VS_PATH=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools
set VCVARS=%VS_PATH%\VC\Auxiliary\Build\vcvars64.bat

if not exist "%VCVARS%" (
    echo [ERROR] Visual Studio Build Tools vcvars64.bat not found at:
    echo %VCVARS%
    exit /b 1
)

echo [*] Initializing MSVC x64 build environment...
call "%VCVARS%" >nul 2>&1

cd /d "%~dp0..\cpp-data-structures"
if not exist "build" mkdir "build"

echo [*] Compiling C++ Data Structures library...
cl /nologo /EHsc /std:c++17 /O2 /I include /c src\NaryTree.cpp src\Graph.cpp src\MessageQueue.cpp src\MaxHeap.cpp /Fobuild\
if %errorlevel% neq 0 (
    echo [ERROR] Failed to compile data structures library.
    exit /b 1
)

echo [*] Compiling ConnectHubEngine.exe (Active Backend Bridge)...
cl /nologo /EHsc /std:c++17 /O2 /I include src\ConnectHubEngine.cpp build\NaryTree.obj build\Graph.obj build\MessageQueue.obj build\MaxHeap.obj /Fe:build\ConnectHubEngine.exe
if %errorlevel% neq 0 (
    echo [ERROR] Failed to compile ConnectHubEngine.exe
    exit /b 1
)

echo [*] Compiling standalone demos...
cl /nologo /EHsc /std:c++17 /I include demos\NaryTreeDemo.cpp build\NaryTree.obj /Fe:build\NaryTreeDemo.exe >nul
cl /nologo /EHsc /std:c++17 /I include demos\GraphDemo.cpp build\Graph.obj /Fe:build\GraphDemo.exe >nul
cl /nologo /EHsc /std:c++17 /I include demos\QueueDemo.cpp build\MessageQueue.obj /Fe:build\QueueDemo.exe >nul
cl /nologo /EHsc /std:c++17 /I include demos\PriorityQueueDemo.cpp build\MaxHeap.obj /Fe:build\PriorityQueueDemo.exe >nul

echo [*] Compiling comprehensive test suite (TestAll.exe)...
cl /nologo /EHsc /std:c++17 /I include tests\TestAll.cpp build\NaryTree.obj build\Graph.obj build\MessageQueue.obj build\MaxHeap.obj /Fe:build\TestAll.exe >nul

echo.
echo =======================================================
echo  [SUCCESS] All C++ data structures and demos compiled!
echo =======================================================
echo Executables created in: cpp-data-structures\build\
echo   - ConnectHubEngine.exe
echo   - TestAll.exe
echo   - NaryTreeDemo.exe
echo   - GraphDemo.exe
echo   - QueueDemo.exe
echo   - PriorityQueueDemo.exe
echo.
