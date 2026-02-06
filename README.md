# bolt

An Electron application with React designed as a comprehensive Developer & DevOps Toolkit.

## Project Overview

**Bolt** combines personal productivity tools (Notes, Tasks) with technical utilities (Database tools, GitHub integrations, Shell access) into a unified desktop application. It is designed to be a scalable and modular workspace for developers.

## Technology Stack

- **Core Framework**: Electron (handling the main process and native capabilities).
- **Frontend**: React (v19), Vite (v7), and React Router (v7).
- **UI Context**: Ant Design (v5) for the component library, with Lucide React for icons.
- **Database**: Local SQLite database, managed via `better-sqlite3` and `knex` for migrations and seeds.
- **Build System**: `electron-builder` and `electron-vite`.
- **Terminal**: `xterm.js` for embedding terminal functionality.

## Architecture & Structure

The project follows a scalable Electron architecture with a clear separation of concerns:

- **`src/main` (Backend Logic)**: Handles OS-level business logic, SQLite connections (`database/`), and IPC handlers (`ipc/`).
- **`src/preload` (Bridge)**: Exposes secure APIs to the renderer process via `contextBridge`, mirroring the IPC structure.
- **`src/renderer` (Frontend UI)**:
  - **`pages/`**: UI for each feature.
  - **`repos/`**: Data layer abstracting IPC calls.
  - **`routing.jsx`**: Centralized application routes.
  - **`App.jsx`**: Main layout wrapper.

## Key Features

- **Developer Tools**: API Builder, UI Builder, Embedded Shell, Page Builder.
- **Infrastructure & Data**: Database Management (Backup, Queries), Redis Connection, Log Management (GCP, Local).
- **Productivity**: Notes, Task Manager, Password Manager.
- **Integrations**: GitHub Repository management, osTicket support.
- **System**: Feature Flags, User Profiles, Application Settings.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
