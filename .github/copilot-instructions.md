# Copilot Instructions — Bot Constructor Panel

## Build, test, and lint

```bash
npm run dev         # Next.js dev server on :3001
npm run dev:mono    # MONO=1 + Turbopack + :3001
npm run build       # production build
npm run start       # run production app
npm run lint        # Next.js ESLint
```

There is currently no automated test command in `package.json`, so there is no single-test command yet.

## High-level architecture

- **Localized App Router shell:** Routes are locale-prefixed (`/[lang]/...`) and enforced by `src/middleware.ts` + `src/i18n/routing.ts` (`en`, `ru`, `uz`, `jp`). The `[lang]/layout.tsx` composes app-wide providers (React Query, NextAuth, WebSocket, theme, next-intl, toasts).
- **Core feature is the flow editor:** `src/features/bot-constructor/constructor.tsx` renders React Flow with custom nodes/edges, keyboard shortcuts, node search, and autosave countdown behavior.
- **Editor state is one sliced Zustand store:** `src/features/bot-constructor/store/index.ts` merges `flowSlice`, `clipboardSlice`, `historySlice`, and `actions`. Most editor behavior (add/update/remove nodes, undo/redo, save/load/format) is centralized in store actions, not in components.
- **Node system is registry-driven:** Node defaults come from `getNodeManifestByType` in store actions, then fallback defaults per node type are applied. New nodes require both export/registration and docs updates (`docs/node_types.md`).
- **API/auth pipeline:** `src/services/instance.ts` defines `instance` and `instanceAuth`; `instanceAuth` injects bearer token from NextAuth session and retries 401s after refresh.

## Key conventions for this repo

- Use `@/` absolute imports inside `src` (no relative traversal imports).
- Access environment values through `src/lib/env.ts` in app code (do not read `process.env` directly in components).
- Do not hardcode UI strings; use `next-intl` translations from `src/messages`.
- Treat `src/components/ui/*` as Shadcn primitives; extend via wrappers instead of editing primitives directly.
- Don’t call Zustand `set()` from components; invoke store actions from `useFlowStore`.
- React Flow node handle convention: incoming handles at top; outgoing at bottom/right; conditional branching nodes use left/right branch handles.

## Sources consolidated

This file is an updated, condensed version of repository guidance from `README.md`, `AGENTS.md`, and `CLAUDE.md`, with stale/non-applicable command details removed.
