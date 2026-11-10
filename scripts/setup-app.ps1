$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "app-common.ps1")
Set-AppConsoleEncoding

Push-Location $script:ProjectRoot
try {
    Ensure-DockerEngine
    Invoke-Compose -Arguments @("version")
    Write-Host "Подготовка приложения. При первом запуске потребуется интернет и несколько минут ожидания."
    Invoke-Compose -Arguments @("build")
    Invoke-Compose -Arguments @("up", "-d")
    Wait-App
    Write-Host "Приложение готово: $script:AppUrl" -ForegroundColor Green
    Write-Host "Для следующих запусков используйте файл 'Запустить приложение.cmd'."
    Start-Process $script:AppUrl
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
