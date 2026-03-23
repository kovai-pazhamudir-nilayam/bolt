# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development (Electron + Vite HMR)
npm run lint         # ESLint
npm run format       # Prettier
npm run build:mac    # Build for macOS (also :win, :linux)

# Database migrations
npm run migrate              # Run pending migrations
npm run migrate:make -- <name>  # Create new migration file
npm run migrate:down         # Rollback last migration
```

No test suite is configured.

## Architecture

**Bolt** is an Electron + React desktop app. Communication between renderer and OS follows a strict three-layer IPC pattern:

```
Renderer (React) → repo → window.<featureAPI> → ipcRenderer → ipcMain handler → ConfigDatabase (SQLite)
```

### Layer locations

| Layer          | Path                                           | Purpose                                                |
| -------------- | ---------------------------------------------- | ------------------------------------------------------ |
| Main process   | `src/main/index.js`                            | App entry, registers all IPC handlers                  |
| IPC handlers   | `src/main/ipc/<feature>.ipc.js`                | Business logic, DB queries via `configDb.knex`         |
| Preload bridge | `src/preload/<feature>.preload.js`             | Exposes `ipcRenderer.invoke` calls via `contextBridge` |
| Preload index  | `src/preload/index.js`                         | Mounts all APIs on `window.*`                          |
| Repos          | `src/renderer/src/repos/<Feature>Page.repo.js` | Renderer data layer calling `window.<featureAPI>`      |
| Pages          | `src/renderer/src/pages/<FeaturePage>/`        | React UI                                               |
| Routing        | `src/renderer/src/routing.jsx`                 | `ROUTES` array; `hideInMenu: true` hides from sidebar  |

### Adding a new feature

Every new feature requires all five pieces wired together:

1. Migration in `src/main/database/migrations/`
2. IPC handler registered in `src/main/index.js`
3. Preload file exposed in `src/preload/index.js`
4. Repo in `src/renderer/src/repos/`
5. Page in `src/renderer/src/pages/` + entry in `src/renderer/src/routing.jsx`

### Database

- Single SQLite file at Electron's `userData` path (`config.db`)
- `ConfigDatabase` (`src/main/database/ConfigDatabase.js`) is the singleton — access via `configDb.knex`
- All IPC handlers receive `(ipcMain, configDb)` and use `configDb.knex('<table>')` directly

### Key data model

**`db_secrets`** — one row per `(company_code, environment, db_name)`. Stores host/user/password per env.

**`saved_db_query`** — stores `title`, `description`, `query`, `company_code`, and `db_name`. References a DB by name (no environment); environment is chosen at _run time_, not save time.

**Execution flow** (SavedDBQueryResultModal): select company + env → fetch GCP config → `gcloud container clusters get-credentials` → `kubectl get pods` to find jumpbox → `kubectl exec <pod> -- psql ...` via the embedded shell.

## Coding Standards

- **JavaScript only** — no TypeScript
- **No try-catch** — let errors propagate naturally
- **No Tailwind CSS** — use Ant Design (v5) components and inline styles
- Use **Lucide React** for all icons
- Wrap page components with `withNotification` HOC for `renderSuccessNotification` / `renderErrorNotification`
- Use `EntityTable` component (`src/renderer/src/components/EntityTable.jsx`) for standard CRUD tables
- Repos support two modes (`mode === 'api'` vs local Electron); default is local via `window.runtimeConfig?.mode`
- Support for dark theme
