import fs from "node:fs";

const target = new URL("../packages/clouderp-selling/src/controllers.ts", import.meta.url);
let source = fs.readFileSync(target, "utf8");

function replaceOnce(before, after, label) {
  if (source.includes(after)) return;
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  source = source.replace(before, after);
}

replaceOnce(
  `import type { DeliveryIssuePurpose, DeliveryNoteData, PaymentEntryData, SalesInvoiceData, SalesItem, SalesOrderData } from "./types.js";`,
  `import type { DeliveryIssuePurpose, DeliveryNoteData, PaymentEntryData, SalesInvoiceData, SalesItem, SalesOrderData } from "./types.js";\nimport { assertSalesOrderDeliveryLines, freezeSalesOrderBillingLines, salesOrderFulfillmentEntries } from "./sales-order-downstream.js";`,
  "downstream import",
);

replaceOnce(
  `        await assertRemainingQuantity(context, {\n          source: salesOrder,\n          items,\n          targetParentDoctype: "Delivery Note",\n          referenceField: "against_sales_order",\n          referenceName: input.against_sales_order,\n          label: "delivered",\n          quantityKind: "stock",\n        });`,
  `        await assertSalesOrderDeliveryLines(\n          context as unknown as ControllerContext<JsonObject>,\n          salesOrder,\n          items,\n        );`,
  "Delivery source-line validation",
);

replaceOnce(
  `      const fulfillment = data.against_sales_order\n        ? data.items.map((item, index): FulfillmentEntry => ({\n          line_key: \`REV-DELIVERY-\${item.row_id || index + 1}\`,\n          sales_order: data.against_sales_order!,\n          kind: "Delivery",\n          item_code: item.item_code,\n          qty_micros: -(item.qty_micros ?? toScaledInt(item.qty, 6)),\n          posting_at: data.posting_at,\n        }))\n        : [];`,
  `      const fulfillment = data.against_sales_order\n        ? salesOrderFulfillmentEntries(data.against_sales_order, "Delivery", data.items, data.posting_at, true)\n        : [];`,
  "Delivery cancel fulfillment",
);

replaceOnce(
  `    const fulfillment = data.against_sales_order\n      ? data.items.map((item, index): FulfillmentEntry => ({ line_key:\`DELIVERY-\${item.row_id||index+1}\`,sales_order:data.against_sales_order!,kind:"Delivery",item_code:item.item_code,qty_micros:item.qty_micros??toScaledInt(item.qty,6),posting_at:data.posting_at }))\n      : [];`,
  `    const fulfillment = data.against_sales_order\n      ? salesOrderFulfillmentEntries(data.against_sales_order, "Delivery", data.items, data.posting_at)\n      : [];`,
  "Delivery submit fulfillment",
);

