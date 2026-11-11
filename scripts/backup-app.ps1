$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "app-common.ps1")
Set-AppConsoleEncoding

try {
    Ensure-DockerEngine
    & (Join-Path $PSScriptRoot "backup-db.ps1")
    Write-Host "Резервная копия сохранена в папке database\backups внутри папки приложения." -ForegroundColor Green
    Write-Host "Скопируйте новый файл .dump на согласованный с ответственным носитель."
} catch {
    Write-Host "Ошибка создания копии: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
