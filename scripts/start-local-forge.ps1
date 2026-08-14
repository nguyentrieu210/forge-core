[CmdletBinding()]
param(
    [int]$BackendPort = 8799,
    [int]$UiPort = 5173,
    [string]$LocalRoot = "C:\forge-local"
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ServerRoot = Join-Path $RepoRoot "server"
$RuntimeRoot = Join-Path $RepoRoot "client\apps\runtime"
$LogRoot = Join-Path $LocalRoot "logs"

New-Item -ItemType Directory -Force -Path $LocalRoot | Out-Null
New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $false)][string[]]$Arguments = @()
    )

    Push-Location $WorkingDirectory
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "$FilePath failed with exit code $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

function Stop-PortProcessTree {
    param([Parameter(Mandatory = $true)][int]$Port)

    $owners = @()
    try {
        $owners = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -Unique
    }
    catch {
        Write-Warning "Could not query port $Port with Get-NetTCPConnection: $($_.Exception.Message)"
    }

    foreach ($ownerPid in $owners) {
        if (-not $ownerPid -or $ownerPid -eq $PID) {
            continue
        }
        Write-Host "Stopping process tree PID=$ownerPid on port $Port..."
        & taskkill.exe /PID $ownerPid /T /F | Out-Host
    }
}

function Wait-ForBackend {
    param([int]$Port, [int]$TimeoutSeconds = 120)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        & node -e "fetch('http://127.0.0.1:$Port/api/method/metaforge.api.get_boot',{signal:AbortSignal.timeout(3000)}).then(r=>process.exit([200,401,403].includes(r.status)?0:1)).catch(()=>process.exit(1))" *> $null
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
        Start-Sleep -Seconds 2
    }
    return $false
}

function Wait-ForUi {
    param([int]$Port, [int]$TimeoutSeconds = 90)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/" -TimeoutSec 3
            if ($response.StatusCode -eq 200) {
                return $true
            }
        }
        catch {
            # Server is still starting.
        }
        Start-Sleep -Seconds 2
    }
    return $false
}

Write-Host "Stopping any previous Forge local servers..."
Stop-PortProcessTree -Port $UiPort
Stop-PortProcessTree -Port $BackendPort
Start-Sleep -Seconds 1

Write-Host "Preparing local development secrets..."
Invoke-Checked -WorkingDirectory $RepoRoot -FilePath "node" -Arguments @("server/scripts/ensure-dev-vars.mjs")

Write-Host "Building Forge server..."
Invoke-Checked -WorkingDirectory $RepoRoot -FilePath "pnpm" -Arguments @("--dir", "server", "run", "build")

Write-Host "Applying local D1 migrations..."
Invoke-Checked -WorkingDirectory $ServerRoot -FilePath "pnpm" -Arguments @(
    "exec", "wrangler", "d1", "migrations", "apply", "cloudforge-demo",
    "--local", "--config", "apps/tenant-worker/wrangler.jsonc"
)

Write-Host "Seeding local development account..."
Invoke-Checked -WorkingDirectory $RepoRoot -FilePath "pnpm" -Arguments @("--dir", "server", "run", "dev:seed")

Write-Host "Building client workspace packages required by the Desk..."
Invoke-Checked -WorkingDirectory $RepoRoot -FilePath "pnpm" -Arguments @("--dir", "client", "exec", "tsc", "-b")

$backendOut = Join-Path $LogRoot "backend.out.log"
$backendErr = Join-Path $LogRoot "backend.err.log"
$uiOut = Join-Path $LogRoot "ui.out.log"
$uiErr = Join-Path $LogRoot "ui.err.log"

Remove-Item $backendOut, $backendErr, $uiOut, $uiErr -Force -ErrorAction SilentlyContinue

# GitHub Runner removes child processes carrying RUNNER_TRACKING_ID at job cleanup.
# Clear it only for the two long-lived local development processes so localhost
# remains available after the workflow has finished.
$previousTrackingId = $env:RUNNER_TRACKING_ID
$previousBackend = $env:VITE_FORGE_BACKEND
$env:RUNNER_TRACKING_ID = ""

try {
    Write-Host "Starting Forge backend on http://127.0.0.1:$BackendPort ..."
    $backendProcess = Start-Process \
        -FilePath "cmd.exe" \
        -ArgumentList @(
            "/d", "/c",
            "pnpm exec wrangler dev --config apps/tenant-worker/wrangler.jsonc --port $BackendPort --local"
        ) \
        -WorkingDirectory $ServerRoot \
        -RedirectStandardOutput $backendOut \
        -RedirectStandardError $backendErr \
        -WindowStyle Hidden \
        -PassThru

    if (-not (Wait-ForBackend -Port $BackendPort)) {
        Write-Host "Backend stdout tail:"
        Get-Content $backendOut -Tail 80 -ErrorAction SilentlyContinue | Out-Host
        Write-Host "Backend stderr tail:"
        Get-Content $backendErr -Tail 80 -ErrorAction SilentlyContinue | Out-Host
        throw "Forge backend did not become ready on port $BackendPort."
    }

    Write-Host "Running HTTP smoke checks against local backend..."
    Invoke-Checked -WorkingDirectory $ServerRoot -FilePath "node" -Arguments @(
        "scripts/http-smoke.mjs", "--base", "http://127.0.0.1:$BackendPort"
    )

    $env:VITE_FORGE_BACKEND = "http://127.0.0.1:$BackendPort"
    Write-Host "Starting MetaForge Desk on http://127.0.0.1:$UiPort ..."
    $uiProcess = Start-Process \
        -FilePath "cmd.exe" \
        -ArgumentList @(
            "/d", "/c",
            "pnpm run dev -- --host 0.0.0.0 --port $UiPort"
        ) \
        -WorkingDirectory $RuntimeRoot \
        -RedirectStandardOutput $uiOut \
        -RedirectStandardError $uiErr \
        -WindowStyle Hidden \
        -PassThru

    if (-not (Wait-ForUi -Port $UiPort)) {
        Write-Host "UI stdout tail:"
        Get-Content $uiOut -Tail 80 -ErrorAction SilentlyContinue | Out-Host
        Write-Host "UI stderr tail:"
        Get-Content $uiErr -Tail 80 -ErrorAction SilentlyContinue | Out-Host
        throw "MetaForge Desk did not become ready on port $UiPort."
    }

    $sha = if ($env:GITHUB_SHA) { $env:GITHUB_SHA } else { (& git -C $RepoRoot rev-parse HEAD).Trim() }
    $status = @(
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
    )
    $status | Set-Content -Path (Join-Path $LocalRoot "status.txt") -Encoding UTF8

    Write-Host ""
    Write-Host "FORGE_LOCAL_READY"
    Write-Host "Desk    : http://localhost:$UiPort"
    Write-Host "Backend : http://localhost:$BackendPort"
    Write-Host "Login   : dev@example.com / local-dev-password-1"
    Write-Host "Status  : $(Join-Path $LocalRoot 'status.txt')"
    Write-Host "Logs    : $LogRoot"
}
finally {
    $env:RUNNER_TRACKING_ID = $previousTrackingId
    $env:VITE_FORGE_BACKEND = $previousBackend
}
