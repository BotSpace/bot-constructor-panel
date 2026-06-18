# Credential & dynamic node-config fields

Two reusable node-config field types let any node use the credential system. Both are declared
**declaratively** in a node's manifest `content` (`src/features/bot-constructor/nodes/manifests/runtime-node-registry.json`)
and rendered by the field-widget registries — no per-node React code needed.

The field renderers live in:
- `src/features/bot-constructor/nodes/registry/fieldWidgetRegistry.tsx` (compact canvas body — both
  field types are in `PANEL_ONLY_FIELD_TYPES`, i.e. shown only in the edit panel)
- `src/features/bot-constructor/components/NodeEditPanel/modal-field-widgets.tsx` (the edit panel)

Manifest field typing is in `src/features/bot-constructor/nodes/registry/types.ts` (`NodeFieldManifest`).
Backend reference: `backend/core/apps/credentials/README.md`.

---

## 1. `credential` — pick a stored credential

```jsonc
{ "type": "credential",
  "key": "credential_id",          // node-data key where the chosen credential id (number) is stored
  "credentialType": "google_sheets",// OPTIONAL: only show credentials of this type; omit = show all
  "label": "Credential" }
```
Component: `nodes/widgets/generic-fields/CredentialSelectField.tsx`. Lists the user's credentials
(filtered by `credentialType`), with an inline "+ new credential" that opens the create modal locked
to that type. For OAuth types the create flow is a "Connect" popup.

## 2. `dynamic_select` — options loaded from a 3rd-party API via the credential

```jsonc
{ "type": "dynamic_select",
  "key": "spreadsheet_id",
  "resource": "google_spreadsheets",   // a loader registered in backend services/options.py
  "credentialKey": "credential_id",    // OPTIONAL: which field holds the credential (default credential_id)
  "dependsOn": ["..."],                // OPTIONAL: other data keys passed as params; field disables until set
  "label": "Spreadsheet" }
```
Component: `nodes/widgets/generic-fields/DynamicSelectField.tsx`. POSTs
`/v1/credentials/options/<resource>/ {credential_id, params:{<dependsOn>}}` and renders a searchable
dropdown. Reloads when the credential or any `dependsOn` value changes; per-(resource+credential+params)
cache + refresh button; `allowCustom` (default true) also lets users type a literal / `{{var}}`.

**Chaining** (Google Sheets node): `credential_id` → `spreadsheet_id` (google_spreadsheets) →
`sheet` (google_sheet_tabs, dependsOn spreadsheet_id) → `column` (google_sheet_columns, dependsOn
spreadsheet_id+sheet). Each waits for its parents.

---

## Recipe: a new node that uses credentials

1. **Backend**: ensure a credential type exists (`registry.py`) and, if you need dropdowns, an option
   loader (`services/options.py`).
2. **Engine**: the handler reads `data["credential_id"]` and uses the shared resolver (see backend README).
3. **Panel**: add the node to `runtime-node-registry.json` with a `credential` field + any
   `dynamic_select` fields. Nothing else — the renderers already handle these types.
4. **agentv3**: register the node's data schema so the AI can emit it.

The credential id is the only secret-bearing value stored in the flow; the token stays server-side.
