# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

---

## Project Overview

**Bot Constructor Panel** is a visual drag-and-drop Telegram bot builder. Users create bot workflows by connecting nodes (triggers, actions, custom logic) on a React Flow canvas. The project ships as a Next.js 15 application with full TypeScript, i18n, and Docker support.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| Components | Shadcn/ui (New York style) + Radix UI |
| Flow canvas | React Flow 11 |
| State | Zustand (sliced store) |
| Data fetching | TanStack React Query |
| Auth | NextAuth.js 4 (Google OAuth + Telegram) |
| HTTP client | Axios (with interceptors) |
| Animations | Framer Motion 12 |
| i18n | next-intl (en, ru, uz, jp) |
| Code editor | CodeMirror 6 |
| Rich text | TipTap 3 / Lexical |
| AI | Google GenAI |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## Development Commands

```bash
npm run dev           # Dev server on port 3001
npm run dev:mono      # Dev with Turbopack in monorepo mode (MONO=1, port 3001)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking
npm run prepare       # Setup Husky git hooks
node scripts/analyze-project.js  # Analyze codebase statistics
```

### Local Run With Dashboard

Run the dashboard and constructor together for authenticated local testing:

```bash
# terminal 1, from ../dashboard
NODE_OPTIONS=--no-experimental-webstorage npm run dev

# terminal 2, from this repo
NODE_OPTIONS=--no-experimental-webstorage DASHBOARD_URL=http://localhost:3010 ADMIN_PANEL=http://localhost:3010 MONO=1 npx next dev --port 3001
```

- Dashboard runs on `http://localhost:3010`.
- Constructor runs on `http://localhost:3001`.
- Do not use bare `npm run dev` for constructor local auth testing: without `MONO=1`, Next uses the `/constructor` base path.
- Do not leave `DASHBOARD_URL` unset locally: middleware falls back to `http://localhost:3000/login`, but the dashboard dev script uses port `3010`.
- If running constructor from a git worktree outside the repo, make sure the worktree has the same `.env` values as the main checkout. A local symlink is fine: `ln -s /path/to/bot-constructor-panel/.env .env`.
- Keep `SESSION_SECRET` and `SESSION_COOKIE_NAME` the same in both apps. Current defaults are `dev-secret-change-me-please-32chars` and `bm_session`.
- On Node 25, use `NODE_OPTIONS=--no-experimental-webstorage`; otherwise SSR can fail with `localStorage.getItem is not a function`.

**Husky pre-push hook** is currently disabled (skips `npm run build` due to network restrictions in CI). Re-enable when Google Fonts network access is resolved.

---

## Environment Variables

