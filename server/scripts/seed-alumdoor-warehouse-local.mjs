#!/usr/bin/env node
/** Seed the two canonical Alumdoor warehouses on a local Forge tenant. */
import process from "node:process";

const origin = (process.env.FORGE_ORIGIN ?? "http://127.0.0.1:8799").replace(/\/$/, "");
const adminUser = process.env.FORGE_ADMIN_USER ?? process.env.FORGE_AUTH_USER ?? "";
const adminPassword = process.env.FORGE_ADMIN_PASSWORD ?? process.env.FORGE_AUTH_PASSWORD ?? "";

if (!adminUser || !adminPassword) {
  console.error("FORGE_ADMIN_USER/FORGE_ADMIN_PASSWORD are required");
  process.exit(2);
}

const parsedOrigin = new URL(origin);
if (!["127.0.0.1", "localhost", "::1"].includes(parsedOrigin.hostname)) {
  console.error(`refusing: Warehouse seed is local-only, got ${parsedOrigin.hostname}`);
  process.exit(2);
}

const cookies = new Map();
let csrfToken = "";

function rememberCookies(response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) return;
  for (const part of setCookie.split(/,(?=[^;,]+=)/)) {
    const pair = part.split(";", 1)[0];
    const separator = pair.indexOf("=");
    if (separator <= 0) continue;
    cookies.set(pair.slice(0, separator).trim(), pair.slice(separator + 1).trim());
  }
}

function cookieHeader() {
  return [...cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers ?? {});
  const cookie = cookieHeader();
  if (cookie) headers.set("cookie", cookie);
  if (csrfToken && options.method && options.method !== "GET") headers.set("x-frappe-csrf-token", csrfToken);
  if (options.body !== undefined && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(`${origin}${path}`, {
    ...options,
    headers,
    body: options.body === undefined || typeof options.body === "string"
      ? options.body
      : JSON.stringify(options.body),
    redirect: "manual",
  });
  rememberCookies(response);
  csrfToken = response.headers.get("x-frappe-csrf-token") ?? csrfToken;
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { response, body, text };
}

async function requireOk(path, options = {}) {
  const result = await request(path, options);
  if (!result.response.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} failed (${result.response.status}): ${result.text}`);
  }
  return result.body;
}

async function login() {
  await requireOk("/api/method/login", {
    method: "POST",
    body: { usr: adminUser, pwd: adminPassword },
  });
  const boot = await requireOk("/api/method/metaforge.api.get_boot");
  const message = boot && typeof boot === "object" && "message" in boot ? boot.message : boot;
  csrfToken = message?.csrf_token ?? csrfToken;
  if (!csrfToken) throw new Error("login succeeded but boot returned no CSRF token");
}

async function existingWarehouse(name) {
  const result = await request(`/api/resource/Warehouse/${encodeURIComponent(name)}`);
  if (result.response.ok) return result.body;
  if (result.response.status === 404) return null;
  throw new Error(`GET Warehouse ${name} failed (${result.response.status}): ${result.text}`);
}

async function resolveParentWarehouse() {
  for (const candidate of ["Alumdoor", "Kho Alumdoor"]) {
    if (await existingWarehouse(candidate)) return candidate;
  }
  const fields = encodeURIComponent(JSON.stringify(["name", "warehouse_name", "is_group"]));
  const listed = await requireOk(`/api/resource/Warehouse?fields=${fields}&limit_page_length=100`);
  const rows = Array.isArray(listed?.data) ? listed.data : [];
  const root = rows.find((row) => (
    Boolean(row?.is_group)
    && String(row?.warehouse_name ?? row?.name ?? "").toLocaleLowerCase("vi").includes("alumdoor")
  ));
  if (root?.name) return String(root.name);
  await requireOk("/api/resource/Warehouse", {
    method: "POST",
    body: {
      doctype: "Warehouse",
      warehouse_name: "Kho Alumdoor",
      is_group: 1,
      stock_role: "Kho chính",
      disabled: 0,
    },
  });
  return "Kho Alumdoor";
}

async function ensureWarehouse(name, data) {
  const current = await existingWarehouse(name);
  if (!current) {
    await requireOk("/api/resource/Warehouse", {
      method: "POST",
      body: {
        doctype: "Warehouse",
        name,
        warehouse_name: name,
        ...data,
      },
    });
    return "created";
  }
  return "existing";
}

await login();
const parentWarehouse = await resolveParentWarehouse();
const common = {
  parent_warehouse: parentWarehouse,
  is_group: 0,
  stock_role: "Kho chính",
  disabled: 0,
};

const results = {
  K36: await ensureWarehouse("K36", {
    ...common,
    warehouse_name: "K36",
    address: "Kho vật lý K36",
  }),
  K12: await ensureWarehouse("K12", {
    ...common,
    warehouse_name: "Kho K12",
    address: "Kho vật lý K12",
  }),
};

console.log(`ALUMDOOR_WAREHOUSE_SEED_PASS parent=${parentWarehouse} K36=${results.K36} K12=${results.K12}`);
