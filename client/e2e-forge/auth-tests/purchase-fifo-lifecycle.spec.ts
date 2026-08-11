import { expect, test, type Page } from "@playwright/test";

const USER = process.env.FORGE_AUTH_USER;
const PASSWORD = process.env.FORGE_AUTH_PASSWORD;
if (!USER || !PASSWORD) throw new Error("FORGE_AUTH_USER and FORGE_AUTH_PASSWORD are required");

type JsonRecord = Record<string, unknown>;
type FrappeDoc = JsonRecord & {
  doctype: string;
  name: string;
  docstatus: number;
  modified?: string;
  items?: JsonRecord[];
};

type BrowserResponse = {
  status: number;
  ok: boolean;
  body: unknown;
  text: string;
};

async function browserRequest(
  page: Page,
  path: string,
  options: { method?: string; body?: unknown; csrf?: string } = {},
): Promise<BrowserResponse> {
  return page.evaluate(async ({ requestPath, requestOptions }) => {
    const headers: Record<string, string> = {};
    if (requestOptions.body !== undefined) headers["content-type"] = "application/json";
    if (requestOptions.csrf) headers["x-frappe-csrf-token"] = requestOptions.csrf;
    const response = await fetch(requestPath, {
      method: requestOptions.method ?? "GET",
      credentials: "same-origin",
      headers,
      body: requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body),
    });
    const text = await response.text();
    let body: unknown = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { status: response.status, ok: response.ok, body, text };
  }, { requestPath: path, requestOptions: options });
}

function unwrap(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  const record = body as JsonRecord;
  if ("data" in record) return record.data;
  if ("message" in record) return record.message;
  return body;
}

async function login(page: Page): Promise<string> {
  await page.goto("/?alumdoor=1");
  await expect(page.locator("#mf-login-usr")).toBeVisible();
  await page.locator("#mf-login-usr").fill(USER);
  await page.locator("#mf-login-pwd").fill(PASSWORD);
  await page.locator("form").getByRole("button", { name: /^Đăng nhập$/ }).click();
  await expect(page.locator("#mf-login-usr")).toBeHidden();
  const boot = await browserRequest(page, "/api/method/metaforge.api.get_boot");
  expect(boot.status, boot.text).toBe(200);
  const message = unwrap(boot.body) as { user?: string; csrf_token?: string };
  expect(message.user).toBe(USER);
  expect(message.csrf_token).toBeTruthy();
  return message.csrf_token ?? "";
}

async function requireDoc(response: BrowserResponse): Promise<FrappeDoc> {
  expect(response.ok, response.text).toBe(true);
  const value = unwrap(response.body);
  expect(value).toBeTruthy();
  return value as FrappeDoc;
}

async function createResource(page: Page, csrf: string, doctype: string, document: JsonRecord) {
  return requireDoc(await browserRequest(page, `/api/resource/${encodeURIComponent(doctype)}`, {
    method: "POST", csrf, body: { doctype, ...document },
  }));
}

async function getResource(page: Page, doctype: string, name: string) {
  return requireDoc(await browserRequest(page, `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`));
}

async function submit(page: Page, csrf: string, doc: FrappeDoc) {
  return requireDoc(await browserRequest(page, "/api/method/frappe.client.submit", {
    method: "POST", csrf, body: { doc: JSON.stringify(doc) },
  }));
}

function day(offset: number): string {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}
function round(value: number, digits = 6): number {
  const scale = 10 ** digits;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}
function viInput(value: number): string { return String(value).replace(".", ","); }

function aluminiumLine(lengthM: number, bars: number): JsonRecord {
  const kgPerM = 0.389;
  const baremKg = round(lengthM * kgPerM * bars);
  const rate = 100_000;
  return {
    doctype: "Purchase Order Item",
    item_code: "AL71-QA",
    item_name: "Nhôm AL71 QA",
    inventory_mode: "Nhôm cây/lá",
    measurement_profile: "Nhôm cây/lá",
    material_specification: "AL71",
    stock_uom: "Cây",
    uom: "Kg",
    qty: baremKg,
    stock_qty: bars,
    rate,
    amount: round(baremKg * rate),
    warehouse: "K36",
    theoretical_kg_per_m: kgPerM,
    theoretical_kg: baremKg,
    length_m: lengthM,
    qty_bar: bars,
    total_length_m: round(lengthM * bars),
    color: "THÔ",
    is_stamped: "Không",
  };
}

async function createSubmittedOrder(page: Page, csrf: string, lengthM: number, bars: number, transactionDate: string, suffix: string): Promise<FrappeDoc> {
  const created = await createResource(page, csrf, "Purchase Order", {
    supplier: "Tiến Đạt",
    priority: "Thường",
    transaction_date: transactionDate,
    schedule_date: day(2),
    company: "ALUMDOOR",
    currency: "VND",
    note: `Authenticated Tiến Đạt FIFO QA ${suffix}`,
    items: [aluminiumLine(lengthM, bars)],
  });
  expect(created.docstatus).toBe(0);
  return submit(page, csrf, created);
}

