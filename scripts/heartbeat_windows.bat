@echo off
REM PC Heartbeat Script for Windows
REM Installer sur chaque PC Windows des employes
REM Usage: heartbeat.bat ARIS-0001

set MATRICULE=%1

if "%MATRICULE%"=="" (
    echo Usage: heartbeat.bat ARIS-0001
    exit /b 1
)

set API_URL=https://apiv2.aris-cc.com/api/pc-status/heartbeat

echo PC Heartbeat started for %MATRICULE%
echo Press Ctrl+C to stop

:loop
    curl -X POST "%API_URL%" ^
        -H "Content-Type: application/json" ^
        -d "{\"badge_code\": \"%MATRICULE%\"}" ^
        --connect-timeout 5 ^
        --max-time 10 ^
        -o nul 2>&1
    
    if %errorlevel% equ 0 (
        echo [%time%] Heartbeat OK - PC marked as online
    ) else (
        echo [%time%] Heartbeat failed
    )
    
    timeout /t 60 /nobreak > nul
    goto loop
