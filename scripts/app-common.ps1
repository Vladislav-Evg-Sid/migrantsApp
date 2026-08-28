$script:ProjectRoot = Split-Path -Parent $PSScriptRoot
$script:AppUrl = "http://localhost:8080"

function Set-AppConsoleEncoding {
    [Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $OutputEncoding = [Console]::OutputEncoding
}

function Assert-CommandExists {
    param(
        [Parameter(Mandatory)]
        [string]$Name,

        [Parameter(Mandatory)]
        [string]$InstallHint
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Command '$Name' was not found. $InstallHint"
    }
}

function Test-DockerEngine {
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & docker info *> $null
        return $LASTEXITCODE -eq 0
    } finally {
        $ErrorActionPreference = $previousPreference
    }
}

function Start-DockerDesktopProcess {
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & docker desktop start *> $null
        $desktopCliStarted = $LASTEXITCODE -eq 0
    } finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($desktopCliStarted) {
        return
    }

    $candidates = @(
        (Join-Path $env:LOCALAPPDATA "Programs\DockerDesktop\Docker Desktop.exe"),
        (Join-Path $env:LOCALAPPDATA "Docker\Docker Desktop.exe"),
        (Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe")
    )

    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate) {
            Start-Process -FilePath $candidate
            return
        }
    }

    throw "Docker Desktop could not be started. Start it from the Start menu and try again."
}

function Wait-DockerEngine {
    param([int]$TimeoutSeconds = 180)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-DockerEngine) {
            return
        }
        Start-Sleep -Seconds 2
    }

    throw "Docker Desktop did not become ready within $TimeoutSeconds seconds."
}

function Ensure-DockerEngine {
    Assert-CommandExists -Name "docker" -InstallHint "Install Docker Desktop first."

    if (Test-DockerEngine) {
        return
    }

    Write-Host "Starting Docker Desktop..."
    Start-DockerDesktopProcess
    Wait-DockerEngine
}

function Invoke-Compose {
    param(
        [Parameter(Mandatory)]
        [string[]]$Arguments
    )

    & docker compose @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command 'docker compose $($Arguments -join ' ')' failed."
    }
}

function Wait-App {
    param([int]$TimeoutSeconds = 180)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $script:AppUrl -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
                return
            }
        } catch {
            # Containers are still starting.
        }
        Start-Sleep -Seconds 2
    }

    throw "The application did not become ready within $TimeoutSeconds seconds. Run 'docker compose logs' for diagnostics."
}