replaceOnce(
  `    const itemSnapshots = await applyUomConversion(context as unknown as ControllerContext<JsonObject>, input.items, { transactionKind: "sales" });\n    const pricedItems = await applySellingPricing(context, itemSnapshots, input.selling_price_list, input.currency, input.posting_at, input.customer, input.customer_group);\n    const totals = calculateSalesTotals(pricedItems, input.taxes ?? [], currencyScale, {\n      use_priced_quantity: true,\n      apply_discount_on: input.apply_discount_on,\n      additional_discount_percentage: input.additional_discount_percentage,\n      discount_amount: input.discount_amount,\n    });`,
  `    const itemSnapshots = await applyUomConversion(context as unknown as ControllerContext<JsonObject>, input.items, { transactionKind: "sales" });\n    let sourceSalesOrder: CanonicalDocument<SalesOrderData> | null = null;\n    let pricedItems: SalesItem[];\n    if (input.against_sales_order) {\n      if (context.command.action === "submit") {\n        sourceSalesOrder = await requireSubmittedDocument<SalesOrderData>(context, "Sales Order", input.against_sales_order);\n      } else {\n        sourceSalesOrder = await context.reader.getDocument<SalesOrderData>(context.command.tenant_id, "Sales Order", input.against_sales_order);\n        if (!sourceSalesOrder || sourceSalesOrder.docstatus === 2) {\n          throw errors.reference(\`Sales Order \${input.against_sales_order} is required\`);\n        }\n      }\n      assertSameCommercialContext(input, sourceSalesOrder.data, "Sales Invoice", "Sales Order");\n      pricedItems = await freezeSalesOrderBillingLines(\n        context as unknown as ControllerContext<JsonObject>,\n        sourceSalesOrder,\n        itemSnapshots,\n        currencyScale,\n        { enforceRemaining: context.command.action === "submit" },\n      );\n    } else {\n      pricedItems = await applySellingPricing(context, itemSnapshots, input.selling_price_list, input.currency, input.posting_at, input.customer, input.customer_group);\n    }\n    const frozenHeaderDiscount = sourceSalesOrder?.data.additional_discount_percentage ?? input.additional_discount_percentage;\n    const totals = calculateSalesTotals(pricedItems, input.taxes ?? [], currencyScale, {\n      use_priced_quantity: true,\n      use_server_line_money: Boolean(sourceSalesOrder),\n      apply_discount_on: sourceSalesOrder?.data.apply_discount_on ?? input.apply_discount_on,\n      additional_discount_percentage: frozenHeaderDiscount,\n      ...(sourceSalesOrder ? {} : { discount_amount: input.discount_amount }),\n    });`,
  "Invoice frozen commercial pricing",
);

replaceOnce(
  `    if (context.command.action === "submit" && input.against_sales_order) {\n      const salesOrder = await requireSubmittedDocument<SalesOrderData>(context, "Sales Order", input.against_sales_order);\n      assertSameCommercialContext(input, salesOrder.data, "Sales Invoice", "Sales Order");\n      await assertRemainingQuantity(context, {\n        source: salesOrder,\n        items: totals.items,\n        targetParentDoctype: "Sales Invoice",\n        referenceField: "against_sales_order",\n        referenceName: input.against_sales_order,\n        label: "billed",\n        quantityKind: "transaction",\n      });\n    }`,
  `    // SO-derived billing was validated by exact source row before totals. Item-code\n    // aggregation is intentionally not used here because configured rows may share an item.`,
  "Invoice legacy aggregate validation",
);

replaceOnce(
  `      ...input,\n      currency_scale: currencyScale,\n      ...totals,`,
  `      ...input,\n      ...(sourceSalesOrder?.data.selling_price_list ? { selling_price_list: sourceSalesOrder.data.selling_price_list } : {}),\n      ...(sourceSalesOrder?.data.customer_group ? { customer_group: sourceSalesOrder.data.customer_group } : {}),\n      ...(sourceSalesOrder?.data.apply_discount_on ? { apply_discount_on: sourceSalesOrder.data.apply_discount_on } : {}),\n      ...(frozenHeaderDiscount !== undefined ? { additional_discount_percentage: frozenHeaderDiscount } : {}),\n      currency_scale: currencyScale,\n      ...totals,`,
  "Invoice frozen header snapshot",
);

replaceOnce(
  `    const fulfillment: FulfillmentEntry[] = data.against_sales_order\n      ? data.items.map((item, index) => ({\n        line_key: \`BILLING-\${item.row_id || index + 1}\`,\n        sales_order: data.against_sales_order!,\n        kind: "Billing",\n        item_code: item.item_code,\n        qty_micros: item.qty_micros ?? toScaledInt(item.qty, 6),\n        posting_at: data.posting_at,\n      }))\n      : [];`,
  `    const fulfillment: FulfillmentEntry[] = data.against_sales_order\n      ? salesOrderFulfillmentEntries(data.against_sales_order, "Billing", data.items, data.posting_at)\n      : [];`,
  "Invoice source-line fulfillment",
);

fs.writeFileSync(target, source);
console.log("sales downstream controller patches applied");
