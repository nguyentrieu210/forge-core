import { expect, test, type Page } from "@playwright/test";

/**
 * QR attendance is deliberately tested through the ordinary Runtime bundle, not a
 * fixture-only component.  The browser is still isolated from any tenant data: the
 * manifest and both application methods are intercepted below.
 *
 * URL seams keep the test independent of whether a station is opened from a sidebar,
 * a tablet bookmark, or a phone deep-link:
 *   - ?station=GATE-01 obtains and rotates the station challenge.
 *   - ?token=<signed-token> submits exactly that token as an employee scan.
 *
 * Neither route is allowed to carry an employee id, a client timestamp, or a work-day;
 * all of those are resolved on the server.
 */

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const KIOSK_ROUTE = "/x/alumdoor-attendance%3Akiosk";

const manifest = {
  id: "alumdoor",
  name: "Alumdoor",
  version: "2.2.3",
  brand: "warm",
  home: { route: KIOSK_ROUTE },
  domain: "alumdoor",
  nav: [{
    key: "alumdoor-attendance:kiosk",
    label: "Chấm công QR",
    kind: "experience",
    icon: "scan-line",
    group: "Nhân sự",
  }],
};

async function mockRuntime(page: Page) {
  // The global appearance chooser is intentionally covered elsewhere.  It is not part
  // of attendance and would otherwise make this isolated workflow test interact with
  // an unrelated first-run dialog.
  await page.addInitScript(() => localStorage.setItem("mf-theme-welcome:v1:employee@example.test", "1"));
  await page.route("**/api/method/metaforge.api.get_boot**", (route) => route.fulfill({
    status: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({
      message: {
        user: "employee@example.test",
        full_name: "Nhân viên QA",
        roles: ["Employee", "HR Manager"],
        user_permissions: {},
        lang: "vi",
        site_name: "alumdoor-ui.test",
        frappe_version: "16.0.0",
        csrf_token: "qa-csrf",
        sysdefaults: { date_format: "dd/mm/yyyy", number_format: "#.###,##", currency: "VND" },
        allowed_workspaces: [],
      },
    }),
  }));
  await page.route("**/api/method/metaforge.api.get_app_manifest**", (route) => route.fulfill({
    status: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({ message: manifest }),
  }));
  await page.route("**/api/method/metaforge.api.get_application_catalog**", (route) => route.fulfill({
    status: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({ message: { apps: [] } }),
  }));
  await page.route("**/api/method/metaforge.api.get_business_context**", (route) => route.fulfill({
    status: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({ message: { dimensions: [], selection: {}, policies: {} } }),
  }));
}

function requestJson(route: import("@playwright/test").Route): Record<string, unknown> {
  const body = route.request().postData();
  return body ? JSON.parse(body) as Record<string, unknown> : {};
}

/** A QR surface is accessible either as the QR SVG or its scan/deep-link fallback. */
function qrSurface(page: Page, token: string) {
  return page.locator([
    `[data-attendance-token="${token}"]`,
    `a[href*="${token}"]`,
    `[role="img"][aria-label*="${token}"]`,
  ].join(", "));
}

