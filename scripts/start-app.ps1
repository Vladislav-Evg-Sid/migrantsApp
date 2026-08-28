$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "app-common.ps1")
Set-AppConsoleEncoding

Push-Location $script:ProjectRoot
try {
    Ensure-DockerEngine

    Write-Host "Starting the application..."
    Invoke-Compose -Arguments @("up", "-d")

    Write-Host "Waiting for the application..."
    Wait-App

    Write-Host "Application is ready: $script:AppUrl" -ForegroundColor Green
    Start-Process $script:AppUrl
} catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
