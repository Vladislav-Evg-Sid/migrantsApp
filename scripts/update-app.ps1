$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "app-common.ps1")
Set-AppConsoleEncoding

Push-Location $script:ProjectRoot
try {
    Assert-CommandExists -Name "git" -InstallHint "Install Git for Windows first."
    Ensure-DockerEngine

    $branch = (& git branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branch)) {
        throw "The current Git branch could not be determined."
    }

    $localChanges = & git status --porcelain
    if ($LASTEXITCODE -ne 0) {
        throw "Git status could not be checked."
    }
    if ($localChanges) {
        throw "The application directory contains local changes. Update stopped to protect these files."
    }

    Write-Host "Creating a database backup..."
    & (Join-Path $PSScriptRoot "backup-db.ps1")
    if ($LASTEXITCODE -ne 0) {
        throw "Database backup failed. Update cancelled."
    }

    Write-Host "Downloading updates for branch '$branch'..."
    & git pull --ff-only
    if ($LASTEXITCODE -ne 0) {
        throw "Git could not download the update safely."
    }

    Write-Host "Building the new version..."
    Invoke-Compose -Arguments @("build")

    Write-Host "Starting the new version..."
    Invoke-Compose -Arguments @("up", "-d", "--remove-orphans")

    Write-Host "Waiting for the application..."
    Wait-App

    Write-Host "Update complete. The database backup is in database\backups." -ForegroundColor Green
    Start-Process $script:AppUrl
} catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
