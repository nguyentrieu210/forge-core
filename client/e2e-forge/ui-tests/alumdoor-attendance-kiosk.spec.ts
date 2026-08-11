import { expect, test, type Page } from "@playwright/test";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const KIOSK_ROUTE = "/x/alumdoor-attendance%3Akiosk";
const SCAN_ROUTE = "/x/alumdoor-attendance%3Ascan";

const manifest = {
  id: "alumdoor", name: "Alumdoor", version: "0.4.0", brand: "warm", domain: "alumdoor",
  home: { route: KIOSK_ROUTE },
  nav: [
    { key: "alumdoor-attendance:kiosk", label: "In mã QR trạm", kind: "experience", icon: "qr-code", group: "Nhân sự" },
    { key: "alumdoor-attendance:scan", label: "Quét chấm công", kind: "experience", icon: "scan-line", group: "Nhân sự" },
  ],
};

async function mockRuntime(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("mf-theme-welcome:v1:manager@example.test", "1");
    localStorage.setItem("alumdoor-attendance-print-station", "GATE-01");
  });
  await page.route("**/api/method/metaforge.api.get_boot**", (route) => route.fulfill({ status: 200, headers: JSON_HEADERS, body: JSON.stringify({ message: {
    user: "manager@example.test", full_name: "Quản lý QA", roles: ["HR Manager"], user_permissions: {}, lang: "vi",
    site_name: "alumdoor-ui.test", frappe_version: "16.0.0", csrf_token: "qa-csrf",
    sysdefaults: { date_format: "dd/mm/yyyy", number_format: "#.###,##", currency: "VND" }, allowed_workspaces: [],
  } }) }));
  await page.route("**/api/method/metaforge.api.get_app_manifest**", (route) => route.fulfill({ status: 200, headers: JSON_HEADERS, body: JSON.stringify({ message: manifest }) }));
  await page.route("**/api/method/metaforge.api.get_application_catalog**", (route) => route.fulfill({ status: 200, headers: JSON_HEADERS, body: JSON.stringify({ message: { apps: [] } }) }));
  await page.route("**/api/method/metaforge.api.get_business_context**", (route) => route.fulfill({ status: 200, headers: JSON_HEADERS, body: JSON.stringify({ message: { dimensions: [], selection: {}, policies: {} } }) }));
}

test.describe("Alumdoor static attendance station QR", () => {
  test("print surface loads one stable QR and has no timer or background refresh", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-08-11T00:00:00.000Z") });
    await mockRuntime(page);
    const calls: string[] = [];
    await page.route("**/api/method/alumdoor.attendance.station_qr", (route) => {
      calls.push(route.request().postData() ?? "");
      return route.fulfill({ status: 200, headers: JSON_HEADERS, body: JSON.stringify({ message: {
        station: "GATE-01", station_name: "Cổng xưởng", token: "static-station-token-v1", token_version: "1",
      } }) });
    });
    await page.goto(KIOSK_ROUTE, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "In mã QR cố định của trạm" })).toBeVisible();
    await expect(page.getByText("Cổng xưởng")).toBeVisible();
    await expect(page.getByLabel("QR trạm Cổng xưởng")).toBeVisible();
    await expect(page.getByText(/đếm ngược|hết hạn/i)).toHaveCount(0);
    await page.clock.runFor(60_000);
    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0]!)).toEqual({ station: "GATE-01" });
  });

  test("regenerate calls rotation once and replaces the printable token version", async ({ page }) => {
    await mockRuntime(page);
    await page.addInitScript(() => { window.confirm = () => true; });
    await page.route("**/api/method/alumdoor.attendance.station_qr", (route) => route.fulfill({ status: 200, headers: JSON_HEADERS, body: JSON.stringify({ message: { station: "GATE-01", station_name: "Cổng xưởng", token: "static-v1", token_version: "1" } }) }));
    let rotations = 0;
    await page.route("**/api/method/alumdoor.attendance.rotate_station_qr", (route) => { rotations += 1; return route.fulfill({ status: 200, headers: JSON_HEADERS, body: JSON.stringify({ message: { station: "GATE-01", station_name: "Cổng xưởng", token: "static-v2", token_version: "2" } }) }); });
    await page.goto(KIOSK_ROUTE, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Tạo lại QR" }).click();
    await expect(page.getByText("Phiên bản token: 2")).toBeVisible();
    expect(rotations).toBe(1);
  });

  test("runtime scan entry links to the standalone no-login mobile app", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await mockRuntime(page);
    await page.goto(SCAN_ROUTE, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1_000);
    expect(pageErrors).toEqual([]);
    await expect(page.getByRole("heading", { name: "App chấm công trên điện thoại" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Mở app/ })).toHaveAttribute("href", "/mobile/attendance/");
  });
});
