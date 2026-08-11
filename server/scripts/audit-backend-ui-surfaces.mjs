import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseField } from "./lib/compile-brief.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(here, "..");
const repoRoot = resolve(serverRoot, "..");
const programRoot = resolve(repoRoot, "docs/agents/backend-ui-reconciliation");

const PATHS = {
  salesOptionMigration: resolve(serverRoot, "migrations/tenant/0118_sales_price_variants_options.sql"),
  salesPackageMigration: resolve(serverRoot, "migrations/tenant/0119_sales_package_line_fulfillment.sql"),
  alumdoorBrief: resolve(serverRoot, "briefs/alumdoor-v2.json"),
  attendanceDay: resolve(serverRoot, "apps-src/alumdoor-attendance/doctypes/alumdoor-attendance-day.json"),
  payProfile: resolve(serverRoot, "apps-src/alumdoor-attendance/doctypes/alumdoor-pay-profile.json"),
  salaryController: resolve(serverRoot, "packages/clouderp-erpnext/src/hrm-salary-slip.ts"),
  matrix: resolve(programRoot, "BACKEND_UI_SURFACE_MATRIX.json"),
  summary: resolve(programRoot, "BACKEND_UI_SURFACE_MATRIX_SUMMARY.md"),
};

const BASELINE = "main@cecb19c51855ab3e6a05ce84261d717c630c96b7";
const INTERNAL_SALES_FIELDS = [
  "sales_option_code",
  "sales_option_label",
  "sales_option_version",
  "price_variant",
  "discount_basis_variant",
  "discount_basis_item_price",
  "sales_package",
  "sales_package_version",
  "sales_package_checksum",
  "sales_package_snapshot",
];
const SALES_SUMMARY_FIELDS = [
  "total_amount",
  "discount_amount",
  "surcharge_amount",
  "vat_rate",
  "vat_amount",
  "grand_total",
];

function relative(path) {
  return path.replace(`${repoRoot}/`, "").replaceAll("\\", "/");
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sqlJsonObjects(sql) {
  const objects = [];
  const pattern = /'(\{[\s\S]*?\})'/g;
  for (const match of sql.matchAll(pattern)) {
    try {
      objects.push(JSON.parse(match[1].replaceAll("''", "'")));
    } catch {
      // SQL migrations contain other quoted fragments; only valid JSON objects are contracts.
    }
  }
  return objects;
}

function sqlDoctype(sql, name) {
  return sqlJsonObjects(sql).find((value) => value?.name === name && Array.isArray(value.fields));
}

function statementTargets(statement, doctype) {
  const exact = statement.match(/WHERE\s+doctype\s*=\s*'([^']+)'/i);
  if (exact?.[1] === doctype) return true;
  const many = statement.match(/WHERE\s+doctype\s+IN\s*\(([^)]+)\)/i);
  if (!many) return false;
  return [...many[1].matchAll(/'([^']+)'/g)].some((match) => match[1] === doctype);
}

function sqlPatchedField(sql, doctype, fieldname) {
  for (const statement of sql.split(";")) {
    if (!statementTargets(statement, doctype)) continue;
    const field = sqlJsonObjects(statement).find((value) => value?.fieldname === fieldname);
    if (field) return field;
  }
  return undefined;
}

function fieldName(raw) {
  return typeof raw === "string" ? raw.split(":")[0].trim() : raw?.fieldname;
}

function normalizedBriefField(raw, index) {
  if (typeof raw === "string") return parseField(raw, index, "UI-REC-01");
  return raw;
}

function briefDoctype(brief, name) {
  return brief.doctypes.find((row) => row?.name === name);
}

function briefField(doctype, name) {
  const index = doctype?.fields?.findIndex((row) => fieldName(row) === name) ?? -1;
  if (index < 0) return undefined;
  return normalizedBriefField(doctype.fields[index], index);
}

function hasBriefNav(brief, doctype) {
  const meta = briefDoctype(brief, doctype);
  if (!meta || meta.child === true || meta.menu === false) return false;
  return true;
}

