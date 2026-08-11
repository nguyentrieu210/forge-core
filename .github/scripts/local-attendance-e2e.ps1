$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$worktree = 'C:\forge-attendance-payroll'
$shared = 'C:\alumdoor'
$target = 'feature/attendance-payroll'
$devDir = 'C:\forge-attendance-payroll-dev'
$backendPort = 18899
$frontendPort = 5173

function Assert-Exit([string]$label) {
  if ($LASTEXITCODE -ne 0) { throw "$label failed with exit code $LASTEXITCODE" }
}
function Write-Utf8([string]$path, [string]$content) {
  [IO.File]::WriteAllText($path, $content, [Text.UTF8Encoding]::new($false))
}
function Replace-Exact([string]$path, [string]$old, [string]$new, [string]$label) {
  $text = [IO.File]::ReadAllText($path)
  if ($text.Contains($new)) { Write-Host "$label already applied"; return }
  if (-not $text.Contains($old)) { throw "$label anchor not found in $path" }
  Write-Utf8 $path ($text.Replace($old, $new))
  Write-Host "$label applied"
}
function Stop-Port([int]$port) {
  $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($listener in $listeners) {
    Write-Host "Stopping listener port=$port pid=$($listener.OwningProcess)"
    Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}
function Wait-Http([string]$url, [int]$seconds = 45) {
  for ($i = 0; $i -lt $seconds; $i++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 3
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { return $response }
    } catch {}
    Start-Sleep -Seconds 1
  }
  throw "HTTP endpoint did not become ready: $url"
}

if (-not (Test-Path $worktree)) { throw "Missing worktree $worktree" }
New-Item -ItemType Directory -Force -Path $devDir | Out-Null

git -C $worktree fetch origin $target --prune
Assert-Exit 'fetch feature'
$branch = (git -C $worktree branch --show-current).Trim()
if ($branch -ne $target) { throw "Worktree is on $branch, expected $target" }
git -C $worktree merge --ff-only "origin/$target"
Assert-Exit 'fast-forward feature'

# ---- 1. Wire operational attendance/payroll screens into the generic runtime.
$main = Join-Path $worktree 'client\apps\runtime\src\main-base.tsx'
$kioskImport = 'const AlumdoorAttendanceKiosk = lazy(() => import("./experiences/AlumdoorAttendanceKiosk.js").then((module) => ({ default: module.AlumdoorAttendanceKiosk })));'
$opsImport = 'const AlumdoorAttendanceOperations = lazy(() => import("./experiences/AlumdoorAttendanceOperations.js").then((module) => ({ default: module.AlumdoorAttendanceOperations })));'
$text = [IO.File]::ReadAllText($main)
if (-not $text.Contains($opsImport)) {
  if (-not $text.Contains($kioskImport)) { throw 'Runtime kiosk import anchor missing' }
  $text = $text.Replace($kioskImport, "$kioskImport`r`n$opsImport")
  Write-Utf8 $main $text
}
$oldAttendanceBlock = @'
  if (kind === "alumdoor-attendance") {
    return (
      <Shell manifest={manifest} boot={boot} logout={logout} nav={nav} active={experienceKey} breadcrumbs={[{ label: "Chấm công QR" }]}>
        <AlumdoorAttendanceKiosk />
      </Shell>
    );
  }
'@
$newAttendanceBlock = @'
  if (kind === "alumdoor-attendance") {
    const mode = experienceKey.slice("alumdoor-attendance:".length);
    const label = manifest.nav.find((item) => item.key === experienceKey)?.label ?? "Chấm công & lương";
    if (mode === "kiosk" || mode === "mobile") {
      return (
        <Shell manifest={manifest} boot={boot} logout={logout} nav={nav} active={experienceKey} breadcrumbs={[{ label }]}>
          <AlumdoorAttendanceKiosk />
        </Shell>
      );
    }
    const operationsMode = mode === "today" ? "today"
      : mode === "month" ? "month"
      : mode === "exceptions" ? "exceptions"
      : mode === "payroll-run" ? "payroll-run"
      : mode === "payroll-my-slips" ? "payroll-my-slips"
      : null;
    if (operationsMode) {
      return (
        <Shell manifest={manifest} boot={boot} logout={logout} nav={nav} active={experienceKey} breadcrumbs={[{ label }]}>
          <AlumdoorAttendanceOperations
            mode={operationsMode}
            onExit={() => navigate(`/overview/${encodeURIComponent(manifest.domain ?? manifest.id)}`)}
          />
        </Shell>
      );
    }
  }