test.describe("Alumdoor attendance kiosk", () => {
  test("station challenge keeps its token in the QR surface and schedules one 15-second refresh", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-08-10T00:00:00.000Z") });
    await mockRuntime(page);

    const challengeBodies: Array<Record<string, unknown>> = [];
    let challengeNumber = 0;
    await page.route("**/api/method/alumdoor.attendance.challenge", async (route) => {
      challengeBodies.push(requestJson(route));
      challengeNumber += 1;
      const token = `qa-attendance-challenge-${challengeNumber}`;
      await route.fulfill({
        status: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          message: {
            station: "GATE-01",
            station_name: "Cổng xưởng",
            token,
            issued_at: "2026-08-10T00:00:00.000Z",
            // Keep display expiry just beyond the fake-clock boundary.  Refresh timing
            // is intentionally asserted from refresh_after_seconds below; a response
            // generated inside a routed browser request can otherwise be one fake
            // millisecond newer than this static fixture.
            expires_at: "2026-08-10T00:00:15.100Z",
            server_time: "2026-08-10T00:00:00.000Z",
            refresh_after_seconds: 15,
          },
        }),
      });
    });

    await page.goto(`${KIOSK_ROUTE}?station=GATE-01`, { waitUntil: "domcontentloaded" });
    await expect.poll(() => challengeBodies.length).toBeGreaterThanOrEqual(1);
    // React's routed lazy boundary may settle a zero-delay task after its first paint.
    // Flush it before establishing the timer baseline: a second API request here would
    // be a real duplicate bootstrap request, not the 15-second refresh under test.
    await page.clock.runFor(1);
    await expect.poll(() => challengeBodies.length).toBe(1);
    // Let React finish any route/bootstrap reconciliation before taking the timer
    // baseline.  This is deliberately separate from a refresh: the assertion below
    // still permits exactly one additional challenge after the server-supplied delay.
    await page.waitForTimeout(50);
    const beforeRefresh = challengeBodies.length;
    const firstToken = `qa-attendance-challenge-${beforeRefresh}`;
    await expect(qrSurface(page, firstToken).first()).toBeVisible();
    expect(challengeBodies).toEqual(Array.from({ length: beforeRefresh }, () => ({ station: "GATE-01" })));

    // Playwright's emulated browser timers have millisecond rounding at a jump boundary.
    // This checks the operational contract without depending on that implementation
    // detail: no early refresh through 14 seconds, then exactly one in the 15th second.
    await page.clock.runFor(14_000);
    expect(challengeBodies).toHaveLength(beforeRefresh);

    await page.clock.runFor(1_000);
    await expect.poll(() => challengeBodies.length).toBe(beforeRefresh + 1);
    await expect(qrSurface(page, `qa-attendance-challenge-${beforeRefresh + 1}`).first()).toBeVisible();
    expect(challengeBodies).toEqual(Array.from({ length: beforeRefresh + 1 }, () => ({ station: "GATE-01" })));
  });

  test("a scanned token is posted alone and its accepted result is shown", async ({ page }) => {
    await mockRuntime(page);

    const scanBodies: Array<Record<string, unknown>> = [];
    await page.route("**/api/method/alumdoor.attendance.scan", async (route) => {
      scanBodies.push(requestJson(route));
      await route.fulfill({
        status: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          message: {
            replayed: false,
            checkin: { name: "CHK-QR-QA", log_type: "IN", external_id: "QR-QA" },
            day: {
              name: "AAD-20260810-QA",
              work_date: "2026-08-10",
              segment_code: "shift_2",
              regular_minutes: 270,
              overtime_minutes: 0,
            },
          },
        }),
      });
    });

    await page.goto(`${KIOSK_ROUTE}?token=qa-signed-scan-token`, { waitUntil: "domcontentloaded" });
    await expect.poll(() => scanBodies.length).toBe(1);
    // This also fails if UI code tries to supply an employee, device clock, or shift.
    expect(scanBodies).toEqual([{ token: "qa-signed-scan-token" }]);
    await expect(page.getByText(/đã ghi nhận|chấm công thành công/i)).toBeVisible();
  });

  test("an expired QR stays an error instead of looking like a successful scan", async ({ page }) => {
    await mockRuntime(page);
    await page.route("**/api/method/alumdoor.attendance.scan", (route) => route.fulfill({
      status: 410,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        code: "QR_EXPIRED",
        message: "Mã QR vừa hết hạn, hãy hướng camera vào mã mới.",
      }),
    }));

    await page.goto(`${KIOSK_ROUTE}?token=qa-expired-scan-token`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Mã QR vừa hết hạn, hãy hướng camera vào mã mới.")).toBeVisible();
    await expect(page.getByText(/đã ghi nhận|chấm công thành công/i)).toHaveCount(0);
  });
});
