<div align="center">
  <img src="public/byakko.png" alt="Byakko" width="220" />

  <h1>Byakko Admin Panel</h1>

  <p>
    Admin SPA for the <a href="../byakko-backend">Byakko</a> authentication &amp; permissions system.<br/>
    Full CRUD management for clients, users, categories, permissions, and relation conditions.
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/Zustand-5-433E38?style=flat-square" />
  </p>
</div>

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + React Router 7 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Server state | TanStack Query 5 |
| Forms | React Hook Form 7 + Zod 4 |
| HTTP | Axios (with silent token renewal) |
| i18n | i18next + react-i18next (ES / EN) |
| Build | Vite 8 |

## Features

- 🏢 **Clients** — Create, list, edit, and delete tenants with per-client JWT signing
- 👤 **Users** — CRUD, permission assignment, activity history, per-client scope
- 🗂️ **Categories** — Hierarchical permission categories with client scoping
- 🔐 **Permissions** — Permission actions linked to clients and categories
- 🔗 **Relation Conditions** — Condition keys that extend permission checks with context
- 📊 **Dashboard** — Overview metrics
- 🔑 **Auth** — JWT login with silent refresh token renewal — no hard logout on 401
- 🌍 **i18n** — Spanish / English with browser language auto-detection

## Project Structure

```
src/
├── components/       # Feature components (one component per file, one folder per component)
│   ├── categories/
│   ├── clients/
│   ├── common/
│   ├── dashboard/
│   ├── layout/
│   ├── permissions/
│   ├── relation-conditions/
│   ├── ui/           # Base UI primitives (Button, Select, Dialog, etc.)
│   └── users/
├── hooks/            # Shared custom hooks
├── i18n/             # Translation files (es.json, en.json)
├── lib/              # Axios instance, query client
├── pages/            # Thin route entry points
├── router/           # React Router config
├── schemas/          # Zod validation schemas
├── services/         # API service layer
├── stores/           # Zustand stores
├── styles/           # Global styles
└── types/            # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20+
- [byakko-backend](../byakko-backend) running locally on port `8080`

### Setup

```bash
# Install dependencies
npm install

# Copy env and set the API URL
cp .env.example .env
```

`.env`:
```env
VITE_API_URL=http://localhost:8080/v1/admin
```

### Commands

```bash
npm run dev       # Development server with HMR
npm run build     # Type-check + production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

## Architecture Notes

- **One component per file** — every component lives in its own `component-name/index.tsx` folder
- **Hooks in `hooks/`** — shared hooks are extracted from components, never inlined
- **Pages are thin** — pages compose components and call hooks; no business logic inline
- **Silent token renewal** — the Axios interceptor queues all 401 requests, refreshes the token once, then retries the queue
- **Per-client JWT** — each client has its own HMAC secret; tokens are signed per-tenant on the backend
- **i18n auto-detect** — language is read from `navigator.language` at startup, defaulting to ES
