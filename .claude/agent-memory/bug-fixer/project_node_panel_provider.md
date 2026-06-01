---
name: project-node-panel-provider
description: NodePanelProvider must wrap ModalNodeFormRenderer so TelegramRichTextEditor renders the editable TipTap editor instead of a read-only div in the node edit dialog
metadata:
  type: project
---

`TelegramRichTextEditor` uses `useIsInNodePanel()` to decide whether to render the interactive TipTap editor (`true`) or a read-only `<div>` (`false`). Without a `NodePanelProvider` ancestor, the context defaults to `false`, making all rich-text fields appear as non-editable previews even inside the `NodeEditDialog`.

**Why:** `NodeEditDialog` uses `ModalNodeFormRenderer` which renders widgets (including `TelegramRichTextEditor`) via `renderCustomWidget` from `widgetRegistry.tsx`. None of these provide the `NodePanelProvider`, so `inPanel` is always `false` and the editor never renders.

**How to apply:** Any time a node widget that relies on `useIsInNodePanel()` is rendered outside a React Flow canvas node (e.g. inside a dialog, sidebar, or sheet), wrap the content in `<NodePanelProvider>`. The fix lives in `ModalNodeFormRenderer` — it wraps its return in `<NodePanelProvider>`.

Related: [[project_handlers_list_collapsed]]
