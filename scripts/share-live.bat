@echo off
setlocal

echo =======================================================
echo   CONNECTHUB - INSTANT PUBLIC SHARING FOR FRIENDS
echo =======================================================
echo.
echo [*] Checking if ConnectHub backend and database are running...
netstat -ano | findstr "5000" >nul
if %errorlevel% neq 0 (
    echo [!] Backend is not running on port 5000.
    echo [*] Starting ConnectHub services first...
    call "%~dp0start.bat"
    timeout /t 5 /nobreak >nul
) else (
    echo [OK] ConnectHub Backend is running on port 5000.
)

echo.
echo =======================================================
echo  Generating Live Public HTTPS URL for your friends...
echo =======================================================
echo.
echo Choose your preferred tunnel provider:
echo  [1] Localtunnel (Free, no signup needed, fast)
echo  [2] Cloudflare Quick Tunnel (Free, high performance)
echo  [3] Ngrok (Requires free ngrok auth token)
echo.
set /p CHOICE="Enter option [1-3] (Default is 1): "
if "%CHOICE%"=="" set CHOICE=1

if "%CHOICE%"=="1" (
    echo.
    echo [*] Starting Localtunnel on port 5000...
    echo [*] Copy the public URL shown below and share it with your friends!
    echo.
    npx --yes localtunnel --port 5000
)

if "%CHOICE%"=="2" (
    echo.
    echo [*] Starting Cloudflare Quick Tunnel on port 5000...
    echo [*] Look for the https://....trycloudflare.com link below:
    echo.
    where cloudflared >nul 2>nul
    if %errorlevel% neq 0 (
        echo [INFO] cloudflared not found in PATH. Running via winget / npx...
        npx --yes untun@latest tunnel 5000
    ) else (
        cloudflared tunnel --url http://localhost:5000
    )
)

if "%CHOICE%"=="3" (
    echo.
    echo [*] Starting Ngrok on port 5000...
    ngrok http 5000
)

pause