Copy `.env.example` to `.env.local` before running locally.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API` | Main API base URL |
| `NEXT_PUBLIC_PLUGIN_API` | Plugin API base URL |
| `CONSTRUCTOR_URL` | Constructor service URL |
| `ADMIN_PANEL` | Admin panel URL |
| `NEXTAUTH_SECRET` | NextAuth JWT secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `MONO` | Set to `1` for monorepo mode (removes `/share` base path) |
| `PORT` | Docker port (default 3000) |
| `DEBUG` | Enable debug logging |

Access env values through `src/lib/env.ts` — do not read `process.env` directly in components.

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [lang]/             # Localized routes (en, ru, uz, jp)
│   │   ├── [id]/           # Constructor page for a specific project
│   │   ├── auth/           # Login/register pages
│   │   └── plugins/        # Plugin management pages
│   └── api/
│       ├── auth/           # NextAuth route handler
│       └── ai/             # AI endpoint
│
├── components/             # Shared, reusable components
│   ├── ui/                 # Shadcn UI primitives (50+ components)
│   ├── common/             # App-wide utilities (providers, themes, notifications)
│   ├── layout/             # Layout pieces (debug console, separators)
│   ├── login-form/         # Auth UI
│   └── icons/              # SVG icon components
│
├── features/               # Feature-based modules
│   ├── bot-constructor/    # MAIN feature — the visual editor
│   │   ├── constructor.tsx # Root component for the editor (~16 KB)
│   │   ├── nodes/          # All React Flow node definitions
│   │   │   ├── triggers/   # 8 trigger node types
│   │   │   ├── actions/    # 26 action node types
│   │   │   └── custom/     # 20 custom/logic node types
│   │   ├── store/          # Zustand store (sliced)
│   │   │   ├── index.ts    # Store assembly
│   │   │   ├── types.ts    # Store type interfaces
│   │   │   ├── flowSlice.ts       # Node/edge CRUD operations
│   │   │   ├── clipboardSlice.ts  # Copy/paste
│   │   │   ├── historySlice.ts    # Undo/redo
│   │   │   └── actions.ts         # High-level save/load/add-node actions
│   │   ├── edges/          # Custom React Flow edge components
│   │   ├── components/     # Feature-specific UI widgets
│   │   ├── hooks/          # Feature-scoped hooks
│   │   ├── data/           # Static configuration (filters, themes, elements)
│   │   ├── utils/          # Editor utility functions
│   │   ├── lib/            # Internal libraries
│   │   └── search/         # Node search functionality
│   │
│   └── collections/        # Collections feature & store
│
├── hooks/                  # Global custom hooks
├── services/               # API layer
│   ├── instance.ts         # Axios instances (public + authed)
│   └── requests/           # One file per domain (auth, bot, ai, plugin, …)
│
├── types/                  # Shared TypeScript interfaces
├── lib/                    # Utility helpers & env config
├── i18n/                   # next-intl routing & request config
├── messages/               # Translation JSON files
├── wss/                    # WebSocket provider
├── assets/                 # Static assets
└── middleware.ts            # i18n routing middleware
```

---

## Architecture Conventions

### Imports
- Always use absolute `@/` path aliases — never relative paths inside `src/`.
- Aliases defined in `tsconfig.json`: `@/*`, `@/components/*`, `@/features/*`, `@/hooks/*`, `@/services/*`, `@/lib/*`, `@/types/*`.

### File / Folder naming
- **React components**: PascalCase file and folder names (`SendTextNode.tsx`)
- **Hooks**: camelCase with `use` prefix (`useFlowStore.ts`)
- **Services / utilities**: camelCase (`errorHandler.ts`)
- **Constants**: `UPPER_SNAKE_CASE`

### Component folder layout
```
ComponentName/
├── ComponentName.tsx   # Component implementation
├── index.ts            # Re-export
├── types.ts            # Local interfaces
└── utils.ts            # Optional local helpers
```

### New node types
All nodes live under `src/features/bot-constructor/nodes/`. Follow existing patterns:
1. Create a `<NodeName>Node.tsx` file in the correct category subfolder (`triggers/`, `actions/`, or `custom/`).
2. Export the component from that subfolder's `index.ts`.
3. Register the node type in the nodeTypes map consumed by `constructor.tsx`.
4. Document the node in `docs/node_types.md`.

---

## State Management (Zustand)

The flow editor state uses a **multi-slice Zustand store** assembled in `src/features/bot-constructor/store/index.ts`.

```
useFlowStore
 ├── flowSlice        – nodes, edges, viewport
 ├── clipboardSlice   – copy/paste buffer
 ├── historySlice     – undo/redo stacks
 └── actions          – save, load, addNode, deleteNode, etc.
```

- Access the store via `useFlowStore()` in components.
- For mutations call actions from the store — do not call `set()` directly from components.
- The `isDirty` flag tracks unsaved changes; it is set automatically by flow mutations.

---

## API / Services Layer

```
services/
├── instance.ts           # Axios instances
│   ├── instance          # Unauthenticated
│   └── instanceAuth      # Bearer token auto-injected; 401 triggers refresh
└── requests/
    ├── auth.ts
    ├── bot.ts
    ├── ai.ts
    ├── agent.ts
    ├── file.ts
    ├── plugin.ts
    └── enviroment.ts
```

- Wrap calls in React Query hooks (in `services/react-query/`).
- Use `instanceAuth` for all authenticated endpoints.
- Base URLs come from `src/lib/env.ts`, not raw `process.env`.

---

## Authentication

