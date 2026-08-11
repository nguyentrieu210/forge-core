import fs from "node:fs";

const target = new URL("../tests/o2c.test.mjs", import.meta.url);
let source = fs.readFileSync(target, "utf8");
const before = `test("Alumdoor Sales Order requires a server-managed price list", async () => {\n  const { kernel } = setup();\n  const base = { ...orderDocument(), company: "ALUMDOOR" };`;
const after = `test("Alumdoor Sales Order requires a server-managed price list", async () => {\n  const { store, kernel } = setup();\n  // Customer-group authority is now validated before price-list authority. Seed the\n  // customer basis explicitly so this regression continues to test its original contract.\n  store.seedMaster("Customer", "CUST-0001", "demo", { price_group: "Đại lý" });\n  const base = { ...orderDocument(), company: "ALUMDOOR" };`;
if (!source.includes(after)) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`o2c price-list regression anchor count=${count}`);
  source = source.replace(before, after);
  fs.writeFileSync(target, source);
}
console.log("sales O2C regression contract applied");
