import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { compileBrief } from "../scripts/lib/compile-brief.mjs";
import { applyAlumdoorChildPresentation } from "../scripts/lib/alumdoor-child-presentation.mjs";

const briefUrl = new URL("../briefs/alumdoor-v2.json", import.meta.url);
const LAYOUT = new Set(["Heading", "Section Break", "Column Break", "HTML", "Tab Break", "Fold", "Button"]);

function sourceBrief() {
  return JSON.parse(fs.readFileSync(briefUrl, "utf8"));
}

function internalEditableOffenders(pkg) {
  return pkg.doctypes.flatMap((doctype) => doctype.fields
    .filter((field) => field.surface === "internal" && field.editMode === "editable")
    .map((field) => `${doctype.name}.${field.fieldname}`));
}

test("child presentation never compiles an internal field as editable", () => {
  const brief = sourceBrief();
  applyAlumdoorChildPresentation(brief);
  const pkg = compileBrief(brief);
  assert.deepEqual(internalEditableOffenders(pkg), []);

  for (const doctype of pkg.doctypes.filter((entry) => entry.is_child)) {
    for (const field of doctype.fields) {
      if (field.surface !== "internal" || LAYOUT.has(field.fieldtype)) continue;
      assert.equal(field.hidden, true, `${doctype.name}.${field.fieldname} internal field must be hidden`);
      assert.equal(field.editMode, "hidden", `${doctype.name}.${field.fieldname} internal field must use hidden edit mode`);
      assert.equal(field.serverEnforced, true, `${doctype.name}.${field.fieldname} internal field must be server-enforced`);
    }
  }
});

test("checked-in AlumDoor V2 brief materializes the internal-field invariant", () => {
  const brief = sourceBrief();
  const offenders = [];
  for (const doctype of brief.doctypes.filter((entry) => entry.child === true)) {
    for (const field of doctype.fields ?? []) {
      if (!field || typeof field !== "object" || field.surface !== "internal" || LAYOUT.has(field.fieldtype)) continue;
      if (field.hidden !== true || field.editMode !== "hidden" || field.serverEnforced !== true) {
        offenders.push(`${doctype.name}.${field.fieldname}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `generated internal fields drifted: ${offenders.join(", ")}`);
});
