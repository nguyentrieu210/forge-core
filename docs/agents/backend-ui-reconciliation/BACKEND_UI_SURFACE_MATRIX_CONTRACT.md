# BACKEND/UI SURFACE MATRIX CONTRACT

Program: `program/backend-ui-reconciliation-20260811`
Baseline: `main@cecb19c51855ab3e6a05ce84261d717c630c96b7`

## Purpose

Define one reproducible contract for determining whether a backend capability is correctly projected into metadata-driven UI. The matrix is evidence, not a second source of business truth.

## Canonical row identity

Prefer one row per user-relevant capability surface. For a DocType-backed capability use:

```text
<app>::<doctype>::<surface>
```

where surface is one of:

```text
master
transaction
child
report
action
workspace
```

A DocType may therefore have more than one row if it has materially different operator surfaces.

## Required fields

Each JSON row should contain:

```json
{
  "id": "alumdoor::Sales Option::master",
  "owner_app": "...",
  "domain": "sales",
  "doctype": "Sales Option",
  "surface_kind": "master",
  "schema": {
    "exists": true,
    "source": [],
    "fields": [],
    "child_targets": [],
    "link_targets": [],
    "state_model": null,
    "submittable": false
  },
  "authority": {
    "controller": null,
    "methods": [],
    "preview_methods": [],
    "side_effects": [],
    "correction_or_cancel": []
  },
  "permission": {
    "roles": [],
    "server_enforced": true
  },
  "projection": {
    "metadata_present": false,
    "manifest_present": false,
    "navigation_present": false,
    "list_present": false,
    "form_present": false,
    "grid_present": null,
    "workspace_present": false,
    "actions_present": []
  },
  "classification": ["NAV_MISSING"],
  "severity": "P0",
  "evidence": []
}
```

## Field-level reconciliation

For every operator-relevant field, compare at least:

- fieldname;
- fieldtype;
- Link/Dynamic Link target;
- child table target;
- requiredness;
- read-only/server-owned semantics;
- hidden/internal classification;
- default;
- depends_on / mandatory_depends_on / read_only_depends_on;
- fetch_from / fetch_if_empty;
- precision/money precision where material;
- field permission/permlevel where material;
- whether a server preview/action may patch the field.

Do not require a 1:1 visible column for every backend field. A backend field may intentionally be internal. The matrix must distinguish `present in metadata` from `visible to operator`.

## Preview parity rule

For every named preview used by a form or child table:

1. determine the set of patchable/clearable output fields from source/tests;
2. verify every output intended for the user exists in metadata;
3. verify the renderer accepts only declared fields;
4. verify preview dependencies are declared so relevant parent/child changes trigger refresh;
5. classify server outputs that cannot materialize as `FORM_INCOMPLETE` or `GRID_INCOMPLETE`.

The Sales Order summary regression is the reference failure mode: server values existed, but absent metadata meant the generic form could not display them.

## Required-field reachability rule

A server-required field is acceptable when at least one valid operator surface can edit/provide it before the authoritative transition that requires it.

A field does **not** need to be permanently visible in compact view merely because it can become conditionally required. Reachability may be via:

- applicable dynamic column;
- expanded/full surface;
- row detail;
- explicit workflow/action dialog;
- trusted server-derived/defaulted value when the user is not expected to choose it.

If a user can reach a state where the server requires a value but no usable editor exists, classify `FORM_INCOMPLETE` or `GRID_INCOMPLETE` P0/P1 depending on the flow.

## Internal leakage rule

Fields representing implementation/audit snapshots should default to internal, including examples such as:

```text
source_line_key
price_variant snapshots
sales_package snapshots
formula version/trace
hash/idempotency tokens
ledger row identifiers
server reconciliation keys
```

They may be exposed only when a defined business/audit user outcome requires them. Raw presence in schema is not justification for normal list/form/grid display.

## Navigation rule

A master/configuration DocType needs discoverable navigation when ordinary authorized users must maintain it. It may be intentionally hidden when it is:

- system-owned;
- seeded/managed only by installation/config automation;
- exclusively maintained through another bounded workflow;
- an internal child/technical DocType.

The audit must record the reason for `navigation_present=false` rather than assuming every DocType deserves a menu item.

## Severity

Use:

- `P0` — blocks a core workflow, can produce wrong operator decisions, missing mandatory configuration, broken authority projection, permission/security exposure;
- `P1` — material operational friction/incomplete long-tail path, but core flow has a valid workaround;
- `P2` — cleanup, consistency, discoverability or presentation debt without material correctness risk.

## Validation output

The audit should produce:

1. `BACKEND_UI_SURFACE_MATRIX.json` — machine-readable truth;
2. `BACKEND_UI_SURFACE_MATRIX_SUMMARY.md` — counts and P0/P1 findings;
3. targeted tests/validators for every drift class that can be statically proven;
4. Dependency Requests for gaps owned by Grid/runtime/domain teams rather than cross-editing their hotspots.
