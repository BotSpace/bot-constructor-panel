# Copilot Instructions — Bot Constructor Panel

This is a visual drag-and-drop Telegram bot builder built with Next.js 15, React 19, and TypeScript. Users create bot workflows by connecting nodes (triggers, actions, custom logic) on a React Flow canvas.

---

## Build, Test, and Lint

```bash
# Development
npm run dev           # Dev server on port 3001
npm run dev:mono      # Monorepo mode with Turbopack (MONO=1, port 3001)

# Production
npm run build         # Production build
npm run start         # Start production server

# Code quality
npm run lint          # Run ESLint (extends next)

# Analysis
node scripts/analyze-project.js  # Codebase statistics
```

**No test suite currently exists.** When adding tests, co-locate them with modules (e.g., `ComponentName.test.tsx`) and use Jest + React Testing Library.

---

## Environment Setup

Copy `.env.example` to `.env.local` before running locally. Required variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API` | Main API base URL |
| `NEXT_PUBLIC_PLUGIN_API` | Plugin API base URL |
| `NEXTAUTH_SECRET` | NextAuth JWT secret |
| `GOOGLE_CLIENT_ID` | Google OAuth credentials |
| `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `MONO` | Set to `1` for monorepo mode (removes `/share` base path) |

**Critical:** Always access environment variables through `src/lib/env.ts` — never read `process.env` directly in components.

---

## Architecture

### Feature-Based Structure

The codebase follows a **feature-based architecture**. Each major feature lives in its own module with dedicated components, hooks, services, and state.

```
src/
├── features/
│   ├── bot-constructor/    # Main feature: visual flow editor
│   │   ├── constructor.tsx # Root component (~16 KB)
│   │   ├── nodes/          # 54 node types (triggers, actions, custom)
│   │   ├── store/          # Zustand store (multi-slice)
│   │   ├── edges/          # Custom React Flow edges
│   │   ├── components/     # Feature-specific UI
│   │   └── hooks/          # Feature-scoped hooks
│   └── collections/        # Collections feature
├── components/
│   ├── ui/                 # 50+ Shadcn/ui primitives (DO NOT modify)
│   └── common/             # App-wide reusable components
└── services/
    ├── instance.ts         # Axios instances (public + authed)
    └── requests/           # API functions by domain
```

### The Flow Editor (bot-constructor)

The visual editor is the core of this application:

- **54 node types** across 3 categories:
  - **Triggers** (8): CommandTrigger, MessageTrigger, CallbackQueryTrigger, CronTrigger, etc.
  - **Actions** (26): SendText, SendPhoto, SendVideo, EditMessage, HttpRequest, etc.
  - **Custom/Logic** (20): IfNode, CodeNode, ForLoop, FormNode, SubflowNode, StateNode, etc.

- **Store architecture** (Zustand multi-slice):
  ```
  useFlowStore
   ├── flowSlice        # Node/edge CRUD operations
   ├── clipboardSlice   # Copy/paste buffer
   ├── historySlice     # Undo/redo stacks
   └── actions.ts       # High-level operations (save/load/addNode)
  ```

- **Adding new nodes:**
  1. Create `<NodeName>Node.tsx` in `src/features/bot-constructor/nodes/{triggers|actions|custom}/`
  2. Export from that subfolder's `index.ts`
  3. Register in the nodeTypes map in `constructor.tsx`
  4. Document in `docs/node_types.md`

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15 |
| UI Library | React | 19 |
| Language | TypeScript (strict) | 5 |
| Styling | Tailwind CSS | 4 |
| Components | Shadcn/ui (New York) + Radix UI | — |
| Flow Canvas | React Flow | 11 |
| State | Zustand (sliced store) | — |
| Data Fetching | TanStack React Query | 5 |
| Auth | NextAuth.js | 4 |
| i18n | next-intl | 4 |
| Code Editor | CodeMirror | 6 |
| Rich Text | TipTap 3 / Lexical | — |

---

## Code Conventions

### Imports

**Always use absolute path aliases** — never relative imports inside `src/`.

```typescript
// ✅ Correct
import { Button } from '@/components/ui/button';
import { useFlowStore } from '@/features/bot-constructor/store';

// ❌ Never
import { Button } from '../../../components/ui/button';
```

