const VIEW_BUCKETS = [
  ["list", "columns"],
  ["form", "fields"],
  ["quickEntry", "fields"],
];

const OPERATOR_EDIT_MODES = new Set(["editable", "immutable_after_submit", "set_once"]);
const USER_VALUE_SOURCES = new Set(["user", "link"]);

function finding(classification, severity, doctype, message, extra = {}) {
  return { classification, severity, doctype, message, ...extra };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function fieldMap(doctype) {
  return new Map(asArray(doctype?.fields).map((field) => [field?.fieldname, field]));
}

function visibleViewFields(doctype) {
  const values = new Set();
  const policy = doctype?.viewPolicy ?? {};
  for (const [view, key] of VIEW_BUCKETS) {
    for (const fieldname of asArray(policy?.[view]?.[key])) values.add(fieldname);
  }
  return values;
}

function viewReferences(doctype) {
  const references = [];
  const policy = doctype?.viewPolicy ?? {};
  for (const [view, key] of VIEW_BUCKETS) {
    for (const fieldname of asArray(policy?.[view]?.[key])) references.push({ view, fieldname });
  }
  return references;
}

function hasUsableOperatorInput(field, visibleFields) {
  if (!field?.required) return true;
  if (field.default !== undefined && field.default !== null && field.default !== "") return true;
  if (field.serverEnforced === true) return true;
  if (["system", "workflow", "formula"].includes(field.valueSource)) return true;
  if (field.read_only === true || field.hidden === true || field.surface === "internal") return false;
  if (field.editMode && !OPERATOR_EDIT_MODES.has(field.editMode)) return false;
  if (field.valueSource && !USER_VALUE_SOURCES.has(field.valueSource) && field.valueSource !== "default") return true;
  return visibleFields.has(field.fieldname);
}

/**
 * Static backend↔metadata drift validator.
 *
 * It deliberately does not decide business formulas, stock/accounting/payroll semantics,
 * or whether every backend field should be visible. It only rejects contradictions that
 * are provable from the supplied metadata contract itself.
 */
export function validateBackendUiContract({
  doctypes = [],
  externalDocTypes = [],
  nav = [],
  actions = [],
  previewContracts = [],
  closedWorldLinks = false,
} = {}) {
  const findings = [];
  const known = new Set(asArray(doctypes).map((doctype) => doctype?.name).filter(Boolean));
  const external = new Set(asArray(externalDocTypes).map((entry) => typeof entry === "string" ? entry : entry?.name).filter(Boolean));
  const validTarget = (target) => known.has(target) || external.has(target);

  for (const doctype of asArray(doctypes)) {
    if (!doctype?.name) {
      findings.push(finding("DEAD_METADATA", "P0", "<unknown>", "DocType metadata is missing name."));
      continue;
    }

    const names = new Set();
    for (const field of asArray(doctype.fields)) {
      if (!field?.fieldname) {
        findings.push(finding("DEAD_METADATA", "P0", doctype.name, "Field metadata is missing fieldname."));
        continue;
      }
      if (names.has(field.fieldname)) {
        findings.push(finding("SCHEMA_DRIFT", "P0", doctype.name, `Duplicate field ${field.fieldname}.`, { field: field.fieldname }));
      }
      names.add(field.fieldname);

      if (["Link", "Table"].includes(field.fieldtype)) {
        if (!field.options) {
          findings.push(finding("SCHEMA_DRIFT", "P0", doctype.name, `${field.fieldname} is ${field.fieldtype} without target options.`, { field: field.fieldname }));
        } else if (closedWorldLinks && !validTarget(field.options)) {
          findings.push(finding("SCHEMA_DRIFT", "P0", doctype.name, `${field.fieldname} targets missing DocType ${field.options}.`, { field: field.fieldname, target: field.options }));
        }
      }
    }

    const fields = fieldMap(doctype);
    for (const { view, fieldname } of viewReferences(doctype)) {
      if (!fields.has(fieldname)) {
        findings.push(finding("DEAD_METADATA", "P0", doctype.name, `${view} references missing field ${fieldname}.`, { field: fieldname, view }));
      }
    }

    const visible = visibleViewFields(doctype);
    for (const field of fields.values()) {
      const leaked = (field.surface === "internal" || field.hidden === true)
        && visible.has(field.fieldname);
      if (leaked) {
        findings.push(finding("INTERNAL_LEAK", "P0", doctype.name, `Internal field ${field.fieldname} is projected into an operator view.`, { field: field.fieldname }));
      }

      if (doctype.kind !== "child_table" && doctype.is_child !== true && field.required && !hasUsableOperatorInput(field, visible)) {
        findings.push(finding("FORM_INCOMPLETE", "P0", doctype.name, `Required field ${field.fieldname} has no statically reachable input or server/default source.`, { field: field.fieldname }));
      }
    }
  }

  for (const item of asArray(nav)) {
    if (item?.kind === "doctype" && !known.has(item.key)) {
      findings.push(finding("DEAD_METADATA", "P0", item.key ?? "<nav>", `Navigation targets missing DocType ${item.key}.`, { nav_key: item.key }));
    }
    if (item?.permission_doctype && !validTarget(item.permission_doctype)) {
      findings.push(finding("PERMISSION_MISMATCH", "P0", item.permission_doctype, `Navigation permission target ${item.permission_doctype} is not declared or external.`, { nav_key: item.key }));
    }
  }

  for (const action of asArray(actions)) {
    if (!action?.name) {
      findings.push(finding("ACTION_UNWIRED", "P0", "<action>", "Action metadata is missing name."));
      continue;
    }
    if (action.permission_doctype && !validTarget(action.permission_doctype)) {
      findings.push(finding("ACTION_UNWIRED", "P0", action.permission_doctype, `Action ${action.name} permission target ${action.permission_doctype} is missing.`, { action: action.name }));
    }
  }

  for (const contract of asArray(previewContracts)) {
    const doctype = asArray(doctypes).find((entry) => entry?.name === contract?.doctype);
    if (!doctype) {
      findings.push(finding("FORM_INCOMPLETE", "P0", contract?.doctype ?? "<preview>", "Preview contract targets missing DocType."));
      continue;
    }
    const fields = fieldMap(doctype);
    for (const output of asArray(contract.outputs)) {
      if (!fields.has(output)) {
        findings.push(finding("FORM_INCOMPLETE", "P0", doctype.name, `Preview output ${output} is missing from metadata.`, { field: output, method: contract.method ?? null }));
      }
    }
  }

  return findings.sort((left, right) => {
    const a = `${left.doctype}\u0000${left.classification}\u0000${left.field ?? ""}\u0000${left.message}`;
    const b = `${right.doctype}\u0000${right.classification}\u0000${right.field ?? ""}\u0000${right.message}`;
    return a.localeCompare(b);
  });
}
