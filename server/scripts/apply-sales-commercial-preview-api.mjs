import fs from "node:fs";

const target = new URL("../packages/frappe-api/src/router.ts", import.meta.url);
let source = fs.readFileSync(target, "utf8");
function replace(before, after, label) {
  if (source.includes(after)) return;
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  source = source.replace(before, after);
}

replace(
`import { errors, sha256Hex } from "../../core/src/index.js";`,
`import { errors, sha256Hex } from "../../core/src/index.js";\nimport { resolveCommercialLine } from "../../clouderp-selling/src/index.js";`, "pricing resolver import");

replace(
`    case "frappe.client.get_value":
      return methodResponse(await getValue(args, context));`,
`    case "frappe.client.get_value":
      return methodResponse(await getValue(args, context));

    case "metaforge.api.preview_sales_commercial_line":
      return methodResponse(await previewSalesCommercialLine(args, context));`, "preview method route");

source += `

/** Read-only preview using the exact same selling resolver used by Quotation/Sales Order. */
async function previewSalesCommercialLine(args: FrappeArgs, context: FrappeRouterContext): Promise<JsonObject> {
  const line = args.object("line") ?? args.object("row") ?? {};
  const itemCode = String(line.item_code ?? args.text("item_code") ?? "").trim();
  const priceList = String(args.text("price_list") ?? line.price_list ?? "").trim();
  const currency = String(args.text("currency") ?? line.currency ?? "VND").trim() || "VND";
  const postingDate = String(args.text("posting_date") ?? args.text("transaction_date") ?? line.posting_date ?? context.now().slice(0, 10)).slice(0, 10);
  if (!itemCode) throw errors.validation("item_code is required");
  if (!priceList) throw errors.validation("price_list is required");

  // Permission is evaluated on the actual Item before any pricing master is read.
  const item = await loadReadable("Item", itemCode, context);
  const qty = Number(line.qty ?? line.priced_qty ?? 0);
  if (!Number.isFinite(qty) || qty <= 0) throw errors.validation("qty must be greater than zero");

  const fakeCommand: MutationCommand<JsonObject> = {
    schema_version: 1,
    command_id: \`preview-sales-\${context.traceId}\`,
    tenant_id: context.tenantId,
    aggregate: { doctype: "Sales Order", name: "__commercial_preview__" },
    action: "save",
    expected_version: null,
    payload_hash: "preview",
    document: {},
    actor: context.actor,
  };
  const facts: Record<string, unknown> = {
    ...line,
    item_group: item.data.item_group,
  };
  const resolved = await resolveCommercialLine({
    command: fakeCommand,
    existing: null,
    now: context.now(),
    nextVersion: 1,
    reader: context.documents,
  }, {
    itemCode,
    priceList,
    documentCurrency: currency,
    postingDate,
    ...(typeof line.uom === "string" && line.uom.trim() ? { uom: line.uom.trim() } : {}),
    pricedQty: qty,
    partyType: "Customer",
    ...(args.text("customer") ? { party: args.text("customer")! } : {}),
    ...(args.text("customer_group") ? { customerGroup: args.text("customer_group")! } : {}),
    facts,
    ...(Number.isFinite(Number(line.billable_area_sqm)) ? { areaSqm: Number(line.billable_area_sqm) } : {}),
    ...(Number.isFinite(Number(line.length_m)) ? { lengthM: Number(line.length_m) } : {}),
    ...(Number.isFinite(Number(line.set_count)) ? { setCount: Number(line.set_count) } : {}),
  });
  return {
    ...resolved,
    rate: resolved.selling_rate,
    amount: resolved.net_before_tax,
    net_amount: resolved.net_before_tax,
  };
}
`;

fs.writeFileSync(target, source);
console.log("canonical sales commercial preview API applied");