function schemaField(field) {
  if (!field) return null;
  return {
    fieldname: field.fieldname,
    fieldtype: field.fieldtype,
    ...(field.options ? { options: field.options } : {}),
    ...(field.required ? { required: true } : {}),
    ...(field.read_only ? { read_only: true } : {}),
    ...(field.hidden ? { hidden: true } : {}),
    ...(field.surface ? { surface: field.surface } : {}),
  };
}

function basicProjection({ metadataPresent, navPresent = null, listPresent = null, formPresent = null, gridPresent = null }) {
  return {
    metadata_present: metadataPresent,
    manifest_present: metadataPresent,
    navigation_present: navPresent,
    list_present: listPresent,
    form_present: formPresent,
    grid_present: gridPresent,
    workspace_present: false,
    actions_present: [],
  };
}

function row({ id, ownerApp, domain, doctype, surfaceKind, schema, projection, classification = ["OK"], severity = "P2", evidence = [], authority = {}, permission = {} }) {
  return {
    id,
    owner_app: ownerApp,
    domain,
    doctype,
    surface_kind: surfaceKind,
    schema: {
      exists: Boolean(schema?.exists),
      source: schema?.source ?? [],
      fields: schema?.fields ?? [],
      child_targets: schema?.child_targets ?? [],
      link_targets: schema?.link_targets ?? [],
      state_model: schema?.state_model ?? null,
      submittable: Boolean(schema?.submittable),
    },
    authority: {
      controller: authority.controller ?? null,
      methods: authority.methods ?? [],
      preview_methods: authority.preview_methods ?? [],
      side_effects: authority.side_effects ?? [],
      correction_or_cancel: authority.correction_or_cancel ?? [],
    },
    permission: {
      roles: permission.roles ?? [],
      server_enforced: permission.server_enforced ?? true,
    },
    projection,
    classification,
    severity,
    evidence,
  };
}

