type Json = Record<string, unknown>;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" },
});

function numberOf(value: unknown, name: string): number {
  const number = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${name} phải lớn hơn 0`);
  return number;
}

function calculate(args: Json) {
  const productGroup = String(args.product_group ?? "ĐỨC").trim().toUpperCase();
  if (productGroup !== "ĐỨC") throw new Error("P1 hiện chỉ hỗ trợ nhóm ĐỨC");

  const materialCode = String(args.material_code ?? "").trim().toUpperCase();
  if (!materialCode) throw new Error("Tên vật tư / SP là bắt buộc");

  const heightPb = numberOf(args.height_pb, "Cao PB");
  const widthBasis = String(args.width_basis ?? "RAY").trim().toUpperCase();
  const widthPb = numberOf(args.width_pb, widthBasis === "NHỰA" ? "Rộng PB nhựa" : "Rộng PB ray");
  const color = String(args.color ?? "").trim().toUpperCase();
  if (!color) throw new Error("Màu là bắt buộc");

  let deduction: number;
  let ruleCode: string;
  if (widthBasis === "RAY") {
    deduction = 0.08;
    ruleCode = "DE-CUT-RAY-008";
  } else if (widthBasis === "NHỰA" || widthBasis === "NHUA") {
    deduction = 0.02;
    ruleCode = "DE-CUT-PLASTIC-002";
  } else {
    throw new Error("Căn rộng chỉ nhận RAY hoặc NHỰA");
  }

  const cutWidth = Math.round((widthPb - deduction) * 1000) / 1000;
  if (cutWidth <= 0) throw new Error("Rộng cắt tính ra không hợp lệ");

  return {
    product_group: "ĐỨC",
    material_code: materialCode,
    height_pb: heightPb,
    width_basis: widthBasis === "NHUA" ? "NHỰA" : widthBasis,
    width_pb: widthPb,
    deduction_m: deduction,
    cut_width_m: cutWidth,
    color,
    requires_paint: color === "THÔ",
    rule_code: ruleCode,
    rule_version: "2026.08.15-v1",
    leaf_qty: null,
    leaf_qty_note: "Chưa tính ở P1: số lá phụ thuộc bản lá theo từng mã vật tư và quy tắc làm tròn.",
  };
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") return json({ message: "Method not allowed" }, 405);
    try {
      const body = await request.json() as { method?: unknown; args?: Json };
      const method = String(body.method ?? "");
      if (method !== "alumdoor.production.preview" && method !== "alumdoor.production.commit") {
        return json({ message: `Unknown AlumDoor method: ${method}` }, 404);
      }
      const result = calculate(body.args ?? {});
      return json({
        message: {
          ...result,
          phase: method.endsWith(".preview") ? "PREVIEW" : "CALCULATED",
        },
      });
    } catch (error) {
      return json({ message: error instanceof Error ? error.message : "Không tính được quy cách" }, 400);
    }
  },
};
