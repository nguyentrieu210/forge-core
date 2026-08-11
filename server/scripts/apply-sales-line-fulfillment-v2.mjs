import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const write = (p, s) => fs.writeFileSync(new URL(p, root), s);

function ensureReplace(path, marker, before, after) {
  let source = read(path);
  if (source.includes(marker)) return;
  if (!source.includes(before)) throw new Error(`${path}: missing anchor for ${marker}`);
  source = source.replace(before, after);
  write(path, source);
}

ensureReplace(
  "packages/contracts/src/index.ts",
  "skip_legacy_projection?: boolean",
  `  /** Exact frozen package component, blank/undefined for a direct commercial line. */\n  package_component_key?: string;\n  /** Business posting timestamp used for progress and period reporting. */`,
  `  /** Exact frozen package component, blank/undefined for a direct commercial line. */\n  package_component_key?: string;\n  /** Package component rows are physical progress only and never enter legacy item-code progress. */\n  skip_legacy_projection?: boolean;\n  /** Business posting timestamp used for progress and period reporting. */`,
);

const memory = "packages/document-kernel/src/in-memory-store.ts";
ensureReplace(memory, "lineFulfillmentEntriesLength: number", `  fulfillmentEntriesLength: number;\n  procurementEntriesLength: number;`, `  fulfillmentEntriesLength: number;\n  lineFulfillmentEntriesLength: number;\n  procurementEntriesLength: number;`);
ensureReplace(memory, "private readonly lineFulfillmentEntries", `  private readonly fulfillmentEntries: FulfillmentEntry[] = [];\n  private readonly procurementEntries: ProcurementEntry[] = [];`, `  private readonly fulfillmentEntries: FulfillmentEntry[] = [];\n  private readonly lineFulfillmentEntries: FulfillmentEntry[] = [];\n  private readonly procurementEntries: ProcurementEntry[] = [];`);

let memorySource = read(memory);
const methodStart = memorySource.indexOf("  async getFulfilledLineQuantityMicros(");
if (methodStart < 0) throw new Error("in-memory source-line reader missing");
const methodEnd = memorySource.indexOf("\n  async ", methodStart + 10);
const currentMethod = memorySource.slice(methodStart, methodEnd);
if (!currentMethod.includes("this.lineFulfillmentEntries")) {
  const updated = currentMethod.replace("this.fulfillmentEntries", "this.lineFulfillmentEntries");
  memorySource = memorySource.slice(0, methodStart) + updated + memorySource.slice(methodEnd);
  write(memory, memorySource);
}

ensureReplace(
  memory,
  "const fulfillment = structuredClone(plan.fulfillment_entries)",
  `    this.paymentEntries.push(...structuredClone(plan.payment_entries));\n    this.fulfillmentEntries.push(...structuredClone(plan.fulfillment_entries));\n    this.procurementEntries.push(...structuredClone(plan.procurement_entries ?? []));`,
  `    this.paymentEntries.push(...structuredClone(plan.payment_entries));\n    const fulfillment = structuredClone(plan.fulfillment_entries);\n    this.lineFulfillmentEntries.push(...fulfillment.filter((line) => Boolean(line.sales_order_line_key)));\n    this.fulfillmentEntries.push(...fulfillment.filter((line) => !line.skip_legacy_projection));\n    this.procurementEntries.push(...structuredClone(plan.procurement_entries ?? []));`,
);
ensureReplace(memory, "lineFulfillmentEntriesLength: this.lineFulfillmentEntries.length", `      fulfillmentEntriesLength: this.fulfillmentEntries.length,\n      procurementEntriesLength: this.procurementEntries.length,`, `      fulfillmentEntriesLength: this.fulfillmentEntries.length,\n      lineFulfillmentEntriesLength: this.lineFulfillmentEntries.length,\n      procurementEntriesLength: this.procurementEntries.length,`);
ensureReplace(memory, "this.lineFulfillmentEntries.splice(checkpoint.lineFulfillmentEntriesLength)", `    this.fulfillmentEntries.splice(checkpoint.fulfillmentEntriesLength);\n    this.procurementEntries.splice(checkpoint.procurementEntriesLength);`, `    this.fulfillmentEntries.splice(checkpoint.fulfillmentEntriesLength);\n    this.lineFulfillmentEntries.splice(checkpoint.lineFulfillmentEntriesLength);\n    this.procurementEntries.splice(checkpoint.procurementEntriesLength);`);
ensureReplace(memory, "if (line.skip_legacy_projection) continue;", `    for (const line of plan.fulfillment_entries) {\n      const source = this.documents.get`, `    for (const line of plan.fulfillment_entries) {\n      if (line.skip_legacy_projection) continue;\n      const source = this.documents.get`);

const d1 = "packages/document-kernel/src/d1-store.ts";
ensureReplace(
  d1,
  "if (!line.skip_legacy_projection) {",
  `    for (const line of plan.fulfillment_entries) {\n      statements.push(database.prepare(\n        \`INSERT INTO sales_order_fulfillment_entries\n         (tenant_id,voucher_type,voucher_no,voucher_revision,line_key,sales_order,kind,item_code,qty_micros,posting_at)\n         VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)\`,\n      ).bind(\n        command.tenant_id, command.aggregate.doctype, command.aggregate.name, plan.document.version,\n        line.line_key, line.sales_order, line.kind, line.item_code, line.qty_micros, line.posting_at,\n      ));\n      if (line.sales_order_line_key) {`,
  `    for (const line of plan.fulfillment_entries) {\n      if (!line.skip_legacy_projection) {\n        statements.push(database.prepare(\n          \`INSERT INTO sales_order_fulfillment_entries\n           (tenant_id,voucher_type,voucher_no,voucher_revision,line_key,sales_order,kind,item_code,qty_micros,posting_at)\n           VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)\`,\n        ).bind(\n          command.tenant_id, command.aggregate.doctype, command.aggregate.name, plan.document.version,\n          line.line_key, line.sales_order, line.kind, line.item_code, line.qty_micros, line.posting_at,\n        ));\n      }\n      if (line.sales_order_line_key) {`,
);

ensureReplace(
  "packages/clouderp-selling/src/sales-order-downstream.ts",
  "skip_legacy_projection: kind === \"Delivery\"",
  `      ...(componentKey ? { package_component_key: componentKey } : {}),\n      posting_at: postingAt,`,
  `      ...(componentKey ? { package_component_key: componentKey, skip_legacy_projection: kind === "Delivery" } : {}),\n      posting_at: postingAt,`,
);

console.log("sales line fulfillment v2 patches applied");