'@
Replace-Exact $main $oldAttendanceBlock $newAttendanceBlock 'runtime attendance route wiring'

# ---- 2. Wire new app-worker methods.
$worker = Join-Path $worktree 'server\apps-src\alumdoor-worker\src\index.ts'
$oldWorkerImport = 'import { attendanceChallenge, attendanceScan } from "./attendance-routes.js";'
$newWorkerImport = @'
import { attendanceChallenge, attendanceScan } from "./attendance-routes.js";
import {
  attendanceExceptions, attendanceMonth, attendanceReviewCorrection,
  attendanceSubmitCorrection, attendanceToday,
} from "./attendance-operational-routes.js";
import {
  payrollApprovePeriod, payrollCalculatePeriod, payrollCreatePeriod, payrollMarkPaid,
  payrollMySlips, payrollPeriodList, payrollPeriodSlips, payrollSubmitPeriod,
} from "./payroll-routes.js";
'@
Replace-Exact $worker $oldWorkerImport $newWorkerImport 'worker attendance/payroll imports'
$oldWorkerDispatch = @'
        if (method === "alumdoor.attendance.challenge") return await attendanceChallenge({ request, call, env, args });
        if (method === "alumdoor.attendance.scan") return await attendanceScan({ request, call, env, args });
        if (method === "alumdoor.sales.item_context") return await salesItemContext(call, args);
'@
$newWorkerDispatch = @'
        if (method === "alumdoor.attendance.challenge") return await attendanceChallenge({ request, call, env, args });
        if (method === "alumdoor.attendance.scan") return await attendanceScan({ request, call, env, args });
        if (method === "alumdoor.attendance.today") return await attendanceToday({ call, args });
        if (method === "alumdoor.attendance.month") return await attendanceMonth({ call, args });
        if (method === "alumdoor.attendance.exceptions") return await attendanceExceptions({ call, args });
        if (method === "alumdoor.attendance.submit_correction") return await attendanceSubmitCorrection({ call, args });
        if (method === "alumdoor.attendance.review_correction") return await attendanceReviewCorrection({ call, args });
        if (method === "alumdoor.payroll.period_list") return await payrollPeriodList({ call, args });
        if (method === "alumdoor.payroll.create_period") return await payrollCreatePeriod({ call, args });
        if (method === "alumdoor.payroll.calculate_period") return await payrollCalculatePeriod({ call, args });
        if (method === "alumdoor.payroll.submit_period") return await payrollSubmitPeriod({ call, args });
        if (method === "alumdoor.payroll.approve_period") return await payrollApprovePeriod({ call, args });
        if (method === "alumdoor.payroll.mark_paid") return await payrollMarkPaid({ call, args });
        if (method === "alumdoor.payroll.period_slips") return await payrollPeriodSlips({ call, args });
        if (method === "alumdoor.payroll.my_slips") return await payrollMySlips({ call, args, actorUser: platformActorUser(request) });
        if (method === "alumdoor.sales.item_context") return await salesItemContext(call, args);
'@
Replace-Exact $worker $oldWorkerDispatch $newWorkerDispatch 'worker attendance/payroll dispatch'

# ---- 3. Add period salary-slip list and make "my slips" server-bound to actor -> Employee.
$payrollRoutes = Join-Path $worktree 'server\apps-src\alumdoor-worker\src\payroll-routes.ts'
$oldMySlips = @'
export async function payrollMySlips(input: { call: PayrollPlatformCall; args: Json }): Promise<Response> {
  try { return json(await listDocs(input.call, "Salary Slip", { ...(text(input.args.period) ? { alu_payroll_entry: text(input.args.period) } : {}) })); }
  catch (error) { return fail("PAYROLL_SLIP_LIST_FAILED", error instanceof Error ? error.message : "Không đọc được phiếu lương."); }
}
'@
$newMySlips = @'
export async function payrollPeriodSlips(input: { call: PayrollPlatformCall; args: Json }): Promise<Response> {
  try {
    const period = requiredText(input.args.period, "Kỳ lương");
    return json(await listDocs(input.call, "Salary Slip", { alu_payroll_entry: period }));
  } catch (error) { return fail("PAYROLL_PERIOD_SLIPS_FAILED", error instanceof Error ? error.message : "Không đọc được phiếu lương của kỳ."); }
}

