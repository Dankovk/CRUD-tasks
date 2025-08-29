Task Management System – Next.js + TanStack Query + Bun

### Overview

Card-based tasks app with full modal editing (Notion-like), frontend validation, multi-select filters, and API validations. Built with:

- Next.js App Router (TypeScript)
- Bun as the package runner
- TanStack Query for data-fetching/caching ([docs](https://tanstack.com/query/latest))
- shadcn/ui components
- Zod + React Hook Form for client-side validation
- Sonner for toasts
 - Motion for micro-interactions

### Key Features

- Card grid UI; click any card to edit all fields in a modal
- Create/edit with RHF + Zod (title required; description length checks; due date/time not in the past)
- Multi-select filters (status and priority) with clickable badges in a compact sticky header
- Client-side search without flicker; server queries stay cached while local filtering updates instantly
- Sonner toasts for success/error of async actions
- Centralized providers in `src/components/providers.component.tsx`

---

## Getting Started

1) (Optional) Configure API base URL in `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```
If not set in development, the app falls back to `http://localhost:4000`.

2) Install dependencies and run dev:
```bash
bun install
bun run dev
```

Open http://localhost:3000

Scripts:
```bash
bun run lint      # biome check
bun run format    # biome format --write
bun run build     # next build (production)
bun run start     # next start (production)
```

---

## How It Works

### Providers

All app-wide providers (Theme, QueryClient, Sonner Toaster, Devtools) live in:
```
src/components/providers.component.tsx
```
and are mounted once from `src/app/layout.tsx`.

### Data layer

API fetchers and React Query hooks:
```
src/lib/api/tasks.ts     # typed fetchers
src/lib/queries/tasks.ts # useTasks / useTaskStats / useCreateTask / useUpdateTask / useDeleteTask
```

- Queries only depend on server-backed filters (status, priority). Free-text search `q` is applied client-side to avoid refetch flicker.
- Query key excludes `q` and uses `placeholderData: prev` to keep the list stable during background updates.

### UI components

```
src/components/task-card.component.tsx   # single task card
src/components/task-modal.component.tsx  # create/edit modal (RHF + Zod)
src/components/topbar.component.tsx      # compact header: search + badges + actions
src/components/layout.component.tsx      # page container
src/components/ui/stateful-button.tsx    # animated action button (optional)
```

### Filtering model

- Multi-select for both groups:
  - Status: pending, in_progress, completed
  - Priority: low, medium, high
- Header badges toggle independently; active badges have a ring.
- Server accepts comma-separated values; client additionally filters locally for a snappy experience.

Examples (against the backend):
```
{API_BASE}/tasks?status=pending,in_progress
{API_BASE}/tasks?priority=medium,high&q=report
```

---

## Backend Endpoints

- Base: `${NEXT_PUBLIC_API_URL}` (dev fallback: `http://localhost:4000`)
- `GET    /tasks` – list tasks (filters: `q`, `status`, `priority`, each can be comma-separated)
- `POST   /tasks` – create task
- `GET    /tasks/:id` – get task by id
- `PUT    /tasks/:id` – update task
- `DELETE /tasks/:id` – delete task
- `GET    /tasks/stats` – totals by status/priority

### Validation

- API-level validations with Zod (title length, description length, enums, due date not in the past)
- Frontend validations with RHF + Zod (real-time error messages under fields)

---

## Development Notes

- This project assumes Bun. Use `bun add`, `bun run` etc.
- The API is a separate NestJS service located at `../api`. Start it on port 4000 or set `NEXT_PUBLIC_API_URL` to point to it.
- Dev server uses Turbopack; production build uses standard `next build` for Bun compatibility.
- UI components are from shadcn/ui with a small design pass for dashboard badges.
- Notifications use Sonner; configured in the global providers.

---

## Troubleshooting

- No tasks appear:
  - Ensure the API is running and reachable at `${NEXT_PUBLIC_API_URL}` (or `http://localhost:4000` in dev by default).
  - Check browser Network tab and API responses.

---

