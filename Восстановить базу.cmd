@echo off
setlocal
chcp 65001 >nul
title Migrants App - database restore

set "BACKUP_FILE=%~1"
if not defined BACKUP_FILE set "BACKUP_FILE=%~dp0migrants_db.dump"

if not exist "%BACKUP_FILE%" (
    echo Backup file was not found:
    echo %BACKUP_FILE%
    echo.
    echo Copy migrants_db.dump next to this file,
    echo or drag and drop the .dump file onto this icon.
    pause
    exit /b 1
)

echo WARNING: the current application database will be replaced.
choice /C YN /N /M "Continue? [Y/N]: "
if errorlevel 2 exit /b 0

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\restore-customer-db.ps1" -InputPath "%BACKUP_FILE%"
if errorlevel 1 (
    echo.
    pause
    exit /b 1
)

echo.
echo Now run the application using the start .cmd file.
pause
