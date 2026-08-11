import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ControllerRegistry, DocumentKernel, InMemoryMutationStore } from "../dist/packages/document-kernel/src/index.js";
import {
  GenericMetadataController, InMemoryMetadataStore, MetadataPermissionService,
} from "../dist/packages/frappe-model/src/index.js";
import { makeCommand } from "../dist/packages/test-harness/src/index.js";
import { parseAppManifest } from "../dist/packages/app-registry/src/index.js";
import { readAppSource } from "../scripts/lib/read-app-source.mjs";

const NOW = "2026-08-10T08:00:00.000Z";
const TENANT = "attendance-workflow";
const POLICY = "AlumDoor Attendance Policy";
const source = path.resolve(import.meta.dirname, "..", "apps-src", "alumdoor-attendance");
const manager = { user_id: "attendance.manager@example.com", roles: ["AlumDoor Attendance Manager"] };

async function setup({ policyStatusReadOnly, legacyQrTtl = false } = {}) {
  const manifest = parseAppManifest(await readAppSource(source));
  const metadata = new InMemoryMetadataStore();
  for (const meta of manifest.doctypes) {
    const copied = structuredClone(meta);
    if (copied.name === POLICY && policyStatusReadOnly !== undefined) {
      const state = copied.fields.find((field) => field.fieldname === "policy_status");
      assert.ok(state, "policy must expose its workflow state");
      state.read_only = policyStatusReadOnly;
    }
    if (copied.name === POLICY && legacyQrTtl) {
      copied.fields.push({
        fieldname: "qr_ttl_seconds",
        label: "Legacy QR TTL",
        fieldtype: "Int",
        default: 15,
        allow_on_submit: true,
      });
    }
    await metadata.putDocType(TENANT, copied, "Administrator", NOW);
  }
  const workflow = manifest.workflows.find((entry) => entry.document_type === POLICY);
  assert.ok(workflow, "policy must ship an active workflow");
  await metadata.putWorkflow(TENANT, workflow, "Administrator", NOW);

  const store = new InMemoryMutationStore();
  store.seedMaster("Company", "ALUMDOOR", TENANT, { company_name: "AlumDoor" });
  const kernel = new DocumentKernel(
    new ControllerRegistry().setFallback(new GenericMetadataController(metadata)),
    store,
    new MetadataPermissionService(metadata),
    () => NOW,
  );
  return { kernel, metadata, store };
}

async function execute(kernel, input) {
  return kernel.execute(await makeCommand({ tenantId: TENANT, actor: manager, ...input }));
}

async function createDraft(kernel) {
  await execute(kernel, {
    commandId: "attendance-policy-create",
    doctype: POLICY,
    name: "ATP-2026-00001",
    action: "create",
    expectedVersion: null,
    document: {
      policy_name: "Ca chuẩn AlumDoor",
      company: "ALUMDOOR",
      effective_from: "2026-08-10",
    },
  });
}

test("Attendance Policy is created draft then approved through the real metadata workflow", async () => {
  const { kernel, store } = await setup();
  await createDraft(kernel);

  const draft = await store.getDocument(TENANT, POLICY, "ATP-2026-00001");
  assert.equal(draft.docstatus, 0);
  assert.equal(draft.status, "draft");
  assert.equal(draft.data.policy_status, "draft");

  await execute(kernel, {
    commandId: "attendance-policy-approve",
    doctype: POLICY,
    name: draft.name,
    action: "submit",
    expectedVersion: draft.version,
    document: { ...draft.data, policy_status: "approved" },
  });

  const approved = await store.getDocument(TENANT, POLICY, draft.name);
  assert.equal(approved.docstatus, 1);
  assert.equal(approved.status, "approved");
  assert.equal(approved.data.policy_status, "approved");
});

