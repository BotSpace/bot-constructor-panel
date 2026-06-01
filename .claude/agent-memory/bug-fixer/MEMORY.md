# Bug Fixer Agent Memory

## Project Patterns

- [HandlersList must be outside collapsed block](project_handlers_list_collapsed.md) — React Flow Handle components inside HandlersList break edges on collapse; always render unconditionally before SourceHandles
- [Avoid nodes barrel in registry utils](project_nodes_registry_cycle.md) — shared helpers used by node registry must not import `nodes/index` to prevent circular initialization crashes
- [NodePanelProvider required in edit dialogs](project_node_panel_provider.md) — TelegramRichTextEditor and other context-aware widgets render read-only without NodePanelProvider; wrap ModalNodeFormRenderer content in it
