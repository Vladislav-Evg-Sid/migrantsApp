[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$InputPath,

    [switch]$Force
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

$candidatePath = if ([IO.Path]::IsPathRooted($InputPath)) {
    $InputPath
} else {
    Join-Path $projectRoot $InputPath
}
$resolvedInputPath = (Resolve-Path -LiteralPath $candidatePath).Path

if (-not $Force) {
    Write-Warning "Restore will replace the current migrants_db tables and data."
    $confirmation = Read-Host "Type RESTORE to continue"
    if ($confirmation -cne "RESTORE") {
        Write-Host "Restore cancelled."
        exit 1
    }
}

Push-Location $projectRoot
try {
    Invoke-DockerCompose -Arguments @("up", "-d", "postgres")
    Wait-Postgres

    Invoke-DockerCompose -Arguments @(
        "cp", $resolvedInputPath, "postgres:$containerBackupPath"
    )
    Invoke-DockerCompose -Arguments @(
        "exec", "-T", "postgres",
        "pg_restore", "-U", "migrants", "-d", "migrants_db",
        "--clean", "--if-exists", "--no-owner", "--no-privileges",
        "--exit-on-error", $containerBackupPath
    )

    Write-Host "Database restored from: $resolvedInputPath"
    Invoke-DockerCompose -Arguments @(
        "exec", "-T", "postgres",
        "psql", "-U", "migrants", "-d", "migrants_db", "-c",
        "SELECT count(DISTINCT id) AS unique_child_codes, count(*) AS participants, (SELECT count(*) FROM test_results) AS tests FROM participants;"
    )
} finally {
    & docker compose exec -T postgres rm -f $containerBackupPath *> $null
    Pop-Location
}