export async function payrollMySlips(input: { call: PayrollPlatformCall; args: Json; actorUser: string }): Promise<Response> {
  try {
    const actorUser = requiredText(input.actorUser, "Tài khoản đăng nhập");
    const employees = await listDocs(input.call, "Employee", { user_id: actorUser }, ["name", "user_id"]);
    if (employees.length !== 1) throw new Error("Tài khoản phải được gắn duy nhất một Employee để xem phiếu lương.");
    const employee = requiredText(employees[0]?.name, "Nhân viên");
    return json(await listDocs(input.call, "Salary Slip", {
      employee,
      ...(text(input.args.period) ? { alu_payroll_entry: text(input.args.period) } : {}),
    }));
  } catch (error) { return fail("PAYROLL_SLIP_LIST_FAILED", error instanceof Error ? error.message : "Không đọc được phiếu lương."); }
}
'@
Replace-Exact $payrollRoutes $oldMySlips $newMySlips 'payroll period/self slip routes'

# ---- 4. Expose CRITICAL correction/payroll transitions only through verified AlumDoor app callbacks.
$router = Join-Path $worktree 'server\packages\frappe-api\src\router.ts'
$oldRouterInterface = @'
  /** AlumDoor-only native attendance scan transaction. */
  commitAlumdoorAttendanceScan?: (input: {
    station: string;
    nonceHash: string;
    deviceFingerprintHash?: string;
  }) => Promise<JsonObject>;
'@
$newRouterInterface = @'
  /** AlumDoor-only native attendance scan transaction. */
  commitAlumdoorAttendanceScan?: (input: {
    station: string;
    nonceHash: string;
    deviceFingerprintHash?: string;
  }) => Promise<JsonObject>;
  submitAlumdoorAttendanceCorrection?: (input: {
    workDate: string; segmentCode: string; requestedIn?: string; requestedOut?: string;
    reason: string; attachment?: string;
  }) => Promise<JsonObject>;
  reviewAlumdoorAttendanceCorrection?: (input: {
    request: string; action: "approve" | "reject"; note?: string;
  }) => Promise<JsonObject>;
  approveAlumdoorPayroll?: (input: { payrollEntry: string }) => Promise<JsonObject>;
'@
Replace-Exact $router $oldRouterInterface $newRouterInterface 'frappe router AlumDoor callback contract'

$oldRouterCases = @'
    case "metaforge.api.commit_alumdoor_attendance_scan":
      return methodResponse(await commitAlumdoorAttendanceScan(args, context));

    // The QR page needs a tiny, non-sensitive station/policy snapshot before it can
'@
$newRouterCases = @'
    case "metaforge.api.commit_alumdoor_attendance_scan":
      return methodResponse(await commitAlumdoorAttendanceScan(args, context));

    case "metaforge.api.submit_alumdoor_attendance_correction":
      return methodResponse(await submitAlumdoorAttendanceCorrection(args, context));

    case "metaforge.api.review_alumdoor_attendance_correction":
      return methodResponse(await reviewAlumdoorAttendanceCorrection(args, context));

    case "metaforge.api.approve_alumdoor_payroll":
      return methodResponse(await approveAlumdoorPayroll(args, context));

    // The QR page needs a tiny, non-sensitive station/policy snapshot before it can
'@
Replace-Exact $router $oldRouterCases $newRouterCases 'frappe router AlumDoor method cases'

