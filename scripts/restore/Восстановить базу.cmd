@echo off
setlocal
chcp 65001 >nul
title Restore migrants_db

set "BACKUP_FILE=%~dp0migrants_db.dump"

if not exist "%BACKUP_FILE%" (
    echo ERROR: migrants_db.dump was not found next to this script.
    echo Copy the backup to this folder and run the script again.
    if not defined NO_PAUSE pause
    exit /b 1
)

echo WARNING: the current migrants_db database will be replaced.
choice /C YN /N /M "Continue? [Y/N]: "
if errorlevel 2 (
    echo Restore cancelled.
    if not defined NO_PAUSE pause
    exit /b 0
)

echo.
echo Restoring database...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\restore-db.ps1" -InputPath "%BACKUP_FILE%" -Force
if errorlevel 1 (
    echo.
    echo ERROR: restore failed.
    if not defined NO_PAUSE pause
    exit /b 1
)

echo.
echo DONE: database was restored from migrants_db.dump.
if not defined NO_PAUSE pause
