import test from "node:test";
import assert from "node:assert/strict";
import { routeFrappeApi } from "../dist/packages/frappe-api/src/index.js";

const ACTOR = { user_id: "worker@example.com", roles: ["Employee"] };
const TENANT = "tenant-attendance-router";
const TRACE = "trace-attendance-router";
const METHODS = {
  scan: "metaforge.api.commit_alumdoor_attendance_scan",
  config: "metaforge.api.get_alumdoor_attendance_qr_config",
};

function methodRequest(method, body) {
  const url = new URL(`https://tenant.test/api/method/${method}`);
  return {
    url,
    request: new Request(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  };
}

function context(overrides = {}) {
  return {
    tenantId: TENANT,
    actor: ACTOR,
    traceId: TRACE,
    now: () => "2026-08-10T00:00:00.000Z",
    ...overrides,
  };
}

async function invoke(method, body, routerContext) {
  const { request, url } = methodRequest(method, body);
  const response = await routeFrappeApi(request, url, routerContext);
  assert.ok(response);
  return { response, body: await response.json() };
}

test("attendance-native methods reject browsers and every non-AlumDoor callback before touching a seam", async () => {
  for (const appCallbackAppId of [undefined, "purchase-qa"]) {
    const calls = { scan: 0, document: 0 };
    const routerContext = context({
      ...(appCallbackAppId ? { appCallbackAppId } : {}),
      async commitAlumdoorAttendanceScan() {
        calls.scan += 1;
        return { unexpected: true };
      },
      documents: {
        async getMasterRecordData() {
          calls.document += 1;
          return null;
        },
      },
    });

    for (const [method, body] of [
      [METHODS.scan, { station: "QR-XUONG-01", station_token_hash: "a".repeat(64), request_id: "12345678-1234-4234-9234-123456789012", latitude: 10, longitude: 106, accuracy: 10 }],
      [METHODS.config, { station: "QR-XUONG-01" }],
    ]) {
      const result = await invoke(method, body, routerContext);
      assert.equal(result.response.status, 403, `${method} / ${appCallbackAppId ?? "browser"}`);
      assert.equal(result.body.exc_type, "PermissionError");
    }
    assert.deepEqual(calls, { scan: 0, document: 0 }, `untrusted ${appCallbackAppId ?? "browser"}`);
  }
});

test("verified AlumDoor callback gets only the bounded scan and QR-config seams", async () => {
  const scanCalls = [];
  const documentCalls = [];
  const routerContext = context({
    appCallbackAppId: "alumdoor",
    async commitAlumdoorAttendanceScan(input) {
      scanCalls.push(input);
      return { segment: "SHIFT1", log_type: "IN", idempotent: false };
    },
    documents: {
      async getMasterRecordData(tenantId, doctype, name) {
        documentCalls.push({ tenantId, doctype, name });
        if (doctype === "AlumDoor QR Station" && name === "QR-XUONG-01") {
          return {
            station_code: "QR-XUONG-01",
            station_name: "Cổng xưởng 01",
            policy: "ATP-2026-00001",
            secret_version: 9,
            is_active: true,
            company: "Demo",
            branch: "BR-A",
            latitude: 10.7769,
            longitude: 106.7009,
            allowed_radius_m: 50,
            max_gps_accuracy_m: 50,
            private_station_note: "must not leave the router",
          };
        }
        if (doctype === "AlumDoor Attendance Policy" && name === "ATP-2026-00001") {
          return {
            policy_status: "approved",
            timezone: "Asia/Ho_Chi_Minh",
            duplicate_scan_window_seconds: 60,
            max_devices_per_employee: 2,
            effective_from: "2026-01-01",
            effective_to: "2026-12-31",
            private_policy_note: "must not leave the router",
          };
        }
        return null;
      },
    },
  });

  const scan = await invoke(METHODS.scan, {
    station: "QR-XUONG-01",
    station_token_hash: "AB".repeat(32),
    request_id: "12345678-1234-4234-9234-123456789012",
    latitude: 10.7769,
    longitude: 106.7009,
    accuracy: 12,
    device_id: "device_installation_0001",
    credential_hash: "CD".repeat(32),
    ignored_client_value: "not part of the native seam",
  }, routerContext);
  assert.equal(scan.response.status, 200);
  assert.deepEqual(scan.body.message, { segment: "SHIFT1", log_type: "IN", idempotent: false });
  assert.deepEqual(scanCalls, [{
    station: "QR-XUONG-01",
    stationTokenHash: "ab".repeat(32),
    requestId: "12345678-1234-4234-9234-123456789012",
    latitude: 10.7769,
    longitude: 106.7009,
    accuracy: 12,
    deviceId: "device_installation_0001",
    credentialHash: "cd".repeat(32),
  }]);
  assert.deepEqual(documentCalls, [], "scan must not gain generic document-read access");

  const config = await invoke(METHODS.config, {
    station: "QR-XUONG-01",
    ignored_client_value: "not part of the bounded config",
  }, routerContext);
  assert.equal(config.response.status, 200);
  assert.deepEqual(documentCalls, [
    { tenantId: TENANT, doctype: "AlumDoor QR Station", name: "QR-XUONG-01" },
    { tenantId: TENANT, doctype: "AlumDoor Attendance Policy", name: "ATP-2026-00001" },
  ]);
  assert.deepEqual(Object.keys(config.body.message).sort(), ["policy", "station"]);
  assert.deepEqual(Object.keys(config.body.message.station).sort(), [
    "allowed_radius_m", "branch", "company", "is_active", "latitude", "longitude", "max_gps_accuracy_m", "policy", "secret_version", "station_code", "station_name",
  ]);
  assert.deepEqual(Object.keys(config.body.message.policy).sort(), [
    "duplicate_scan_window_seconds", "effective_from", "effective_to", "max_devices_per_employee", "policy_status", "timezone",
  ]);
  assert.equal(config.body.message.station.private_station_note, undefined);
  assert.equal(config.body.message.policy.private_policy_note, undefined);
});
