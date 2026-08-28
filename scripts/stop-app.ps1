$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "app-common.ps1")
Set-AppConsoleEncoding

Push-Location $script:ProjectRoot
try {
    Assert-CommandExists -Name "docker" -InstallHint "Docker Desktop is not installed."

    if (-not (Test-DockerEngine)) {
        Write-Host "The application is already stopped because Docker Desktop is not running."
        exit 0
    }

    Write-Host "Stopping the application..."
    Invoke-Compose -Arguments @("stop")
    Write-Host "Application stopped. Data was preserved." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