$routerAnchor = 'async function alumdoorAttendanceQrConfig(args: FrappeArgs, context: FrappeRouterContext): Promise<JsonObject> {'
$routerHelpers = @'
async function submitAlumdoorAttendanceCorrection(args: FrappeArgs, context: FrappeRouterContext): Promise<JsonObject> {
  if (context.appCallbackAppId !== "alumdoor" || !context.submitAlumdoorAttendanceCorrection) {
    throw errors.permission("AlumDoor attendance correction accepts only the verified AlumDoor app callback.");
  }
  const requestedIn = args.text("requested_in");
  const requestedOut = args.text("requested_out");
  const attachment = args.text("attachment");
  return context.submitAlumdoorAttendanceCorrection({
    workDate: args.requireText("work_date", 10),
    segmentCode: args.requireText("segment_code", 16),
    ...(requestedIn ? { requestedIn } : {}),
    ...(requestedOut ? { requestedOut } : {}),
    reason: args.requireText("reason", 1000),
    ...(attachment ? { attachment } : {}),
  });
}

async function reviewAlumdoorAttendanceCorrection(args: FrappeArgs, context: FrappeRouterContext): Promise<JsonObject> {
  if (context.appCallbackAppId !== "alumdoor" || !context.reviewAlumdoorAttendanceCorrection) {
    throw errors.permission("AlumDoor attendance correction review accepts only the verified AlumDoor app callback.");
  }
  const action = args.requireText("action", 16);
  if (action !== "approve" && action !== "reject") throw errors.validation("action must be approve or reject");
  const note = args.text("note");
  return context.reviewAlumdoorAttendanceCorrection({
    request: args.requireText("request", 320),
    action,
    ...(note ? { note } : {}),
  });
}

async function approveAlumdoorPayroll(args: FrappeArgs, context: FrappeRouterContext): Promise<JsonObject> {
  if (context.appCallbackAppId !== "alumdoor" || !context.approveAlumdoorPayroll) {
    throw errors.permission("AlumDoor payroll approval accepts only the verified AlumDoor app callback.");
  }
  return context.approveAlumdoorPayroll({ payrollEntry: args.requireText("payroll_entry", 320) });
}

'@
$routerText = [IO.File]::ReadAllText($router)
if (-not $routerText.Contains('async function submitAlumdoorAttendanceCorrection(')) {
  if (-not $routerText.Contains($routerAnchor)) { throw 'Router helper anchor missing' }
  Write-Utf8 $router ($routerText.Replace($routerAnchor, "$routerHelpers$routerAnchor"))
}

# ---- 5. Bind router callbacks to the existing Aggregate DO coordinator methods.
$tenant = Join-Path $worktree 'server\apps\tenant-worker\src\index-core-base.ts'
$oldStub = @'
  commitAlumDoorAttendanceScan(input: {
    tenantId: string;
    actor: Actor;
    station: string;
    nonceHash: string;
    deviceFingerprintHash?: string;
  }): Promise<JsonObject>;
'@
$newStub = @'
  commitAlumDoorAttendanceScan(input: {
    tenantId: string;
    actor: Actor;
    station: string;
    nonceHash: string;
    deviceFingerprintHash?: string;
  }): Promise<JsonObject>;
  submitAlumDoorAttendanceCorrection(input: {
    tenantId: string; actor: Actor; workDate: string; segmentCode: string;
    requestedIn?: string; requestedOut?: string; reason: string; attachment?: string;
  }): Promise<JsonObject>;
  reviewAlumDoorAttendanceCorrection(input: {
    tenantId: string; actor: Actor; request: string; action: "approve" | "reject"; note?: string;
  }): Promise<JsonObject>;
  approveAlumDoorPayroll(input: { tenantId: string; actor: Actor; payrollEntry: string }): Promise<JsonObject>;
'@
Replace-Exact $tenant $oldStub $newStub 'tenant AggregateStub attendance/payroll methods'

$oldContextTail = @'
      return stub.commitAlumDoorAttendanceScan({
        tenantId,
        actor,
        station: input.station,
        nonceHash: input.nonceHash,
        ...(input.deviceFingerprintHash ? { deviceFingerprintHash: input.deviceFingerprintHash } : {}),
      });
    },
    now,