async function callFifo(page: Page, csrf: string, method: "preview_fifo_receipt" | "fifo_receipt", lengthM: number, bars: number, suffix: string): Promise<BrowserResponse> {
  const actualWeightKg = round(lengthM * 0.389 * bars);
  return browserRequest(page, `/api/method/alumdoor.purchase.${method}`, {
    method: "POST",
    csrf,
    body: {
      supplier: "Tiến Đạt",
      item_code: "AL71-QA",
      length_m: lengthM,
      qty_bar: bars,
      actual_weight_kg: actualWeightKg,
      rate: 100_000,
      color: "THÔ",
      is_stamped: "Không",
      warehouse: "K36",
      supplier_invoice_no: `TD-${suffix}`,
      driver: "QA Driver",
    },
  });
}

const actionId = (field: string) => `#action-nhap-nhom-fifo-${field}`;
async function chooseActionLink(page: Page, field: string, value: string) {
  await page.locator(actionId(field)).click();
  const input = page.locator("[cmdk-input]").last();
  await expect(input).toBeVisible();
  await input.fill(value);
  const option = page.locator("[cmdk-item]").filter({ hasText: value }).filter({ hasNotText: /Tạo mới/i }).first();
  await expect(option).toBeVisible();
  await option.click();
  await expect(page.locator(actionId(field))).toContainText(value);
}

async function openAndFillFifoAction(page: Page, lengthM: number, bars: number) {
  await page.goto("/x/action%3Anhap-nhom-fifo");
  const screen = page.locator('[data-action-screen="nhap-nhom-fifo"]');
  await expect(screen).toBeVisible();
  await expect(screen.getByRole("region", { name: "Thông tin thao tác" })).toBeVisible();
  await chooseActionLink(page, "supplier", "Tiến Đạt");
  await chooseActionLink(page, "item_code", "AL71-QA");
  await page.locator(actionId("length_m")).fill(viInput(lengthM));
  await page.locator(actionId("qty_bar")).fill(String(bars));
  await page.locator(actionId("actual_weight_kg")).fill(viInput(round(lengthM * 0.389 * bars)));
  await page.locator(actionId("rate")).fill("100000");
  await chooseActionLink(page, "color", "THÔ");
  await chooseActionLink(page, "warehouse", "K36");
  await page.getByRole("button", { name: "Xem phân bổ FIFO", exact: true }).click();
  await expect(page.locator("[data-action-result]")).toBeVisible();
}

