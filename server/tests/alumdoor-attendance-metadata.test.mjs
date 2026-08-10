import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { parseAppManifest } from "../dist/packages/app-registry/src/index.js";
import { readAppSource } from "../scripts/lib/read-app-source.mjs";

const source = path.resolve(import.meta.dirname, "..", "apps-src", "alumdoor-attendance");

function field(meta, fieldname) {
  return meta.fields.find((entry) => entry.fieldname === fieldname);
}

function permission(meta, role) {
  return meta.permissions.find((entry) => entry.role === role);
}

test("AlumDoor attendance metadata is an isolated HRM-dependent package", async () => {
  const pkg = await readAppSource(source);
  const manifest = parseAppManifest(pkg);

  assert.equal(manifest.id, "alumdoor-attendance");
  assert.equal(manifest.version, "0.1.2");
  assert.deepEqual(manifest.requires, [{ id: "hrm", version: "1.8.0" }]);
  assert.deepEqual(
    manifest.doctypes.map((meta) => meta.name).sort(),
    [
      "AlumDoor Attendance Day",
      "AlumDoor Attendance Policy",
      "AlumDoor Attendance Segment",
      "AlumDoor QR Station",
    ],
  );
  assert.deepEqual(
    manifest.roles.map((entry) => entry.role).sort(),
    ["AlumDoor Attendance Manager", "AlumDoor Attendance Viewer", "AlumDoor QR System"],
  );
  assert.deepEqual(
    manifest.custom_fields.map((entry) => entry.fieldname).sort(),
    [
      "alu_capture_source",
      "alu_device_fingerprint_hash",
      "alu_segment_code",
      "alu_station",
      "alu_token_nonce_hash",
      "alu_work_date",
    ],
    "slice 1 only overlays the immutable source log needed to trace one QR scan",
  );
  assert.ok(manifest.custom_fields.every((entry) => entry.dt === "Employee Checkin"), "slice 1 must not overlay Attendance or Payroll DocTypes");
  assert.ok(manifest.externalDocTypes.some((entry) => entry.name === "Employee Checkin" && entry.app === "hrm"));
  assert.ok(manifest.nav.some((entry) => entry.kind === "experience" && entry.key === "alumdoor-attendance:kiosk"), "the installed package must expose the QR kiosk through the runtime-supported experience");
});

test("AlumDoor attendance daily projection is system-written and manager read-only", async () => {
  const manifest = parseAppManifest(await readAppSource(source));
  const day = manifest.doctypes.find((meta) => meta.name === "AlumDoor Attendance Day");
  assert.equal(day?.kind, "transaction");
  assert.equal(day?.is_submittable, false);
  assert.equal(field(day, "segments")?.fieldtype, "Table");
  assert.equal(field(day, "segments")?.options, "AlumDoor Attendance Segment");
  assert.deepEqual(field(day, "state")?.options, "open\ncomplete\nexception\napproved\nlocked");

  const segment = manifest.doctypes.find((meta) => meta.name === "AlumDoor Attendance Segment");
  assert.match(String(field(segment, "state")?.options), /(?:^|\n)empty(?:\n|$)/);

  const qrSystem = permission(day, "AlumDoor QR System");
  assert.equal(qrSystem?.create, true);
  assert.equal(qrSystem?.write, true);
  for (const role of ["AlumDoor Attendance Viewer", "AlumDoor Attendance Manager", "HR Manager", "System Manager"]) {
    assert.notEqual(permission(day, role)?.create, true, `${role} must not create a daily projection`);
    assert.notEqual(permission(day, role)?.write, true, `${role} must not modify a daily projection`);
  }
});

test("AlumDoor QR station stores a version reference, never signing material", async () => {
  const manifest = parseAppManifest(await readAppSource(source));
  const station = manifest.doctypes.find((meta) => meta.name === "AlumDoor QR Station");
  assert.equal(field(station, "secret_version")?.default, 1);
  assert.equal(field(station, "secret_version")?.read_only, true);
  assert.equal(field(station, "secret_version")?.hidden, true);
  assert.equal(field(station, "secret_version")?.editMode, "hidden");
  assert.equal(field(station, "secret_version")?.serverEnforced, true);
  assert.equal(field(station, "policy")?.options, "AlumDoor Attendance Policy");
  assert.equal(station?.fields.some((entry) => /secret|token|private.?key/i.test(entry.fieldname) && entry.fieldname !== "secret_version"), false);
});

test("Attendance policy is approved through its workflow before QR can use it", async () => {
  const manifest = parseAppManifest(await readAppSource(source));
  const policy = manifest.doctypes.find((meta) => meta.name === "AlumDoor Attendance Policy");
  const workflow = manifest.workflows.find((entry) => entry.document_type === "AlumDoor Attendance Policy");

  assert.equal(policy?.is_submittable, true);
  assert.equal(field(policy, "policy_status")?.read_only, false);
  assert.equal(permission(policy, "AlumDoor Attendance Manager")?.submit, true);
  assert.equal(workflow?.state_field, "policy_status");
  assert.deepEqual(workflow?.states.map((state) => [state.state, state.docstatus]), [
    ["draft", 0],
    ["approved", 1],
    ["retired", 2],
  ]);
  assert.ok(workflow?.transitions.some((entry) => entry.state === "draft" && entry.next_state === "approved"));
});
