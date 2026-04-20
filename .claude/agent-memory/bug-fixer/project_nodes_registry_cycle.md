---
name: nodes-registry-cycle-gotcha
description: Circular import can occur when shared bot-constructor utils import the nodes barrel while used by registry widgets.
type: project
---

Avoid importing `@/features/bot-constructor/nodes` (or `../nodes`) inside shared libs used by registry widgets/renderers; it can create an initialization cycle and crash module loading.
**Why:** `findNearestParentAction` imported the nodes barrel to read `ActionsTextAndMedia`, and that utility was used by `nodes/registry/widgetRegistry.tsx` during registry bootstrap, producing a circular init path (`nodes/index -> registry/index -> ... -> widgetRegistry -> findNearestParentAction -> nodes/index`) and runtime failure reading `runtimeNodeRegistry`.
**How to apply:** In registry-adjacent utilities, derive node type sets from low-level manifest modules (e.g. `registry/manifestStore`) or pass them as arguments instead of importing the nodes barrel.