test("a writable policy_status enables the expected GenericMetadataController transition", async () => {
  const { kernel, store } = await setup({ policyStatusReadOnly: false });
  await createDraft(kernel);
  const draft = await store.getDocument(TENANT, POLICY, "ATP-2026-00001");

  await execute(kernel, {
    commandId: "attendance-policy-approve-writable",
    doctype: POLICY,
    name: draft.name,
    action: "submit",
    expectedVersion: draft.version,
    document: { ...draft.data, policy_status: "approved" },
  });

  const approved = await store.getDocument(TENANT, POLICY, draft.name);
  assert.equal(approved.docstatus, 1);
  assert.equal(approved.data.policy_status, "approved");
});

test("an approved policy can save allow_on_submit fields without leaving approved state", async () => {
  const { kernel, store } = await setup();
  await createDraft(kernel);
  const draft = await store.getDocument(TENANT, POLICY, "ATP-2026-00001");
  await execute(kernel, {
    commandId: "attendance-policy-approve-before-edit",
    doctype: POLICY,
    name: draft.name,
    action: "submit",
    expectedVersion: draft.version,
    document: { ...draft.data, policy_status: "approved" },
  });

  const approved = await store.getDocument(TENANT, POLICY, draft.name);
  await execute(kernel, {
    commandId: "attendance-policy-edit-approved",
    doctype: POLICY,
    name: approved.name,
    action: "save",
    expectedVersion: approved.version,
    document: {
      ...approved.data,
      duplicate_scan_window_seconds: 60,
      max_devices_per_employee: 2,
    },
  });

  const updated = await store.getDocument(TENANT, POLICY, draft.name);
  assert.equal(updated.docstatus, 1);
  assert.equal(updated.status, "approved");
  assert.equal(updated.data.policy_status, "approved");
  assert.equal(updated.data.duplicate_scan_window_seconds, 60);
  assert.equal(updated.data.max_devices_per_employee, 2);
});

test("saving after a metadata upgrade drops an unchanged retired field", async () => {
  const { kernel, metadata, store } = await setup({ legacyQrTtl: true });
  await createDraft(kernel);
  const draft = await store.getDocument(TENANT, POLICY, "ATP-2026-00001");
  await execute(kernel, {
    commandId: "attendance-policy-approve-legacy",
    doctype: POLICY,
    name: draft.name,
    action: "submit",
    expectedVersion: draft.version,
    document: { ...draft.data, policy_status: "approved" },
  });

  const approved = await store.getDocument(TENANT, POLICY, draft.name);
  assert.equal(approved.data.qr_ttl_seconds, 15);
  const upgradedMeta = await metadata.getDocType(TENANT, POLICY);
  upgradedMeta.fields = upgradedMeta.fields.filter((entry) => entry.fieldname !== "qr_ttl_seconds");
  await metadata.putDocType(TENANT, upgradedMeta, "Administrator", NOW);

  await execute(kernel, {
    commandId: "attendance-policy-save-after-upgrade",
    doctype: POLICY,
    name: approved.name,
    action: "save",
    expectedVersion: approved.version,
    document: {
      ...approved.data,
      duplicate_scan_window_seconds: 60,
      max_devices_per_employee: 2,
    },
  });

  const updated = await store.getDocument(TENANT, POLICY, approved.name);
  assert.equal(updated.docstatus, 1);
  assert.equal(updated.data.qr_ttl_seconds, undefined);
});

test("a read-only policy_status cannot advance a GenericMetadataController workflow", async () => {
  const { kernel, store } = await setup({ policyStatusReadOnly: true });
  await createDraft(kernel);
  const draft = await store.getDocument(TENANT, POLICY, "ATP-2026-00001");

  await assert.rejects(
    execute(kernel, {
      commandId: "attendance-policy-approve-read-only",
      doctype: POLICY,
      name: draft.name,
      action: "submit",
      expectedVersion: draft.version,
      document: { ...draft.data, policy_status: "approved" },
    }),
    (error) => error.code === "INVALID_LIFECYCLE_TRANSITION" && /Workflow action is required to submit from draft/.test(error.message),
  );
});