test("authenticated Tiến Đạt receipt allocates FIFO and posts one tracked dual-measure stock authority", async ({ page }) => {
  const csrf = await login(page);
  const project = test.info().project.name;
  const suffix = `${project}-${Date.now()}`;
  const lengthM = project.includes("mobile") ? 7.25 : 7.2;

  const firstOrder = await createSubmittedOrder(page, csrf, lengthM, 200, day(-1), `${suffix}-first`);
  const secondOrder = await createSubmittedOrder(page, csrf, lengthM, 100, day(0), `${suffix}-second`);
  expect(firstOrder.docstatus).toBe(1);
  expect(secondOrder.docstatus).toBe(1);

  await openAndFillFifoAction(page, lengthM, 230);
  const debtSummary = page.locator('[data-action-summary="Công nợ giao hàng sau lần nhận"]');
  await expect(debtSummary).toBeVisible();
  await expect(debtSummary.getByText("Còn nợ danh nghĩa (cây)", { exact: true }).locator("..")).toContainText("70");
  await expect(debtSummary.getByText("Cần giao thêm tối thiểu (cây)", { exact: true }).locator("..")).toContainText("55");
  await expect(debtSummary.getByText("Được giao thêm tối đa (cây)", { exact: true }).locator("..")).toContainText("85");

  const balancesUi = page.locator('[data-action-result-section="order_balances"]');
  const allocationsUi = page.locator('[data-action-result-section="allocations"]');
  const historyUi = page.locator('[data-action-result-section="receipt_history"]');
  const itemsUi = page.locator('[data-action-result-section="items"]');
  await expect(balancesUi.getByText("Đơn còn nợ", { exact: true })).toBeVisible();
  await expect(balancesUi).toContainText(firstOrder.name);
  await expect(balancesUi).toContainText(secondOrder.name);
  await expect(allocationsUi.getByText("Lịch sử trừ FIFO lần này", { exact: true })).toBeVisible();
  await expect(allocationsUi).toContainText(firstOrder.name);
  await expect(allocationsUi).toContainText(secondOrder.name);
  await expect(historyUi.getByText("Lịch sử hàng về", { exact: true })).toBeVisible();
  await expect(itemsUi.getByText("Dòng phiếu nhập sẽ tạo", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

  const previewResponse = await callFifo(page, csrf, "preview_fifo_receipt", lengthM, 230, suffix);
  expect(previewResponse.status, previewResponse.text).toBe(200);
  const preview = unwrap(previewResponse.body) as JsonRecord;
  const allocations = preview.allocations as JsonRecord[];
  expect(allocations).toHaveLength(2);
  expect(allocations.map((row) => row.purchase_order)).toEqual([firstOrder.name, secondOrder.name]);
  expect(allocations.map((row) => Number(row.allocated_bars))).toEqual([200, 30]);
  const previewItems = preview.items as JsonRecord[];
  expect(previewItems.every((row) => row.stock_uom === "Cây")).toBe(true);
  expect(previewItems.map((row) => Number(row.stock_qty))).toEqual([200, 30]);

  const debt = preview.debt as JsonRecord;
  expect(Number(debt.nominal_remaining_bars)).toBe(70);
  expect(Number(debt.nominal_remaining_meters)).toBe(round(70 * lengthM));
  expect(Number(debt.minimum_additional_bars_to_settle)).toBe(55);
  expect(Number(debt.maximum_additional_bars_allowed)).toBe(85);
  expect(Number(preview.delivered_barem_weight_kg)).toBe(round(230 * lengthM * 0.389));

  const createResponse = await callFifo(page, csrf, "fifo_receipt", lengthM, 230, suffix);
  expect(createResponse.status, createResponse.text).toBe(200);
  const createdResult = unwrap(createResponse.body) as JsonRecord;
  const receiptName = String(createdResult.purchase_receipt ?? "");
  expect(receiptName).toMatch(/^PNM-/);
  expect(Array.isArray(createdResult.batches) ? createdResult.batches.length : 0).toBeGreaterThan(0);
  expect(Array.isArray(createdResult.bundles) ? createdResult.bundles.length : 0).toBe(2);
  expect(createdResult.inventory_authority).toBe("Batch + Serial and Batch Bundle + Stock Ledger");

  const draftReceipt = await getResource(page, "Purchase Receipt", receiptName);
  expect(draftReceipt.docstatus).toBe(0);
  expect((draftReceipt.items ?? []).map((row) => row.purchase_order)).toEqual([firstOrder.name, secondOrder.name]);
  expect((draftReceipt.items ?? []).map((row) => Number(row.qty_bar))).toEqual([200, 30]);
  expect((draftReceipt.items ?? []).map((row) => row.stock_uom)).toEqual(["Cây", "Cây"]);
  expect((draftReceipt.items ?? []).map((row) => Number(row.stock_qty))).toEqual([200, 30]);
  expect((draftReceipt.items ?? []).every((row) => String(row.serial_and_batch_bundle ?? "").startsWith("SABB-"))).toBe(true);

  const submittedReceipt = await submit(page, csrf, draftReceipt);
  expect(submittedReceipt.docstatus).toBe(1);

  const historyProbeResponse = await callFifo(page, csrf, "preview_fifo_receipt", lengthM, 1, `${suffix}-history`);
  expect(historyProbeResponse.status, historyProbeResponse.text).toBe(200);
  const historyProbe = unwrap(historyProbeResponse.body) as JsonRecord;
  const historyDebt = historyProbe.debt as JsonRecord;
  const history = historyProbe.receipt_history as JsonRecord[];
  expect(history.some((row) => row.purchase_receipt === receiptName)).toBe(true);
  expect(Number(historyDebt.received_bars_before)).toBe(230);
  expect(Number(historyDebt.ordered_bars) - Number(historyDebt.received_bars_before)).toBe(70);
  expect(Number(historyDebt.minimum_additional_bars_to_settle) + 1).toBe(55);
  expect(Number(historyDebt.maximum_additional_bars_allowed) + 1).toBe(85);

  await page.locator(actionId("qty_bar")).fill("1");
  await page.locator(actionId("actual_weight_kg")).fill(viInput(round(lengthM * 0.389)));
  await page.getByRole("button", { name: "Xem phân bổ FIFO", exact: true }).click();
  await expect(historyUi).toContainText(receiptName);
  await expect(historyUi).toContainText(firstOrder.name);

  const accepted = await callFifo(page, csrf, "preview_fifo_receipt", lengthM, 85, `${suffix}-limit`);
  expect(accepted.status, accepted.text).toBe(200);
  const rejected = await callFifo(page, csrf, "preview_fifo_receipt", lengthM, 86, `${suffix}-over`);
  expect(rejected.status, rejected.text).toBe(417);
  expect(rejected.text).toMatch(/vượt|dung sai|không phân bổ/i);
});
