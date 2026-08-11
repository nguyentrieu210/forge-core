import fs from "node:fs";

const root = new URL("../", import.meta.url);

function file(path) { return new URL(path, root); }
function read(path) { return fs.readFileSync(file(path), "utf8"); }
function write(path, value) { fs.writeFileSync(file(path), value); }
function replaceOnce(path, before, after) {
  const current = read(path);
  if (current.includes(after)) return;
  const count = current.split(before).length - 1;
  if (count !== 1) throw new Error(`${path}: expected one patch anchor, found ${count}`);
  write(path, current.replace(before, after));
}

replaceOnce(
  "packages/clouderp-selling/src/sales-package-resolver.ts",
  `const factorMicros = integer(row.factor_micros) || toScaledInt(row.factor ?? "1", 6, "Sales Package component factor");\n  const qtyMicros = integer(row.qty_micros) || toScaledInt(row.qty ?? "0", 6, "Sales Package component qty");`,
  `const factorMicros = integer(row.factor_micros) || toScaledInt(String(row.factor ?? "1"), 6, "Sales Package component factor");\n  const qtyMicros = integer(row.qty_micros) || toScaledInt(String(row.qty ?? "0"), 6, "Sales Package component qty");`,
);

replaceOnce(
  "packages/contracts/src/index.ts",
  `export interface FulfillmentEntry {\n  line_key: string;\n  sales_order: string;\n  kind: "Delivery" | "Billing";\n  item_code: string;\n  qty_micros: number;\n  /** Business posting timestamp used for progress and period reporting. */\n  posting_at: string;\n}`,
  `export interface FulfillmentEntry {\n  line_key: string;\n  sales_order: string;\n  kind: "Delivery" | "Billing";\n  item_code: string;\n  qty_micros: number;\n  /** Exact source commercial line. New SO-derived Delivery/Billing writes always populate it. */\n  sales_order_line_key?: string;\n  /** Exact frozen package component, blank/undefined for a direct commercial line. */\n  package_component_key?: string;\n  /** Business posting timestamp used for progress and period reporting. */\n  posting_at: string;\n}`,
);

replaceOnce(
  "packages/document-kernel/src/store.ts",
  `export interface SalesFulfillmentReader {\n  getFulfilledQuantityMicros(tenantId: string, salesOrder: string, kind?: "Delivery" | "Billing", itemCode?: string): Promise<number>;\n}`,
  `export interface SalesFulfillmentReader {\n  getFulfilledQuantityMicros(tenantId: string, salesOrder: string, kind?: "Delivery" | "Billing", itemCode?: string): Promise<number>;\n  /** Source-line/component progress. Never aggregate duplicate commercial rows by item_code. */\n  getFulfilledLineQuantityMicros(\n    tenantId: string,\n    salesOrder: string,\n    kind: "Delivery" | "Billing",\n    salesOrderLineKey: string,\n    packageComponentKey?: string,\n  ): Promise<number>;\n}`,
);

const memoryAnchor = `  async getProcuredQuantityMicros(\n    tenantId: string,\n    purchaseOrder: string,`;
const memoryMethod = `  async getFulfilledLineQuantityMicros(\n    tenantId: string,\n    salesOrder: string,\n    kind: "Delivery" | "Billing",\n    salesOrderLineKey: string,\n    packageComponentKey?: string,\n  ): Promise<number> {\n    return this.fulfillmentEntries\n      .filter((line) => line.sales_order === salesOrder\n        && line.kind === kind\n        && line.sales_order_line_key === salesOrderLineKey\n        && (packageComponentKey === undefined || (line.package_component_key ?? "") === packageComponentKey))\n      .reduce((total, line) => total + line.qty_micros, 0);\n  }\n\n`;
replaceOnce("packages/document-kernel/src/in-memory-store.ts", memoryAnchor, memoryMethod + memoryAnchor);

const d1Anchor = `  async getProcuredQuantityMicros(\n    tenantId: string,\n    purchaseOrder: string,`;
const d1Method = `  async getFulfilledLineQuantityMicros(\n    tenantId: string,\n    salesOrder: string,\n    kind: "Delivery" | "Billing",\n    salesOrderLineKey: string,\n    packageComponentKey?: string,\n  ): Promise<number> {\n    const conditions = ["tenant_id=?1", "sales_order=?2", "kind=?3", "sales_order_line_key=?4"];\n    const values: unknown[] = [tenantId, salesOrder, kind, salesOrderLineKey];\n    if (packageComponentKey !== undefined) {\n      conditions.push(\`package_component_key=?\${values.length + 1}\`);\n      values.push(packageComponentKey);\n    }\n    const row = await this.writer.prepare(\n      \`SELECT COALESCE(SUM(qty_micros),0) AS total FROM sales_line_fulfillment_entries WHERE \${conditions.join(" AND ")}\`,\n    ).bind(...values).first<{ total: number }>();\n    return Number(row?.total ?? 0);\n  }\n\n`;
replaceOnce("packages/document-kernel/src/d1-store.ts", d1Anchor, d1Method + d1Anchor);

replaceOnce(
  "packages/document-kernel/src/d1-store.ts",
  `        line.line_key, line.sales_order, line.kind, line.item_code, line.qty_micros, line.posting_at,\n      ));\n    }\n    for (const line of plan.procurement_entries ?? []) {`,
  `        line.line_key, line.sales_order, line.kind, line.item_code, line.qty_micros, line.posting_at,\n      ));\n      if (line.sales_order_line_key) {\n        statements.push(database.prepare(\n          \`INSERT INTO sales_line_fulfillment_entries\n           (tenant_id,line_key,sales_order,sales_order_line_key,kind,package_component_key,item_code,qty_micros,posting_at)\n           VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9)\`,\n        ).bind(\n          command.tenant_id, line.line_key, line.sales_order, line.sales_order_line_key, line.kind,\n          line.package_component_key ?? "", line.item_code, line.qty_micros, line.posting_at,\n        ));\n      }\n    }\n    for (const line of plan.procurement_entries ?? []) {`,
);

console.log("sales line fulfillment contract patches applied");
