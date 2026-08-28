[CmdletBinding()]
param(
    [string]$OutputPath = ("database\backups\migrants_db-{0}.dump" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$containerBackupPath = "/tmp/migrants_db.dump"

function Invoke-DockerCompose {
    param([Parameter(Mandatory)][string[]]$Arguments)

    & docker compose @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose failed with exit code $LASTEXITCODE."
    }
}

function Wait-Postgres {
    for ($attempt = 1; $attempt -le 30; $attempt++) {
        & docker compose exec -T postgres pg_isready -U migrants -d migrants_db *> $null
        if ($LASTEXITCODE -eq 0) {
            return
        }
        Start-Sleep -Seconds 1
    }

    throw "PostgreSQL did not become ready within 30 seconds."
}

$candidatePath = if ([IO.Path]::IsPathRooted($OutputPath)) {
    $OutputPath
} else {
    Join-Path $projectRoot $OutputPath
}
$resolvedOutputPath = [IO.Path]::GetFullPath($candidatePath)
$outputDirectory = Split-Path -Parent $resolvedOutputPath

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

Push-Location $projectRoot
try {
    Invoke-DockerCompose -Arguments @("up", "-d", "postgres")
    Wait-Postgres

    Invoke-DockerCompose -Arguments @(
        "exec", "-T", "postgres",
        "pg_dump", "-U", "migrants", "-d", "migrants_db",
        "-Fc", "--no-owner", "--no-privileges",
        "-f", $containerBackupPath
    )
    Invoke-DockerCompose -Arguments @(
        "cp", "postgres:$containerBackupPath", $resolvedOutputPath
    )

    $backup = Get-Item -LiteralPath $resolvedOutputPath
    Write-Host "Backup created: $($backup.FullName)"
    Write-Host "Size: $([Math]::Round($backup.Length / 1MB, 2)) MB"
} finally {
    & docker compose exec -T postgres rm -f $containerBackupPath *> $null
    Pop-Location
}