export function auditBackendUiSurfaces() {
  const salesOptionSql = readFileSync(PATHS.salesOptionMigration, "utf8");
  const salesPackageSql = readFileSync(PATHS.salesPackageMigration, "utf8");
  const brief = readJson(PATHS.alumdoorBrief);
  const attendanceDay = readJson(PATHS.attendanceDay);
  const payProfile = readJson(PATHS.payProfile);
  const salaryController = readFileSync(PATHS.salaryController, "utf8");

  const salesOption = sqlDoctype(salesOptionSql, "Sales Option");
  const salesPackage = sqlDoctype(salesPackageSql, "Sales Package");
  const salesPackageItem = sqlDoctype(salesPackageSql, "Sales Package Item");
  const salesOrder = briefDoctype(brief, "Sales Order");
  const salesOrderItem = briefDoctype(brief, "Sales Order Item");
  const purchaseReceipt = briefDoctype(brief, "Purchase Receipt");
  const purchaseReceiptItem = briefDoctype(brief, "Purchase Receipt Item");
  const stockReservation = briefDoctype(brief, "Stock Reservation");
  const stockReconciliation = briefDoctype(brief, "Stock Reconciliation");

  const backendSalesOption = sqlPatchedField(salesOptionSql, "Sales Order Item", "sales_option");
  const projectedSalesOption = briefField(salesOrderItem, "sales_option");
  const optionPackageField = salesOption?.fields?.find((field) => field.fieldname === "sales_package");
  const salesPackageTargetExists = Boolean(salesPackage);
  const optionPackageDrift = Boolean(optionPackageField && salesPackageTargetExists && (optionPackageField.fieldtype !== "Link" || optionPackageField.options !== "Sales Package"));
  const summaryMissing = SALES_SUMMARY_FIELDS.filter((name) => !briefField(salesOrder, name));
  const previewMethod = salesOrder?.form?.previewMethod ?? null;
  const previewDependencies = new Set(salesOrder?.form?.previewParentFields ?? []);
  const summaryProjectionOk = summaryMissing.length === 0 && previewMethod === "alumdoor.ui.preview_document" && previewDependencies.has("items") && previewDependencies.has("vat_rate");
  const leakedInternalFields = INTERNAL_SALES_FIELDS.filter((name) => {
    const field = briefField(salesOrderItem, name);
    return field && field.hidden !== true && field.surface !== "internal";
  });

  const rows = [];

  const salesOptionClasses = [];
  if (!briefDoctype(brief, "Sales Option")) salesOptionClasses.push("NAV_MISSING");
  if (optionPackageDrift) salesOptionClasses.push("SCHEMA_DRIFT");
  rows.push(row({
    id: "selling::Sales Option::master",
    ownerApp: "clouderp-selling",
    domain: "sales",
    doctype: "Sales Option",
    surfaceKind: "master",
    schema: {
      exists: Boolean(salesOption),
      source: [relative(PATHS.salesOptionMigration)],
      fields: (salesOption?.fields ?? []).map(schemaField),
      link_targets: (salesOption?.fields ?? []).filter((field) => field.fieldtype === "Link").map((field) => field.options),
    },
    projection: basicProjection({ metadataPresent: Boolean(salesOption), navPresent: false, listPresent: Boolean(salesOption), formPresent: Boolean(salesOption) }),
    classification: salesOptionClasses.length ? salesOptionClasses : ["OK"],
    severity: salesOptionClasses.includes("NAV_MISSING") ? "P0" : optionPackageDrift ? "P1" : "P2",
    evidence: [
      "0118 installs operator-maintained Sales Option metadata and an operator-facing sales_option Link on commercial rows.",
      optionPackageDrift
        ? "Sales Option.sales_package is still Data although 0118 states the package phase should upgrade it to a Sales Package Link; 0119 creates Sales Package without that upgrade."
        : "Sales Option.sales_package matches the installed Sales Package target.",
      "AlumDoor V2 does not declare Sales Option as a discoverable master; routing belongs to UI-REC-02.",
    ],
    permission: { roles: (salesOption?.permissions ?? []).map((entry) => entry.role) },
  }));

  rows.push(row({
    id: "selling::Sales Package::master",
    ownerApp: "clouderp-selling",
    domain: "sales",
    doctype: "Sales Package",
    surfaceKind: "master",
    schema: {
      exists: Boolean(salesPackage),
      source: [relative(PATHS.salesPackageMigration)],
      fields: (salesPackage?.fields ?? []).map(schemaField),
      child_targets: (salesPackage?.fields ?? []).filter((field) => field.fieldtype === "Table").map((field) => field.options),
      link_targets: (salesPackage?.fields ?? []).filter((field) => field.fieldtype === "Link").map((field) => field.options),
    },
    projection: basicProjection({ metadataPresent: Boolean(salesPackage), navPresent: false, listPresent: Boolean(salesPackage), formPresent: Boolean(salesPackage) }),
    classification: briefDoctype(brief, "Sales Package") ? ["OK"] : ["NAV_MISSING"],
    severity: briefDoctype(brief, "Sales Package") ? "P2" : "P0",
    evidence: [
      "0119 installs Sales Package as an operator-maintained Selling master with Sales Package Item components.",
      "AlumDoor V2 does not declare Sales Package as a discoverable master; routing belongs to UI-REC-02.",
    ],
    permission: { roles: (salesPackage?.permissions ?? []).map((entry) => entry.role) },
  }));

  rows.push(row({
    id: "selling::Sales Package Item::child",
    ownerApp: "clouderp-selling",
    domain: "sales",
    doctype: "Sales Package Item",
    surfaceKind: "child",
    schema: {
      exists: Boolean(salesPackageItem),
      source: [relative(PATHS.salesPackageMigration)],
      fields: (salesPackageItem?.fields ?? []).map(schemaField),
      link_targets: (salesPackageItem?.fields ?? []).filter((field) => field.fieldtype === "Link").map((field) => field.options),
    },
    projection: basicProjection({ metadataPresent: Boolean(salesPackageItem), navPresent: false, listPresent: false, formPresent: false, gridPresent: Boolean(salesPackage?.fields?.some((field) => field.fieldtype === "Table" && field.options === "Sales Package Item")) }),
    classification: salesPackageItem && salesPackage?.fields?.some((field) => field.fieldtype === "Table" && field.options === "Sales Package Item") ? ["OK"] : ["SCHEMA_DRIFT"],
    severity: "P1",
    evidence: ["0119 declares Sales Package.items -> Sales Package Item; the child is intentionally not a standalone navigation target."],
  }));

  const salesLineClasses = [];
  if (backendSalesOption && !projectedSalesOption) salesLineClasses.push("SCHEMA_DRIFT", "GRID_INCOMPLETE");
  if (leakedInternalFields.length) salesLineClasses.push("INTERNAL_LEAK");
  rows.push(row({
    id: "alumdoor::Sales Order Item::child",
    ownerApp: "alumdoor",
    domain: "sales",
    doctype: "Sales Order Item",
    surfaceKind: "child",
    schema: {
      exists: Boolean(salesOrderItem),
      source: [relative(PATHS.alumdoorBrief), relative(PATHS.salesOptionMigration), relative(PATHS.salesPackageMigration)],
      fields: [schemaField(backendSalesOption), schemaField(projectedSalesOption)].filter(Boolean),
      link_targets: backendSalesOption?.options ? [backendSalesOption.options] : [],
    },
    projection: basicProjection({ metadataPresent: Boolean(salesOrderItem), navPresent: false, listPresent: false, formPresent: false, gridPresent: Boolean(projectedSalesOption) }),
    classification: salesLineClasses.length ? [...new Set(salesLineClasses)] : ["OK"],
    severity: salesLineClasses.includes("SCHEMA_DRIFT") ? "P0" : leakedInternalFields.length ? "P0" : "P2",
    evidence: [
      backendSalesOption ? "0118 requires Sales Order Item.sales_option as an operator-facing quick Link." : "Missing backend Sales Order Item.sales_option contract.",
      projectedSalesOption ? "AlumDoor V2 projects sales_option." : "AlumDoor V2 Sales Order Item metadata does not project sales_option.",
      leakedInternalFields.length ? `Internal fields exposed: ${leakedInternalFields.join(", ")}.` : "No known Sales Option/Package snapshot field is exposed as an ordinary AlumDoor Sales Order Item field.",
      "Grid interaction implementation is owned by the Grid program; UI-REC-01 records the projection gap only.",
    ],
  }));

  rows.push(row({
    id: "alumdoor::Sales Order::transaction",
    ownerApp: "alumdoor",
    domain: "sales",
    doctype: "Sales Order",
    surfaceKind: "transaction",
    schema: {
      exists: Boolean(salesOrder),
      source: [relative(PATHS.alumdoorBrief)],
      fields: SALES_SUMMARY_FIELDS.map((name) => schemaField(briefField(salesOrder, name))).filter(Boolean),
      submittable: Boolean(salesOrder?.submittable),
    },
    authority: { preview_methods: previewMethod ? [previewMethod] : [] },
    projection: basicProjection({ metadataPresent: Boolean(salesOrder), navPresent: hasBriefNav(brief, "Sales Order"), listPresent: Boolean(salesOrder?.list?.length), formPresent: Boolean(salesOrder?.form), gridPresent: Boolean(briefField(salesOrder, "items")) }),
    classification: summaryProjectionOk ? ["OK"] : ["FORM_INCOMPLETE"],
    severity: summaryProjectionOk ? "P2" : "P0",
    evidence: [
      summaryProjectionOk
        ? "Sales Order canonical commercial summary fields are materialized and bound to alumdoor.ui.preview_document with items/vat_rate dependencies."
        : `Sales summary projection incomplete; missing=${summaryMissing.join(",") || "none"}, preview=${previewMethod ?? "none"}.`,
    ],
  }));

  for (const [doctypeName, meta] of [["Purchase Receipt", purchaseReceipt], ["Purchase Receipt Item", purchaseReceiptItem], ["Stock Reservation", stockReservation], ["Stock Reconciliation", stockReconciliation]]) {
    const child = meta?.child === true || doctypeName.endsWith(" Item");
    rows.push(row({
      id: `alumdoor::${doctypeName}::${child ? "child" : "transaction"}`,
      ownerApp: "alumdoor",
      domain: doctypeName.startsWith("Purchase") ? "procurement" : "inventory",
      doctype: doctypeName,
      surfaceKind: child ? "child" : "transaction",
      schema: { exists: Boolean(meta), source: [relative(PATHS.alumdoorBrief)], fields: (meta?.fields ?? []).map((field, index) => schemaField(normalizedBriefField(field, index))).filter(Boolean), submittable: Boolean(meta?.submittable) },
      projection: basicProjection({ metadataPresent: Boolean(meta), navPresent: child ? false : hasBriefNav(brief, doctypeName), listPresent: child ? false : Boolean(meta?.list?.length), formPresent: child ? false : Boolean(meta), gridPresent: child ? true : null }),
      classification: meta ? ["OK"] : ["FORM_INCOMPLETE"],
      severity: meta ? "P2" : "P0",
      evidence: [meta ? `${doctypeName} is present in exact AlumDoor V2 metadata.` : `${doctypeName} is absent from exact AlumDoor V2 metadata.`],
    }));
  }

  for (const [meta, sourcePath, kind] of [[attendanceDay, PATHS.attendanceDay, "transaction"], [payProfile, PATHS.payProfile, "master"]]) {
    const fields = meta?.fields ?? [];
    const internalLeaks = fields.filter((field) => field.hidden && field.serverEnforced !== true && /key|hash|snapshot|token/i.test(field.fieldname));
    rows.push(row({
      id: `alumdoor-attendance::${meta.name}::${kind}`,
      ownerApp: "alumdoor-attendance",
      domain: "attendance-payroll",
      doctype: meta.name,
      surfaceKind: kind,
      schema: {
        exists: true,
        source: [relative(sourcePath)],
        fields: fields.map(schemaField),
        child_targets: fields.filter((field) => field.fieldtype === "Table").map((field) => field.options),
        link_targets: fields.filter((field) => field.fieldtype === "Link").map((field) => field.options),
        submittable: Boolean(meta.is_submittable),
      },
      projection: basicProjection({ metadataPresent: true, navPresent: null, listPresent: true, formPresent: true, gridPresent: fields.some((field) => field.fieldtype === "Table") || null }),
      classification: internalLeaks.length ? ["INTERNAL_LEAK"] : ["OK"],
      severity: internalLeaks.length ? "P0" : "P2",
      evidence: [
        `${meta.name} metadata is package-owned under alumdoor-attendance and remains server-permission authoritative.`,
        meta.name === "AlumDoor Attendance Day" && salaryController.includes("buildAlumDoorSalarySlipInputs")
          ? "Salary Slip normalization consumes AlumDoor attendance/pay-profile inputs when alu_pay_profile is present."
          : "Static backend/meta contract present.",
      ],
      permission: { roles: (meta.permissions ?? []).map((entry) => entry.role) },
    }));
  }

  rows.sort((left, right) => left.id.localeCompare(right.id));
  return {
    program: "backend-ui-reconciliation-20260811",
    workstream: "UI-REC-01",
    baseline: BASELINE,
    generated_from: [
      relative(PATHS.salesOptionMigration),
      relative(PATHS.salesPackageMigration),
      relative(PATHS.alumdoorBrief),
      relative(PATHS.attendanceDay),
      relative(PATHS.payProfile),
      relative(PATHS.salaryController),
    ],
    rows,
  };
}

