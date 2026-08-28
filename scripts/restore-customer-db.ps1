[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$InputPath
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "app-common.ps1")
Set-AppConsoleEncoding

Push-Location $script:ProjectRoot
try {
    Ensure-DockerEngine

    $resolvedInputPath = (Resolve-Path -LiteralPath $InputPath -ErrorAction Stop).Path
    Write-Host "Restoring the database from: $resolvedInputPath"

    Invoke-Compose -Arguments @("stop", "client", "server")

    & (Join-Path $PSScriptRoot "restore-db.ps1") -InputPath $resolvedInputPath -Force
    if ($LASTEXITCODE -ne 0) {
        throw "Database restore failed."
    }

    Write-Host "Database restored successfully." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
