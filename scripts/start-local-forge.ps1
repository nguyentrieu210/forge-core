[CmdletBinding()]
param(
    [int]$BackendPort = 8799,
    [int]$UiPort = 5173,
    [string]$LocalRoot = ""
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ServerRoot = Join-Path $RepoRoot "server"
$RuntimeRoot = Join-Path $RepoRoot "client\apps\runtime"

if ([string]::IsNullOrWhiteSpace($LocalRoot)) {
    if ($env:RUNNER_TEMP) {
        $runnerWorkRoot = Split-Path $env:RUNNER_TEMP -Parent
        $runnerRoot = Split-Path $runnerWorkRoot -Parent
        $LocalRoot = Join-Path $runnerRoot "_local"
    } else {
        $LocalRoot = Join-Path $RepoRoot ".local-runner"
    }
}

$LogRoot = Join-Path $LocalRoot "logs"
New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null

function Invoke-Checked {
    param([string]$WorkingDirectory, [string]$FilePath, [string[]]$Arguments = @())
    Push-Location $WorkingDirectory
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) { throw "$FilePath failed with exit code $LASTEXITCODE" }
    } finally { Pop-Location }
}

function Stop-PortProcessTree {
    param([int]$Port)
    $owners = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($ownerPid in $owners) {
        if ($ownerPid -and $ownerPid -ne $PID) {
            Write-Host "Stopping PID=$ownerPid on port $Port"
            taskkill.exe /PID $ownerPid /T /F | Out-Host
        }
    }
}

function Wait-Http {
    param([string]$Url, [int]$TimeoutSeconds = 90, [int[]]$Accepted = @(200))
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
            if ($Accepted -contains [int]$response.StatusCode) { return $true }
        } catch {
            if ($_.Exception.Response) {
                try {
                    if ($Accepted -contains [int]$_.Exception.Response.StatusCode) { return $true }
                } catch {}
            }
        }
        Start-Sleep -Seconds 2
    }
    return $false
}

Write-Host "Stopping previous Forge local processes..."
Stop-PortProcessTree -Port $UiPort
Stop-PortProcessTree -Port $BackendPort

Write-Host "Preparing dev vars..."
Invoke-Checked $RepoRoot "node" @("server/scripts/ensure-dev-vars.mjs")

Write-Host "Applying local migrations (best effort)..."
try {
    Invoke-Checked $ServerRoot "pnpm" @(
        "exec", "wrangler", "d1", "migrations", "apply", "cloudforge-demo",
        "--local", "--config", "apps/tenant-worker/wrangler.jsonc"
    )
} catch { Write-Warning $_.Exception.Message }

Write-Host "Seeding local dev account (best effort)..."
try {
    Invoke-Checked $RepoRoot "pnpm" @("--dir", "server", "run", "dev:seed")
} catch { Write-Warning $_.Exception.Message }

Write-Host "Building Desk packages that publish dist entrypoints..."
Invoke-Checked $RepoRoot "pnpm" @("--dir", "client", "--filter", "@metaforge/charts", "run", "build")
Invoke-Checked $RepoRoot "pnpm" @("--dir", "client", "--filter", "@metaforge/visual", "run", "build")

$backendOut = Join-Path $LogRoot "backend.out.log"
$backendErr = Join-Path $LogRoot "backend.err.log"
$uiOut = Join-Path $LogRoot "ui.out.log"
$uiErr = Join-Path $LogRoot "ui.err.log"
Remove-Item $backendOut, $backendErr, $uiOut, $uiErr -Force -ErrorAction SilentlyContinue

$previousTrackingId = $env:RUNNER_TRACKING_ID
$previousBackend = $env:VITE_FORGE_BACKEND
$previousReleaseSha = $env:VITE_FORGE_RELEASE_SHA
$env:RUNNER_TRACKING_ID = ""

try {
    Write-Host "Starting backend on :$BackendPort..."
    $backendStart = @{
        FilePath = "cmd.exe"
        ArgumentList = @("/d", "/c", "pnpm exec wrangler dev --config apps/tenant-worker/wrangler.jsonc --port $BackendPort --local")
        WorkingDirectory = $ServerRoot
        RedirectStandardOutput = $backendOut
        RedirectStandardError = $backendErr
        WindowStyle = "Hidden"
        PassThru = $true
    }
    $backendProcess = Start-Process @backendStart

    if (-not (Wait-Http "http://127.0.0.1:$BackendPort/api/method/metaforge.api.get_boot" 90 @(200,401,403))) {
        Get-Content $backendOut -Tail 100 -ErrorAction SilentlyContinue | Out-Host
        Get-Content $backendErr -Tail 100 -ErrorAction SilentlyContinue | Out-Host
        throw "Backend failed to become ready on port $BackendPort"
    }

    $env:VITE_FORGE_BACKEND = "http://127.0.0.1:$BackendPort"
    $env:VITE_FORGE_RELEASE_SHA = if ($env:GITHUB_SHA) { $env:GITHUB_SHA } else { (& git -C $RepoRoot rev-parse HEAD).Trim() }
    Write-Host "Starting Desk on :$UiPort..."
    $uiStart = @{
        FilePath = "cmd.exe"
        ArgumentList = @("/d", "/c", "pnpm run dev -- --host 0.0.0.0 --port $UiPort")
        WorkingDirectory = $RuntimeRoot
        RedirectStandardOutput = $uiOut
        RedirectStandardError = $uiErr
        WindowStyle = "Hidden"
        PassThru = $true
    }
    $uiProcess = Start-Process @uiStart

    if (-not (Wait-Http "http://127.0.0.1:$UiPort/" 90 @(200))) {
        Get-Content $uiOut -Tail 100 -ErrorAction SilentlyContinue | Out-Host
        Get-Content $uiErr -Tail 100 -ErrorAction SilentlyContinue | Out-Host
        throw "Desk failed to become ready on port $UiPort"
    }

    $sha = if ($env:GITHUB_SHA) { $env:GITHUB_SHA } else { (& git -C $RepoRoot rev-parse HEAD).Trim() }
    @(
        "FORGE_LOCAL_READY",
        "commit=$sha",
        "backend=http://localhost:$BackendPort",
        "desk=http://localhost:$UiPort",
        "login=dev@example.com",
        "password=local-dev-password-1",
        "backend_pid=$($backendProcess.Id)",
        "ui_pid=$($uiProcess.Id)",
        "workspace=$RepoRoot",
        "logs=$LogRoot",
        "started_at=$((Get-Date).ToString('o'))"
    ) | Set-Content -Path (Join-Path $LocalRoot "status.txt") -Encoding UTF8

    Write-Host "FORGE_LOCAL_READY"
    Write-Host "Desk    : http://localhost:$UiPort"
    Write-Host "Backend : http://localhost:$BackendPort"
    Write-Host "Login   : dev@example.com / local-dev-password-1"
} finally {
    $env:RUNNER_TRACKING_ID = $previousTrackingId
    $env:VITE_FORGE_BACKEND = $previousBackend
    $env:VITE_FORGE_RELEASE_SHA = $previousReleaseSha
}
