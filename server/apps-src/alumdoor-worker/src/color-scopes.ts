export type ColorScopePlatformCall = ((path: string, init?: RequestInit) => Promise<Response>) & { via?: string };
export type ColorUsage = "purchase" | "sales" | "internal";

type Json = Record<string, unknown>;

const colorListCache = new WeakMap<object, Promise<Json[]>>();
const groupLineageCache = new WeakMap<object, Map<string, Promise<string[]>>>();

function text(value: unknown): string {
  return String(value ?? "").normalize("NFC").trim();
}

function checked(value: unknown): boolean {
  if (value === true || value === 1 || value === "1") return true;
  return ["true", "yes", "có", "co"].includes(text(value).toLocaleLowerCase("vi"));
}

async function readResource(call: ColorScopePlatformCall, doctype: string, name: string): Promise<Json | null> {
  const response = await call(`resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Không đọc được ${doctype} ${name} (HTTP ${response.status}).`);
  return ((await response.json()) as { data?: Json }).data ?? null;
}

async function listColors(call: ColorScopePlatformCall): Promise<Json[]> {
  const hit = colorListCache.get(call);
  if (hit) return hit;
  const pending = (async () => {
    const query = new URLSearchParams({
      fields: JSON.stringify(["name", "color_code", "disabled", "usage_scope"]),
      limit_page_length: "500",
    });
    const response = await call(`resource/Item%20Color?${query.toString()}`);
    if (!response.ok) throw new Error(`Không đọc được danh mục Màu vật tư (HTTP ${response.status}).`);
    const summaries = ((await response.json()) as { data?: Json[] }).data ?? [];
    // Frappe-compatible list endpoints deliberately reject Table fields. Read each of the
    // small colour masters in parallel so `applies_to_groups` comes from the full document.
    return await Promise.all(summaries.map(async (summary) => {
      const name = text(summary.name || summary.color_code);
      const document = name ? await readResource(call, "Item Color", name) : null;
      return { ...summary, ...(document ?? {}) };
    }));
  })();
  colorListCache.set(call, pending);
  void pending.catch(() => colorListCache.delete(call));
  return pending;
}

function scopeGroups(color: Json): string[] {
  if (!Array.isArray(color.applies_to_groups)) return [];
  return color.applies_to_groups
    .filter((row): row is Json => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    .map((row) => text(row.item_group))
    .filter(Boolean);
}

export function normalizeColorUsage(value: unknown): ColorUsage {
  const usage = text(value).toLocaleLowerCase("vi");
  if (["purchase", "mua", "mua hàng"].includes(usage)) return "purchase";
  if (["sales", "sale", "bán", "bán hàng"].includes(usage)) return "sales";
  return "internal";
}

export function colorUsageForDoctype(doctype: unknown): ColorUsage {
  const name = text(doctype);
  if ([
    "Material Request", "Supplier Quotation", "Purchase Order", "Purchase Receipt", "Purchase Invoice",
    "Material Request Item", "Supplier Quotation Item", "Purchase Order Item", "Purchase Receipt Item", "Purchase Invoice Item",
  ].includes(name)) return "purchase";
  if ([
    "Quotation", "Sales Order", "Delivery Note", "Sales Invoice",
    "Quotation Item", "Sales Order Item", "Delivery Note Item", "Sales Invoice Item",
  ].includes(name)) return "sales";
  return "internal";
}

function allowedForUsage(color: Json, usage: ColorUsage): boolean {
  if (usage === "internal") return true;
  const scope = text(color.usage_scope) || "Mua & bán";
  if (usage === "purchase") return scope !== "Bán hàng";
  return scope !== "Mua hàng";
}

async function groupLineage(call: ColorScopePlatformCall, itemGroup: string): Promise<string[]> {
  let cache = groupLineageCache.get(call);
  if (!cache) {
    cache = new Map();
    groupLineageCache.set(call, cache);
  }
  const normalized = text(itemGroup);
  const hit = cache.get(normalized);
  if (hit) return hit;
  const pending = (async () => {
    const lineage: string[] = [];
    const visited = new Set<string>();
    let current = normalized;
    while (current && lineage.length < 32) {
      if (visited.has(current)) throw new Error(`Cây Nhóm hàng bị lặp tại ${current}.`);
      visited.add(current);
      lineage.push(current);
      const group = await readResource(call, "Item Group", current);
      if (!group) throw new Error(`Nhóm hàng ${current} không tồn tại hoặc không còn được truy cập.`);
      current = text(group.parent_item_group);
    }
    return lineage;
  })();
  cache.set(normalized, pending);
  void pending.catch(() => cache?.delete(normalized));
  return pending;
}

/**
 * Màu không khai Nhóm SP áp dụng là màu dùng chung. Màu có phạm vi được kế thừa từ
 * nhóm hiện tại hoặc bất kỳ nhóm cha nào, để chuyển một nhánh cây không phải khai lại từng lá.
 */
export async function allowedColorNamesForGroup(
  call: ColorScopePlatformCall,
  itemGroup: string,
  usage: ColorUsage = "internal",
): Promise<string[]> {
  const group = text(itemGroup);
  if (!group) return [];
  const [colors, lineage] = await Promise.all([listColors(call), groupLineage(call, group)]);
  const groups = new Set(lineage);
  return colors
    .filter((color) => {
      if (checked(color.disabled)) return false;
      if (!allowedForUsage(color, usage)) return false;
      const scopes = scopeGroups(color);
      return scopes.length === 0 || scopes.some((scope) => groups.has(scope));
    })
    .map((color) => text(color.name || color.color_code))
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "vi"));
}

export async function colorScopeForItem(
  call: ColorScopePlatformCall,
  itemCode: string,
  usage: ColorUsage = "internal",
): Promise<{ item_group: string; allowed_colors: string[] }> {
  const code = text(itemCode);
  if (!code) throw new Error("Cần chọn mặt hàng để lấy danh sách màu.");
  const item = await readResource(call, "Item", code);
  if (!item) throw new Error(`Mặt hàng ${code} không tồn tại hoặc không còn được truy cập.`);
  const itemGroup = text(item.item_group);
  if (!itemGroup) throw new Error(`Mặt hàng ${code} chưa có Nhóm hàng.`);
  return {
    item_group: itemGroup,
    allowed_colors: await allowedColorNamesForGroup(call, itemGroup, usage),
  };
}
