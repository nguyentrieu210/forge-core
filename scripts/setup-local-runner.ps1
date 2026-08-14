[CmdletBinding()]
param(
    [string]$RepoFullName = "nguyentrieu210/forge-core",
    [string]$RunnerRoot = "C:\actions-runner\forge-core",
    [string]$RunnerName = "forge-local-$env:COMPUTERNAME",
    [string]$RegistrationToken
)

$ErrorActionPreference = "Stop"

function Test-IsAdministrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-RegistrationToken {
    param([string]$Repo)

    $gh = Get-Command gh -ErrorAction SilentlyContinue
    if ($gh) {
        try {
            Write-Host "Requesting a short-lived runner token with GitHub CLI..."
            $value = & gh api --method POST "repos/$Repo/actions/runners/registration-token" --jq '.token' 2>$null
            if ($LASTEXITCODE -eq 0 -and $value) {
                return $value.Trim()
            }
        }
        catch {
            Write-Warning "GitHub CLI could not create a runner token. Falling back to secure prompt."
        }
    }

    Write-Host ""
    Write-Host "GitHub CLI is unavailable or not authorized for runner administration."
    Write-Host "Open: Repository Settings -> Actions -> Runners -> New self-hosted runner"
    Write-Host "Copy ONLY the temporary token from the config command and paste it below."
    Write-Host "Do not paste the token into chat or commit it to the repository."
    $secure = Read-Host "Runner registration token" -AsSecureString
    return ([System.Net.NetworkCredential]::new("", $secure)).Password
}

if (-not (Test-IsAdministrator)) {
    throw "Run PowerShell as Administrator, then run this script again."
}

$repoUrl = "https://github.com/$RepoFullName"

New-Item -ItemType Directory -Force -Path $RunnerRoot | Out-Null

if (Test-Path (Join-Path $RunnerRoot ".runner")) {
    Write-Host "Runner is already configured at $RunnerRoot. Nothing was overwritten."
    Get-Service -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like "actions.runner.*" } |
        Format-Table Status, Name, DisplayName -AutoSize
    exit 0
}

if (-not $RegistrationToken) {
    $RegistrationToken = Get-RegistrationToken -Repo $RepoFullName
}

if ([string]::IsNullOrWhiteSpace($RegistrationToken)) {
    throw "No runner registration token was provided."
}

$headers = @{
    "Accept" = "application/vnd.github+json"
    "User-Agent" = "forge-core-local-runner-bootstrap"
}

Write-Host "Finding the latest official GitHub Actions runner for Windows x64..."
$release = Invoke-RestMethod -Uri "https://api.github.com/repos/actions/runner/releases/latest" -Headers $headers

$asset = $release.assets |
    Where-Object { $_.name -match '^actions-runner-win-x64-.*\.zip$' } |
    Select-Object -First 1

if (-not $asset) {
    throw "Could not find a Windows x64 runner archive in the latest actions/runner release."
}

$zipPath = Join-Path $env:TEMP $asset.name
Write-Host "Downloading $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -Headers $headers -OutFile $zipPath

Write-Host "Extracting runner to $RunnerRoot..."
Expand-Archive -Path $zipPath -DestinationPath $RunnerRoot -Force
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

Push-Location $RunnerRoot
try {
    Write-Host "Registering runner '$RunnerName' with label 'forge-local'..."
    $configArgs = @(
        '--unattended',
        '--url', $repoUrl,
        '--token', $RegistrationToken,
        '--name', $RunnerName,
        '--labels', 'forge-local',
        '--work', '_work',
        '--runasservice',
        '--replace'
    )

    & .\config.cmd @configArgs

    if ($LASTEXITCODE -ne 0) {
        throw "GitHub runner configuration failed with exit code $LASTEXITCODE."
    }
}
finally {
    $RegistrationToken = $null
    Pop-Location
}

$runnerServices = Get-Service -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "actions.runner.*" }

foreach ($service in $runnerServices) {
    if ($service.Status -ne "Running") {
        try {
            Start-Service -Name $service.Name
        }
        catch {
            Write-Warning "Could not start service $($service.Name): $($_.Exception.Message)"
        }
    }
}

Write-Host ""
Write-Host "Runner setup finished."
Write-Host "Repository : $repoUrl"
Write-Host "Runner     : $RunnerName"
Write-Host "Label      : forge-local"
Write-Host "Root       : $RunnerRoot"
Write-Host ""
Get-Service -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "actions.runner.*" } |
    Format-Table Status, Name, DisplayName -AutoSize
Write-Host ""
Write-Host "When GitHub shows this runner as Idle, local validation jobs can run on this machine."