function issueRows(matrix) {
  return matrix.rows.filter((entry) => !entry.classification.includes("OK"));
}

export function renderBackendUiSummary(matrix) {
  const issues = issueRows(matrix);
  const bySeverity = { P0: 0, P1: 0, P2: 0 };
  for (const entry of issues) bySeverity[entry.severity] = (bySeverity[entry.severity] ?? 0) + 1;
  const lines = [
    "# UI-REC-01 — BACKEND/UI SURFACE MATRIX SUMMARY",
    "",
    `Baseline: \`${matrix.baseline}\``,
    "Status: evidence-backed P0-first audit; no production mutation.",
    "",
    "## Coverage",
    "",
    `- Rows audited: **${matrix.rows.length}**`,
    `- Rows with findings: **${issues.length}**`,
    `- P0: **${bySeverity.P0}** · P1: **${bySeverity.P1}** · P2: **${bySeverity.P2}**`,
    "- Focus: Sales commercial, Procurement, Inventory/ATP projection, Attendance/Payroll metadata.",
    "",
    "## P0/P1 findings",
    "",
  ];
  if (!issues.length) lines.push("No P0/P1 static drift found in the audited slice.");
  for (const entry of issues.filter((item) => item.severity === "P0" || item.severity === "P1")) {
    lines.push(`### ${entry.severity} — ${entry.doctype}`);
    lines.push("");
    lines.push(`Classification: ${entry.classification.map((value) => `\`${value}\``).join(", ")}`);
    lines.push("");
    for (const evidence of entry.evidence) lines.push(`- ${evidence}`);
    lines.push("");
  }
  lines.push(
    "## Dependency Requests",
    "",
    "### DR-UIREC01-001",
    "",
    "Dependency Request  ",
    "Owner: UI-REC-02 NAV  ",
    "Need: expose `Sales Option` and `Sales Package` as role-aware AlumDoor operator masters in declarative navigation/catalog.  ",
    "Why: both masters are installed backend metadata and ordinary Sales Manager configuration; UI-REC-01 does not own sidebar/catalog declarations.  ",
    "Blocked scope: discoverable commercial configuration.  ",
    "Can continue independently: yes  ",
    "Next independent work: static drift validators and remaining backend/meta audit.  ",
    "",
    "### DR-UIREC01-002",
    "",
    "Dependency Request  ",
    "Owner: UI-REC-03 FORMS + Grid program  ",
    "Need: project `Sales Order Item.sales_option` from the canonical 0118 backend metadata into AlumDoor child metadata; Grid owner validates interaction/runtime parity.  ",
    "Why: 0118 marks the field operator-facing `surface=quick`, but the current AlumDoor V2 Sales Order Item projection omits it.  ",
    "Blocked scope: operator choice of canonical Sales Option on Sales Order rows.  ",
    "Can continue independently: yes  ",
    "Next independent work: non-Grid parity validation.  ",
    "",
    "### DR-UIREC01-003",
    "",
    "Dependency Request  ",
    "Owner: Sales/domain authority  ",
    "Need: decide and implement an append-only correction if `Sales Option.sales_package` is intended to be a `Link(Sales Package)` as stated by migration 0118.  ",
    "Why: 0119 creates Sales Package but does not perform the promised type/target upgrade; changing an applied schema contract is outside UI-REC-01 ownership.  ",
    "Blocked scope: strict Link-target parity for Sales Option package configuration.  ",
    "Can continue independently: yes  ",
    "Next independent work: matrix/gate completion.  ",
    "",
    "## Gate semantics",
    "",
    "The auditor records current drift instead of making this worker red merely because another owner has not converged yet. Tests fail when the detector stops seeing an evidence-backed current contract or when a resolved invariant regresses. UI-REC-05 may promote resolved classifications into blocking convergence gates.",
    "",
  );
  return `${lines.join("\n")}\n`;
}

export function serializeBackendUiMatrix(matrix) {
  return `${JSON.stringify(matrix, null, 2)}\n`;
}

function main() {
  const matrix = auditBackendUiSurfaces();
  const matrixText = serializeBackendUiMatrix(matrix);
  const summaryText = renderBackendUiSummary(matrix);
  if (process.argv.includes("--check")) {
    const currentMatrix = readFileSync(PATHS.matrix, "utf8");
    const currentSummary = readFileSync(PATHS.summary, "utf8");
    if (currentMatrix !== matrixText || currentSummary !== summaryText) {
      console.error("BACKEND_UI_SURFACE_MATRIX_OUT_OF_DATE");
      process.exitCode = 1;
      return;
    }
    console.log(`BACKEND_UI_SURFACE_MATRIX_CHECK_PASS rows=${matrix.rows.length} findings=${issueRows(matrix).length}`);
    return;
  }
  writeFileSync(PATHS.matrix, matrixText);
  writeFileSync(PATHS.summary, summaryText);
  console.log(`BACKEND_UI_SURFACE_MATRIX_WRITTEN rows=${matrix.rows.length} findings=${issueRows(matrix).length}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