'@
$newContextTail = @'
      return stub.commitAlumDoorAttendanceScan({
        tenantId,
        actor,
        station: input.station,
        nonceHash: input.nonceHash,
        ...(input.deviceFingerprintHash ? { deviceFingerprintHash: input.deviceFingerprintHash } : {}),
      });
    },
    async submitAlumdoorAttendanceCorrection(input: {
      workDate: string; segmentCode: string; requestedIn?: string; requestedOut?: string;
      reason: string; attachment?: string;
    }): Promise<JsonObject> {
      const stub = env.AGGREGATES.getByName(`attendance-correction:${tenantId}:${encodeURIComponent(actor.user_id)}`) as AggregateStub;
      return stub.submitAlumDoorAttendanceCorrection({ tenantId, actor, ...input });
    },
    async reviewAlumdoorAttendanceCorrection(input: {
      request: string; action: "approve" | "reject"; note?: string;
    }): Promise<JsonObject> {
      const stub = env.AGGREGATES.getByName(`attendance-correction:${tenantId}:${encodeURIComponent(input.request)}`) as AggregateStub;
      return stub.reviewAlumDoorAttendanceCorrection({ tenantId, actor, ...input });
    },
    async approveAlumdoorPayroll(input: { payrollEntry: string }): Promise<JsonObject> {
      const stub = env.AGGREGATES.getByName(`payroll:${tenantId}:${encodeURIComponent(input.payrollEntry)}`) as AggregateStub;
      return stub.approveAlumDoorPayroll({ tenantId, actor, payrollEntry: input.payrollEntry });
    },
    now,
'@
Replace-Exact $tenant $oldContextTail $newContextTail 'tenant router callback binding'