- NextAuth.js with Google OAuth and Telegram providers.
- Session object contains `access` and `refresh` JWT tokens.
- `instanceAuth` automatically injects the bearer token and handles 401 refresh.
- All routes except `/api/*` are protected by `src/middleware.ts`.

---

## Internationalization

- Four locales: `en` (default), `ru`, `uz`, `jp`.
- Locale prefix is the first segment of every URL: `/<lang>/…`.
- Translation strings live in `src/messages/`.
- Use `useTranslations()` from `next-intl` — never hardcode UI strings.

---

## Node System Quick Reference

| Category | Count | Examples |
|---|---|---|
| Triggers | 8 | CommandTrigger, MessageTrigger, CallbackQueryTrigger, CronTrigger |
| Actions | 26 | SendText, SendPhoto, SendVideo, EditMessage, DeleteMessage, HttpRequest |
| Custom/Logic | 20 | IfNode, CodeNode, ForLoop, FormNode, SubflowNode, StateNode |

**Handle conventions:**
- **Target handles** (incoming) are positioned at the top of a node.
- **Source handles** (outgoing) are positioned at the bottom or right.
- Conditional nodes (IfNode etc.) use left/right source handles for true/false branches.

---

## Styling

- **Tailwind CSS 4** with utility classes — no custom CSS files unless absolutely necessary.
- **CSS variables** power the theme system; never hard-code color hex values.
- **Shadcn/ui** components are in `src/components/ui/` and should not be modified directly; extend via wrappers.
- Dark/light mode is managed by `next-themes`.

---

## Error Handling

- Centralised utilities in `src/lib/error-handler.ts`.
- API errors are caught by Axios interceptors in `services/instance.ts`.
- User-facing errors use `react-hot-toast` notifications.
- Do not `console.error` raw API responses in production code.

---

## Deployment

### CI/CD (Avtomatik deploy)

`main` branchga push qilsang, GitHub Actions ishga tushadi:

1. Docker image build bo'lib `registry.jscorp.uz/botmother-constructor:<commit-sha>` ga push bo'ladi
2. `helm/values.yaml` dagi `image.tag` avtomatik yangilanadi (commit SHA bilan)
3. ArgoCD o'zgarishni ko'rib (~3 min) klasterga deploy qiladi

**Tag yaratish shart emas** — `git push origin main` yetarli.

- Workflow: `.github/workflows/deploy.yaml`
- Helm values: `helm/values.yaml`
- ArgoCD Application: `k8s` reposida `helm/argocd/apps/constructor.yaml`
- `helm/` papkasidagi o'zgarishlar workflow ni qayta trigger qilmaydi (`paths-ignore`)
- Secretlar klasterdagi Kubernetes Secret larda saqlanadi, gitda emas

### Docker (lokal)
```bash
docker build -t bot-constructor-panel .
docker run -p 3000:3000 --env-file .env bot-constructor-panel
```

---

## Testing

There is currently **no test suite** in this repository. When adding tests:
- Place unit tests co-located with the module: `ComponentName.test.tsx`
- Use Jest + React Testing Library (not yet configured — add as needed)
- Prefer integration tests for store slices and service calls

---

## Documentation

| File | Contents |
|---|---|
| `docs/ARCHITECTURE.md` | Feature-based architecture overview |
| `docs/node_types.md` | Full node type reference (30 KB) |
| `docs/flow_formatter_guideline.md` | Flow formatting rules |
| `docs/TRIGGER_STATE_SAVING.md` | Trigger state-saving patterns |
| `docs/project_analysis.md` | Detailed codebase analysis |
| `docs/botspace.yaml` | Bot specification (181 KB) |

---

## Key Things to Avoid

- Do **not** read `process.env` directly in components — use `src/lib/env.ts`.
- Do **not** use relative imports inside `src/` — use `@/` aliases.
- Do **not** hardcode UI strings — use `next-intl` translations.
- Do **not** modify Shadcn UI primitive components in `src/components/ui/` — wrap them instead.
- Do **not** call Zustand `set()` directly from components — use store actions.
- Do **not** add new dependencies without checking if an existing library covers the need.
