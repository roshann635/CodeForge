# Start self-hosted Judge0 for CodeForge (Windows)
# Requires Docker Desktop with Linux containers enabled.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== CodeForge Judge0 Setup ===" -ForegroundColor Cyan

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker not found. Install Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "judge0.conf")) {
    Copy-Item "judge0.conf.example" "judge0.conf"
    Write-Host "Created judge0.conf from example — edit passwords before production." -ForegroundColor Yellow
}

Write-Host "Starting PostgreSQL and Redis..." -ForegroundColor Green
docker compose up -d db redis
Start-Sleep -Seconds 15

Write-Host "Starting Judge0 server and workers..." -ForegroundColor Green
docker compose up -d
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Checking Judge0 health..." -ForegroundColor Green
try {
    $about = Invoke-RestMethod -Uri "http://localhost:2358/about" -TimeoutSec 10
    Write-Host "Judge0 is running!" -ForegroundColor Green
    Write-Host ($about | ConvertTo-Json -Compress)
} catch {
    Write-Host "Judge0 not responding yet. Check logs: docker compose logs -f server" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Add to server/.env:" -ForegroundColor Cyan
Write-Host "  JUDGE0_URL=http://localhost:2358"
Write-Host "  JUDGE0_AUTH_TOKEN=codeforge_judge0_local_token"
Write-Host ""
Write-Host "API docs: http://localhost:2358/docs" -ForegroundColor Cyan
Write-Host "Test:     cd ..\server; node scripts/testJudge0.js" -ForegroundColor Cyan