# ---- 6. Bootstrap dependencies without touching either committed lockfile.
Push-Location $worktree
try {
  if (-not (Test-Path '.\node_modules\.pnpm')) {
    pnpm install --no-frozen-lockfile --lockfile=false
    Assert-Exit 'root dependency install'
  }
  if (-not (Test-Path '.\client\apps\runtime\node_modules\.bin\vite.cmd')) {
    pnpm --dir client install --no-frozen-lockfile --lockfile=false
    Assert-Exit 'client dependency install'
  }

  pnpm run server:build
  Assert-Exit 'server build'
  pnpm --dir client --filter runtime build
  Assert-Exit 'runtime build'

  node server/scripts/pack-app.mjs server/apps-src/alumdoor-attendance --check
  Assert-Exit 'attendance app package check'
finally { Pop-Location }

# Persist source fixes to the feature branch after gates are green.
git -C $worktree add -- client/apps/runtime/src/main-base.tsx server/apps-src/alumdoor-worker/src/index.ts server/apps-src/alumdoor-worker/src/payroll-routes.ts server/packages/frappe-api/src/router.ts server/apps/tenant-worker/src/index-core-base.ts
$staged = git -C $worktree diff --cached --name-only
if ($staged) {
  git -C $worktree -c user.name='Forge Local Runner' -c user.email='local-runner@forge.invalid' commit -m 'fix(attendance): wire operational payroll runtime end to end'
  Assert-Exit 'feature commit'
  git -C $worktree push origin $target
  if ($LASTEXITCODE -ne 0) { Write-Warning 'Feature push failed; local verified commit is preserved in the worktree.' }
}

# ---- 7. Run feature backend against the existing LOCAL D1 state only.
$sharedVars = Join-Path $shared 'server\apps\tenant-worker\.dev.vars'
$featureVars = Join-Path $worktree 'server\apps\tenant-worker\.dev.vars'
if (-not (Test-Path $sharedVars)) { throw 'Shared local .dev.vars is missing' }
Copy-Item $sharedVars $featureVars -Force

$persist = Join-Path $shared 'server\apps\tenant-worker\.wrangler\state'
if (-not (Test-Path $persist)) { throw "Shared local Wrangler state is missing: $persist" }

Stop-Port 8799
Stop-Port $backendPort
Stop-Port $frontendPort
Start-Sleep -Seconds 1

$backendOut = Join-Path $devDir 'backend-18899.out.log'
$backendErr = Join-Path $devDir 'backend-18899.err.log'
$frontOut = Join-Path $devDir 'frontend-5173.out.log'
$frontErr = Join-Path $devDir 'frontend-5173.err.log'
Remove-Item $backendOut,$backendErr,$frontOut,$frontErr -Force -ErrorAction SilentlyContinue
[Environment]::SetEnvironmentVariable('RUNNER_TRACKING_ID', '', 'Process')
$backendArgs = @('/d','/s','/c', "cd /d $worktree\server && npx wrangler dev --config apps/tenant-worker/wrangler.jsonc --port $backendPort --local --persist-to `"$persist`"")
$backend = Start-Process -FilePath 'cmd.exe' -ArgumentList $backendArgs -WorkingDirectory (Join-Path $worktree 'server') -RedirectStandardOutput $backendOut -RedirectStandardError $backendErr -WindowStyle Hidden -PassThru
Write-Host "FEATURE_BACKEND_LAUNCHER_PID=$($backend.Id)"
try { Wait-Http "http://127.0.0.1:$backendPort/health" 60 | Out-Null }
catch {
  if (Test-Path $backendOut) { Get-Content $backendOut -Tail 160 }
  if (Test-Path $backendErr) { Get-Content $backendErr -Tail 160 }
  throw
}

# Install/upgrade only LOCAL metadata for the dedicated attendance/payroll app.
Push-Location (Join-Path $worktree 'server')
try {
  $env:FORGE_ADMIN_PASSWORD = 'local-dev-password-1'
  node scripts/forge-app.mjs apps-src/alumdoor-attendance --origin "http://127.0.0.1:$backendPort" --admin dev@example.com --provision-standard
  Assert-Exit 'install attendance payroll app locally'
finally { Pop-Location }

# Assert the server-side manifest contains the new operational entries.
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:$backendPort/api/method/login" -WebSession $session -ContentType 'application/json' -Body (@{ usr='dev@example.com'; pwd='local-dev-password-1' } | ConvertTo-Json) | Out-Null
$manifestResponse = Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:$backendPort/api/method/metaforge.api.get_app_manifest?app=alumdoor-attendance" -WebSession $session
$manifest = $manifestResponse.message
$keys = @($manifest.nav | ForEach-Object { $_.key })
foreach ($required in @('alumdoor-attendance:today','alumdoor-attendance:month','alumdoor-attendance:exceptions','AlumDoor Pay Profile','alumdoor-attendance:payroll-run','alumdoor-attendance:payroll-my-slips')) {
  if ($keys -notcontains $required) { throw "Installed manifest missing nav key: $required" }
}
Write-Host "ATTENDANCE_MANIFEST_NAV=$($keys -join ',')"

# ---- 8. Start the feature runtime on 5173, explicitly pointed at feature backend 18899.
$frontCommand = "cd /d $worktree && set VITE_FORGE_BACKEND=http://127.0.0.1:$backendPort&& pnpm --dir client --filter runtime dev -- --host 0.0.0.0 --port $frontendPort --strictPort"
$front = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/d','/s','/c',$frontCommand) -WorkingDirectory $worktree -RedirectStandardOutput $frontOut -RedirectStandardError $frontErr -WindowStyle Hidden -PassThru
Write-Host "FEATURE_FRONTEND_LAUNCHER_PID=$($front.Id)"
try { Wait-Http "http://127.0.0.1:$frontendPort/?app=alumdoor-attendance" 45 | Out-Null }
catch {
  if (Test-Path $frontOut) { Get-Content $frontOut -Tail 160 }
  if (Test-Path $frontErr) { Get-Content $frontErr -Tail 160 }
  throw
}

foreach ($route in @('today','month','exceptions','payroll-run','payroll-my-slips')) {
  $encoded = [Uri]::EscapeDataString("alumdoor-attendance:$route")
  $probe = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$frontendPort/x/$encoded?app=alumdoor-attendance" -TimeoutSec 5
  if ($probe.StatusCode -ne 200) { throw "Frontend route $route returned $($probe.StatusCode)" }
}

$backendListener = Get-NetTCPConnection -LocalPort $backendPort -State Listen | Select-Object -First 1
$frontendListener = Get-NetTCPConnection -LocalPort $frontendPort -State Listen | Select-Object -First 1
Write-Host "FEATURE_BACKEND_PID=$($backendListener.OwningProcess)"
Write-Host "FEATURE_FRONTEND_PID=$($frontendListener.OwningProcess)"
Write-Host "ATTENDANCE_URL=http://localhost:$frontendPort/?app=alumdoor-attendance"
Write-Host "PAYROLL_URL=http://localhost:$frontendPort/x/alumdoor-attendance%3Apayroll-run?app=alumdoor-attendance"
Write-Host 'ATTENDANCE_PAYROLL_LOCAL_E2E_READY'
