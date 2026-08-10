import test from "node:test";
import assert from "node:assert/strict";
import { errors } from "../dist/packages/core/src/index.js";
import { ControllerRegistry, DocumentKernel, InMemoryMutationStore } from "../dist/packages/document-kernel/src/index.js";
import { makeCommand } from "../dist/packages/test-harness/src/index.js";

const NOW = "2026-08-10T12:00:00.000Z";

function setup() {
  const registry = new ControllerRegistry();
  registry.register({
    doctype: "Bundle Test Doc",
    async buildPlan({ command, existing, nextVersion, now, reader }) {
      if (command.document.fail_prepare === true) {
        throw errors.validation("intentional bundle preparation failure");
      }
      const listed = await reader.listDocumentsByDoctype(command.tenant_id, command.aggregate.doctype);
      if (command.document.require_planned_document === true) {
        if (!existing || existing.version !== 1) {
          throw errors.validation("later command did not receive its planned predecessor");
        }
        if (!listed.some((document) => document.name === command.aggregate.name && document.version === 1)) {
          throw errors.validation("bundle reader did not expose its planned predecessor");
        }
      }
      const docstatus = command.action === "submit" ? 1 : command.action === "cancel" ? 2 : 0;
      return {
        command,
        document: {
          tenant_id: command.tenant_id,
          doctype: command.aggregate.doctype,
          name: command.aggregate.name,
          owner: existing?.owner ?? command.actor.user_id,
          docstatus,
          status: docstatus === 1 ? "Submitted" : docstatus === 2 ? "Cancelled" : "Draft",
          version: nextVersion,
          created_at: existing?.created_at ?? now,
          modified_at: now,
          data: {
            ...command.document,
            observed_existing_version: existing?.version ?? null,
            observed_listed_version: listed.find((document) => document.name === command.aggregate.name)?.version ?? null,
          },
          children: [],
        },
        gl_entries: [],
        stock_entries: [],
        payment_entries: [],
        fulfillment_entries: [],
        events: [],
        result: { name: command.aggregate.name, version: nextVersion },
      };
    },
  });
  const store = new InMemoryMutationStore();
  return { store, kernel: new DocumentKernel(registry, store, { assert() {} }, () => NOW) };
}

test("ordered bundle supports create then submit on the same aggregate and replays deterministically", async () => {
  const { store, kernel } = setup();
  const create = await makeCommand({
    commandId: "bundle-create",
    doctype: "Bundle Test Doc",
    name: "BUNDLE-001",
    action: "create",
    expectedVersion: null,
    document: { label: "draft" },
  });
  const submit = await makeCommand({
    commandId: "bundle-submit",
    doctype: "Bundle Test Doc",
    name: "BUNDLE-001",
    action: "submit",
    expectedVersion: 1,
    document: { label: "submitted", require_planned_document: true },
  });

  const first = await kernel.executeBundle({ commands: [create, submit] });
  assert.deepEqual(first.map((receipt) => receipt.aggregate_version), [1, 2]);
  const saved = await store.getDocument("demo", "Bundle Test Doc", "BUNDLE-001");
  assert.equal(saved?.docstatus, 1);
  assert.equal(saved?.version, 2);
  assert.equal(saved?.data.observed_existing_version, 1);
  assert.equal(saved?.data.observed_listed_version, 1);

  const replay = await kernel.executeBundle({ commands: [create, submit] });
  assert.deepEqual(replay, first);
  assert.equal(store.snapshot().receipts.length, 2);
});

test("a later preparation failure leaves every document and receipt unpersisted", async () => {
  const { store, kernel } = setup();
  const first = await makeCommand({
    commandId: "bundle-prepare-first",
    doctype: "Bundle Test Doc",
    name: "BUNDLE-FAIL-1",
    action: "create",
    expectedVersion: null,
    document: { label: "must not persist" },
  });
  const second = await makeCommand({
    commandId: "bundle-prepare-second",
    doctype: "Bundle Test Doc",
    name: "BUNDLE-FAIL-2",
    action: "create",
    expectedVersion: null,
    document: { fail_prepare: true },
  });

  await assert.rejects(
    kernel.executeBundle({ commands: [first, second] }),
    (error) => error.code === "VALIDATION_ERROR" && /preparation failure/.test(error.message),
  );
  assert.equal(store.snapshot().documents.length, 0);
  assert.equal(store.snapshot().receipts.length, 0);
});

test("a partially committed receipt set is rejected instead of running the missing command", async () => {
  const { store, kernel } = setup();
  const alreadyCommitted = await makeCommand({
    commandId: "bundle-incomplete-first",
    doctype: "Bundle Test Doc",
    name: "BUNDLE-INCOMPLETE-1",
    action: "create",
    expectedVersion: null,
    document: { label: "already committed separately" },
  });
  const missing = await makeCommand({
    commandId: "bundle-incomplete-second",
    doctype: "Bundle Test Doc",
    name: "BUNDLE-INCOMPLETE-2",
    action: "create",
    expectedVersion: null,
    document: { label: "must remain absent" },
  });
  await kernel.execute(alreadyCommitted);

  await assert.rejects(
    kernel.executeBundle({ commands: [alreadyCommitted, missing] }),
    (error) => error.code === "VALIDATION_ERROR" && /incomplete receipt set/.test(error.message),
  );
  assert.equal(await store.getDocument("demo", "Bundle Test Doc", "BUNDLE-INCOMPLETE-2"), null);
  assert.equal(store.snapshot().receipts.length, 1);
});
