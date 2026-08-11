import { aluminumItemContract } from "./aluminum-purchase-closure.js";

interface ValidatorSubject {
  doctype: string;
  name: string;
  action: string;
  payload: Record<string, unknown>;
}

interface ValidatorEnv {
  PLATFORM?: Fetcher;
}

const accept = () => Response.json({ ok: true });
const refuse = (message: string) => Response.json({ message }, { status: 422 });

function checked(value: unknown): boolean {
  if (value === true || value === 1 || value === "1") return true;
  const normalized = String(value ?? "").trim().toLocaleLowerCase("vi");
  return normalized === "có" || normalized === "co" || normalized === "yes" || normalized === "true";
}

async function readCurrentItem(
  request: Request,
  env: ValidatorEnv,
  name: string,
): Promise<Record<string, unknown> | null> {
  const callback = request.headers.get("x-cloudforge-callback")?.replace(/\/$/, "");
  if (!callback || !name) return null;
  if (!env.PLATFORM) throw new Error("thiếu PLATFORM service binding để đọc Item hiện tại");
  const headers = new Headers(request.headers);
  headers.delete("content-length");
  headers.set("content-type", "application/json");
  const outbound = new Request(`${callback}/resource/Item/${encodeURIComponent(name)}`, { headers });
  const response = await env.PLATFORM.fetch(outbound);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`không đọc được Item ${name} (HTTP ${response.status})`);
  return ((await response.json()) as { data?: Record<string, unknown> }).data ?? null;
}

async function subjectDocument(request: Request, env: ValidatorEnv): Promise<{ subject: ValidatorSubject; doc: Record<string, unknown> }> {
  const subject = await request.clone().json() as ValidatorSubject;
  const current = subject.action === "save" ? await readCurrentItem(request, env, subject.name) : null;
  return { subject, doc: { ...(current ?? {}), ...(subject.payload ?? {}) } };
}

/** Generic catalog invariants keep the exact main-branch business-facing error priority. */
export async function validateItemCatalogInvariants(request: Request, env: ValidatorEnv): Promise<Response> {
  try {
    const { subject, doc } = await subjectDocument(request, env);
    if (subject.doctype !== "Item") return accept();
    const code = String(doc.item_code ?? subject.name ?? "").trim() || "Item";
    const nature = String(doc.item_nature ?? "").trim();
    const stage = String(doc.material_stage ?? "").trim();
    const supply = String(doc.supply_type ?? "").trim();

    if (nature === "Dịch vụ") {
      if (checked(doc.is_stock_item)) return refuse(`${code}: dịch vụ không được bật Quản lý tồn kho.`);
      if (checked(doc.include_item_in_manufacturing)) return refuse(`${code}: dịch vụ không được tham gia sản xuất.`);
      const reorderLevels = Array.isArray(doc.reorder_levels) ? doc.reorder_levels : [];
      if (String(doc.stock_uom ?? "").trim() || String(doc.default_warehouse ?? "").trim()
        || checked(doc.has_batch_no) || checked(doc.has_serial_no) || reorderLevels.length) {
        return refuse(`${code}: dịch vụ không được giữ ĐVT tồn, kho mặc định, batch/serial hoặc mức đặt lại.`);
      }
      return accept();
    }

    const allowedStages = new Set(["Nguyên vật liệu", "Vật tư tiêu hao", "Bán thành phẩm", "Thành phẩm", "Hàng hoá"]);
    const allowedSupplies = new Set(["Mua ngoài", "Tự sản xuất", "Mua hoặc sản xuất"]);
    if (!allowedStages.has(stage)) return refuse(`${code}: Giai đoạn vật tư ${stage || "<trống>"} không hợp lệ.`);
    if (!allowedSupplies.has(supply)) return refuse(`${code}: Nguồn cung ${supply || "<trống>"} không hợp lệ.`);
    if ((supply === "Mua ngoài" || supply === "Mua hoặc sản xuất") && !checked(doc.is_purchase_item)) {
      return refuse(`${code}: Nguồn cung ${supply} phải bật Được phép mua.`);
    }
    const produced = supply === "Tự sản xuất" || supply === "Mua hoặc sản xuất";
    const productionStage = stage === "Bán thành phẩm" || stage === "Thành phẩm";
    if ((produced || productionStage) && !checked(doc.include_item_in_manufacturing)) {
      return refuse(`${code}: mặt hàng bán thành phẩm/thành phẩm hoặc tự sản xuất phải bật Dùng trong sản xuất.`);
    }
    return accept();
  } catch (error) {
    return refuse(`Alumdoor không kiểm tra được Item: ${error instanceof Error ? error.message : "lỗi không xác định"}`);
  }
}

/**
 * Strict aluminum contract runs only after generic catalog + historical master/profile validation.
 * Returning null means the Item is not an aluminum dimensional stock item.
 */
export async function validateCanonicalAluminumItem(request: Request, env: ValidatorEnv): Promise<Response | null> {
  try {
    const { subject, doc } = await subjectDocument(request, env);
    if (subject.doctype !== "Item" || String(doc.inventory_mode ?? "").trim() !== "Nhôm cây/lá") return null;
    const code = String(doc.item_code ?? subject.name ?? "").trim() || "Item";
    const contract = aluminumItemContract(doc);
    if (!contract.ok) return refuse(`${code}: cấu hình tồn nhôm chưa hội tụ — ${contract.issues.join("; ")}.`);
    if (Array.isArray(doc.uom_conversions) && doc.uom_conversions.length > 0) {
      return refuse(`${code}: nhôm catch-weight không được khai hệ số quy đổi Kg↔Cây tĩnh; số cây và kg thực là hai quan sát độc lập.`);
    }
    if (!checked(doc.is_stock_item)) return refuse(`${code}: nhôm cây/lá phải bật Quản lý tồn kho.`);
    return Response.json({ ok: true, aluminum_contract: true, stock_uom: contract.stock_uom });
  } catch (error) {
    return refuse(`Alumdoor không kiểm tra được contract tồn nhôm: ${error instanceof Error ? error.message : "lỗi không xác định"}`);
  }
}