Path aliases (defined in `tsconfig.json`):
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/features/*` → `./src/features/*`
- `@/hooks/*`, `@/services/*`, `@/lib/*`, `@/types/*`

### Naming Conventions

- **React components:** PascalCase files and folders (`SendTextNode.tsx`)
- **Hooks:** camelCase with `use` prefix (`useFlowStore.ts`)
- **Services/utilities:** camelCase (`errorHandler.ts`)
- **Constants:** `UPPER_SNAKE_CASE`

### Component Folder Layout

```
ComponentName/
├── ComponentName.tsx   # Implementation
├── index.ts            # Re-export
├── types.ts            # Local interfaces
└── utils.ts            # Optional helpers
```

---

## State Management

### Zustand Store Pattern

The flow editor uses a **multi-slice Zustand store** assembled in `src/features/bot-constructor/store/index.ts`.

```typescript
// Access the store
const { nodes, edges, addNode, deleteNode } = useFlowStore();

// ✅ Call store actions
addNode(newNode);

// ❌ Never call set() directly from components
// Instead, define actions in the store slices
```

**Key patterns:**
- `flowSlice.ts` — nodes, edges, viewport state
- `clipboardSlice.ts` — copy/paste buffer
- `historySlice.ts` — undo/redo stacks
- `actions.ts` — high-level operations (save, load, addNode, deleteNode)
- `isDirty` flag tracks unsaved changes (set automatically by mutations)

---

## API & Services

### Axios Instances

```typescript
// src/services/instance.ts
instance          // Unauthenticated requests
instanceAuth      // Auto-injects bearer token, handles 401 refresh
```

**Always use `instanceAuth` for authenticated endpoints.**

### Service Organization

```
services/
├── instance.ts
└── requests/
    ├── auth.ts         # Authentication
    ├── bot.ts          # Bot operations
    ├── ai.ts           # AI features
    ├── agent.ts        # Agent management
    ├── file.ts         # File uploads
    └── plugin.ts       # Plugin system
```

- Base URLs come from `src/lib/env.ts`, not raw `process.env`
- Wrap API calls in React Query hooks (in `services/react-query/`)
- API errors are caught by Axios interceptors in `services/instance.ts`

---

## Authentication

- **NextAuth.js** with Google OAuth and Telegram providers
- Session object contains `access` and `refresh` JWT tokens
- `instanceAuth` auto-injects bearer token and handles 401 refresh
- All routes except `/api/*` are protected by `src/middleware.ts`

---

## Internationalization

- **Four locales:** `en` (default), `ru`, `uz`, `jp`
- Locale prefix is the first URL segment: `/<lang>/...`
- Translation strings in `src/messages/`
- **Never hardcode UI strings** — always use `useTranslations()` from `next-intl`

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('ComponentName');
  return <button>{t('submit')}</button>;
}
```

---

## Styling Guidelines

- **Tailwind CSS 4** with utility classes — no custom CSS files unless absolutely necessary
- **CSS variables** power the theme system — never hard-code color hex values
- **Shadcn/ui** components in `src/components/ui/` **must not be modified directly** — extend via wrappers
- Dark/light mode managed by `next-themes`

---

## React Flow Nodes

### Handle Conventions

- **Target handles** (incoming): positioned at the **top** of a node
- **Source handles** (outgoing): positioned at the **bottom** or **right**
- **Conditional nodes** (IfNode, etc.): use left/right source handles for true/false branches

### Node Registration

All nodes live under `src/features/bot-constructor/nodes/`. Follow existing patterns:
1. Create `<NodeName>Node.tsx` in the correct subfolder (`triggers/`, `actions/`, or `custom/`)
2. Export from that subfolder's `index.ts`
3. Register the node type in the nodeTypes map consumed by `constructor.tsx`
4. Document in `docs/node_types.md`

---

## Error Handling

- Centralized utilities in `src/lib/error-handler.ts`
- API errors caught by Axios interceptors in `services/instance.ts`
- User-facing errors use `react-hot-toast` notifications
- **Never** `console.error` raw API responses in production code

---

## Deployment

### Docker

```bash
docker build -t bot-constructor-panel .
docker run -p 3000:3000 --env-file .env bot-constructor-panel
```

Multi-stage build with Node 22 Alpine. See `stack.yaml` for Docker Compose setup.

### Docker Compose

- Service joins the external `botmother` overlay network
- Port configurable via `$PORT` env var (default 3000)
- Rolling update strategy; auto-restart on failure

---

## Documentation

| File | Contents |
|---|---|
| `CLAUDE.md` | Comprehensive AI assistant guidance (this is the source of truth) |
| `docs/ARCHITECTURE.md` | Feature-based architecture overview |
| `docs/node_types.md` | Full node type reference (30 KB, 54 nodes) |
| `docs/flow_formatter_guideline.md` | Flow formatting rules |
| `docs/TRIGGER_STATE_SAVING.md` | Trigger state-saving patterns |
| `docs/project_analysis.md` | Detailed codebase analysis |

---

## Critical Don'ts

- ❌ **Never** read `process.env` directly in components — use `src/lib/env.ts`
- ❌ **Never** use relative imports inside `src/` — use `@/` aliases
- ❌ **Never** hardcode UI strings — use `next-intl` translations
- ❌ **Never** modify Shadcn UI components in `src/components/ui/` — wrap them instead
- ❌ **Never** call Zustand `set()` directly from components — use store actions
- ❌ **Never** add new dependencies without checking if an existing library covers the need

---

## Husky Hooks

Pre-push hook in `.husky/pre-push` is currently disabled (skips `npm run build` due to network restrictions in CI). Re-enable when Google Fonts network access is resolved.

---

*For more detailed guidance, refer to `CLAUDE.md` in the repository root.*
