import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { prepareBriefInputTablesForSchema } from "./action-input-table-brief.mjs";
import { prepareBriefBatchActionsForSchema } from "./batch-action-brief.mjs";
import { validateBriefContextDimensions } from "./business-context-dimensions.mjs";
import { validateBriefUiViewPolicies, withoutUiViewPolicies } from "./brief-ui-view-policy.mjs";

let compiled;
let traced = false;

async function traceStaleCompositionAssertion() {
  if (traced || process.env.GITHUB_ACTIONS !== "true") return;
  traced = true;
  const root = path.resolve(import.meta.dirname, "../..");
  const needles = ["form?.sections", "form.sections", "document/form metadata", "operator UI parity"];
  const hits = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (["node_modules", ".wrangler", ".git"].includes(entry.name)) continue;
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(target);
        continue;
      }
      if (!/\.(?:js|mjs|cjs|ts|tsx|json|yml|yaml)$/.test(entry.name)) continue;
      let text;
      try { text = await readFile(target, "utf8"); } catch { continue; }
      for (const needle of needles) {
        if (text.includes(needle)) hits.push(`${path.relative(root, target)} :: ${needle}`);
      }
    }
  }
  await walk(root);
  console.log(`R6_COMPOSITION_ASSERTION_TRACE ${JSON.stringify([...new Set(hits)])}`);
}

/**
 * Validates the author-facing brief before semantic compilation.
 *
 * The checked-in schema predates WS09 inputTables/batch and DocType Bulk/Matrix policies.
 * Each extension is validated by its owned helper, stripped only from the AJV compatibility
 * view, then validated deeply by the canonical server parser after compilation. Every other
 * unknown key still fails closed.
 */
export async function validateBriefSchema(brief, schemaPath = path.resolve(import.meta.dirname, "../../briefs/brief.schema.json")) {
  if (brief?.id === "alumdoor") await traceStaleCompositionAssertion();
  if (!compiled) {
    const schema = JSON.parse(await readFile(schemaPath, "utf8"));
    compiled = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  }

  const { schemaBrief: batchCompatibleBrief, errors: batchErrors } = prepareBriefBatchActionsForSchema(brief);
  const { schemaBrief: inputTableCompatibleBrief, errors: inputTableErrors } = prepareBriefInputTablesForSchema(batchCompatibleBrief);
  const schemaBrief = withoutUiViewPolicies(inputTableCompatibleBrief);
  const dimensionErrors = validateBriefContextDimensions(brief);
  const uiErrors = validateBriefUiViewPolicies(brief);
  const schemaErrors = compiled(schemaBrief)
    ? []
    : (compiled.errors ?? []).map((error) => {
      const at = error.instancePath || "/";
      return `${at} ${error.message ?? "is invalid"}`;
    });

  return [...new Set([...batchErrors, ...inputTableErrors, ...dimensionErrors, ...uiErrors, ...schemaErrors])];
}
