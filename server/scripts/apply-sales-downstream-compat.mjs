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

patch(
  "packages/clouderp-selling/src/sales-order-downstream.ts",
  `    const rowKey = requiredText(item.sales_order_row_id, \`Delivery row \${index + 1} sales_order_row_id\`);\n    const sourceLine = source.get(rowKey);\n    if (!sourceLine) throw errors.reference(\`Sales Order row \${rowKey} does not belong to \${salesOrder.name}\`);`,
  `    const resolvedSource = resolveSourceLine(source, item, \`Delivery row \${index + 1}\`, salesOrder.name);\n    const rowKey = resolvedSource.rowKey;\n    const sourceLine = resolvedSource.line;\n    item.sales_order_row_id = rowKey;`,
  "delivery source inference",
);

patch(
  "packages/clouderp-selling/src/sales-order-downstream.ts",
  `    const rowKey = requiredText(item.sales_order_row_id, \`Sales Invoice row \${index + 1} sales_order_row_id\`);\n    const sourceLine = source.get(rowKey);\n    if (!sourceLine) throw errors.reference(\`Sales Order row \${rowKey} does not belong to \${salesOrder.name}\`);`,
  `    const resolvedSource = resolveSourceLine(source, item, \`Sales Invoice row \${index + 1}\`, salesOrder.name);\n    const rowKey = resolvedSource.rowKey;\n    const sourceLine = resolvedSource.line;`,
  "invoice source inference",
);

patch(
  "packages/clouderp-selling/src/sales-order-downstream.ts",
  `    const rowKey = requiredText(item.sales_order_row_id, \`${"${kind}