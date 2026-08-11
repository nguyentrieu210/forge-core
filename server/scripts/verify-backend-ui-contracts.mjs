#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseAppManifest } from "../dist/packages/app-registry/src/index.js";
import { readAppSource } from "./lib/read-app-source.mjs";
import { validateBackendUiContract } from "./lib/backend-ui-contract-validator.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, "..");

// Keep this census aligned with verify-first-party-meta.mjs. These are the canonical Meta v1
// first-party packages spanning Service, Projects, HR, Finance, Organization/Security and
// Manufacturing/QMS. AlumDoor's vertical P0 slice is audited separately because it is generated
// from the V2 brief plus generic Selling migrations rather than one closed Meta v1 source package.
const sources = [
  "maintenance",
  "projects",
  "support",
  "visits",
  "hrm",
  "vn-accounting",
  "erp-organization-security",
  "manufacturing-qms",
];

const failures = [];
let doctypeCount = 0;
let fieldCount = 0;
let navCount = 0;
let actionCount = 0;

for (const source of sources) {
  const sourceDir = path.join(serverRoot, "apps-src", source);
  let manifest;
  try {
    manifest = parseAppManifest(await readAppSource(sourceDir));
  } catch (error) {
    failures.push(`${source}: cannot compile canonical app source: ${error.message}`);
    continue;
  }

  const findings = validateBackendUiContract({
    doctypes: manifest.doctypes,
    externalDocTypes: manifest.externalDocTypes,
    nav: manifest.nav,
    actions: manifest.actions,
    closedWorldLinks: true,
  });

  doctypeCount += manifest.doctypes.length;
  fieldCount += manifest.doctypes.reduce((total, doctype) => total + doctype.fields.length, 0);
  navCount += manifest.nav.length;
  actionCount += manifest.actions.length;

  if (findings.length) {
    for (const finding of findings) {
      failures.push(
        `${source}/${finding.doctype}: ${finding.classification} ${finding.message}`,
      );
    }
    continue;
  }

  console.log(
    `BACKEND_UI_CONTRACT_PASS app=${manifest.id}@${manifest.version}`
      + ` doctypes=${manifest.doctypes.length}`
      + ` fields=${manifest.doctypes.reduce((total, doctype) => total + doctype.fields.length, 0)}`
      + ` nav=${manifest.nav.length}`
      + ` actions=${manifest.actions.length}`,
  );
}

if (failures.length) {
  console.error(`BACKEND_UI_CONTRACT_FAIL count=${failures.length}`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `BACKEND_UI_CONTRACT_SWEEP_PASS apps=${sources.length}`
    + ` doctypes=${doctypeCount}`
    + ` fields=${fieldCount}`
    + ` nav=${navCount}`
    + ` actions=${actionCount}`,
);
