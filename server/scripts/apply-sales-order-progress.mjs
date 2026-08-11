import fs from "node:fs";

const root = new URL("../", import.meta.url);
function patch(path, before, after, label) {
  const target = new URL(path, root);
  let source = fs.readFileSync(target, "utf8");
  if (source.includes(after)) return;
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  source = source.replace(before, after);
  fs.writeFileSync(target, source);
}

for (const path of ["packages/document-kernel/src/in-memory-store.ts", "packages/document-kernel/src/d1-store.ts"]) {
  patch(
    path,
    `import { deriveDeliveryNoteStatus, deriveO2CStatus } from "./status.js";`,
    `import { deriveDeliveryNoteStatus, deriveO2CStatus } from "./status.js";\nimport { deriveSalesOrderProgress } from "./sales-order-progress.js";`,
    `${path} progress import`,
  );
}

const memoryBefore = `    if (document.doctype === "Sales Order") {\n      const items = Array.isArray(document.data.items) ? document.data.items : [];\n      const ordered = items.reduce<number>((sum, value) => {\n        if (!value || typeof value !== "object" || Array.isArray(value)) return sum;\n        const row = value as JsonObject;\n        return sum + (typeof row.qty_micros === "number" ? row.qty_micros : toScaledInt(String(row.qty ?? 0), 6));\n      }, 0);\n      if (ordered > 0) {\n        let delivered = 0;\n        let billed = 0;\n        for (const value of items) {\n          if (!value || typeof value !== "object" || Array.isArray(value)) continue;\n          const row = value as JsonObject;\n          const itemCode = String(row.item_code ?? "");\n          delivered += await this.getFulfilledQuantityMicros(document.tenant_id, document.name, "Delivery", itemCode);\n          billed += await this.getFulfilledQuantityMicros(document.tenant_id, document.name, "Billing", itemCode);\n        }\n        const data = document.data as JsonObject;\n        const deliveredPercentage = (delivered * 100) / ordered;\n        const billedPercentage = (billed * 100) / ordered;\n        data.delivered_percentage = deliveredPercentage.toFixed(2);\n        data.billed_percentage = billedPercentage.toFixed(2);\n        if (document.docstatus === 1) {\n          document.status = deriveO2CStatus("Sales Order", document.docstatus, { deliveredPercentage, billedPercentage });\n        }\n      }\n    }`;
const commonAfter = `    if (document.doctype === "Sales Order") {\n      const items = Array.isArray(document.data.items) ? document.data.items : [];\n      const progress = await deriveSalesOrderProgress(items, {\n        getLine: (kind, rowKey, componentKey) => this.getFulfilledLineQuantityMicros(\n          document.tenant_id, document.name, kind, rowKey, componentKey,\n        ),\n        getLegacy: (kind, itemCode) => this.getFulfilledQuantityMicros(\n          document.tenant_id, document.name, kind, itemCode,\n        ),\n      });\n      if (progress.ordered_micros > 0) {\n        const data = document.data as JsonObject;\n        data.delivered_percentage = progress.delivered_percentage.toFixed(2);\n        data.billed_percentage = progress.billed_percentage.toFixed(2);\n        if (document.docstatus === 1) {\n          document.status = deriveO2CStatus("Sales Order", document.docstatus, {\n            deliveredPercentage: progress.delivered_percentage,\n            billedPercentage: progress.billed_percentage,\n          });\n        }\n      }\n    }`;
patch("packages/document-kernel/src/in-memory-store.ts", memoryBefore, commonAfter, "in-memory Sales Order progress");

const d1Before = `    if (document.doctype === "Sales Order") {\n      const items = Array.isArray(document.data.items) ? document.data.items : [];\n      let ordered = 0;\n      let delivered = 0;\n      let billed = 0;\n      for (const value of items) {\n        if (!value || typeof value !== "object" || Array.isArray(value)) continue;\n        const item = value as JsonObject;\n        const itemCode = String(item.item_code ?? "");\n        ordered += typeof item.qty_micros === "number" ? item.qty_micros : toScaledInt(String(item.qty ?? 0), 6);\n        delivered += await this.getFulfilledQuantityMicros(document.tenant_id, document.name, "Delivery", itemCode);\n        billed += await this.getFulfilledQuantityMicros(document.tenant_id, document.name, "Billing", itemCode);\n      }\n      if (ordered > 0) {\n        const data = document.data as JsonObject;\n        const deliveredPercentage = (delivered * 100) / ordered;\n        const billedPercentage = (billed * 100) / ordered;\n        data.delivered_percentage = deliveredPercentage.toFixed(2);\n        data.billed_percentage = billedPercentage.toFixed(2);\n        if (document.docstatus === 1) {\n          document.status = deriveO2CStatus("Sales Order", document.docstatus, { deliveredPercentage, billedPercentage });\n        }\n      }\n    }`;
patch("packages/document-kernel/src/d1-store.ts", d1Before, commonAfter, "D1 Sales Order progress");

patch(
  "packages/document-kernel/src/index.ts",
  `export * from "./status.js";`,
  `export * from "./status.js";\nexport * from "./sales-order-progress.js";`,
  "document-kernel progress export",
);

console.log("sales order progress patches applied");
