Task Management System – Next.js + Drizzle + Postgres

### Overview

Card-based tasks app with full modal editing (Notion-like), frontend validation, multi-select filters, and API validations. Built with:

- Next.js App Router (TypeScript)
- Bun as the package runner
- Drizzle ORM + Postgres
- TanStack Query for data-fetching/caching ([docs](https://tanstack.com/query/latest))
- shadcn/ui components
- Zod + React Hook Form for client-side validation
- Sonner for toasts

### Key Features

- Card grid UI; click any card to edit all fields in a modal
- Create/edit with RHF + Zod (title required; description length checks; due date/time not in the past)
- Multi-select filters (status and priority) with clickable badges in a compact sticky header
- Client-side search without flicker; server queries stay cached while local filtering updates instantly
- Sonner toasts for success/error of async actions
- Centralized providers in `src/components/providers.component.tsx`

---

## Getting Started

1) Copy env and set `DATABASE_URL`:
```bash
cp .env.example .env
# e.g. postgres://postgres:postgres@localhost:5432/tasks
```

2) Start Postgres (optional via Docker):
```bash
docker compose up -d
```

3) Generate and apply migrations (Drizzle):
```bash
bun run db:generate
bun run db:migrate
```

4) Run the dev server:
```bash
bun run dev
```

Open http://localhost:3000

Scripts:
```bash
bun run lint      # biome check
bun run format    # biome format --write
bun run db:studio # drizzle-kit studio
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
src/api/tasks.ts     # typed fetchers
src/queries/tasks.ts # useTasks / useTaskStats / useCreateTask / useUpdateTask / useDeleteTask
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

Examples:
```
/api/tasks?status=pending,in_progress
/api/tasks?priority=medium,high&q=report
```

---

## API Endpoints

- `GET    /api/tasks` – list tasks (filters: `q`, `status`, `priority`, each can be comma-separated)
- `POST   /api/tasks` – create task
- `GET    /api/tasks/:id` – get task by id
- `PUT    /api/tasks/:id` – update task
- `DELETE /api/tasks/:id` – delete task
- `GET    /api/tasks/stats` – totals by status/priority

### Validation

- API-level validations with Zod (title length, description length, enums, due date not in the past)
- Frontend validations with RHF + Zod (real-time error messages under fields)

---

## Development Notes

- This project assumes Bun. Use `bun add`, `bun run` etc.
- Drizzle migrations are generated from `src/server/db/schema.ts` and stored under `drizzle/`.
- UI components are from shadcn/ui with a small design pass for dashboard badges.
- Notifications use Sonner; configured in the global providers.

---

## Troubleshooting

- No tasks appear:
  - Make sure Postgres is running and `DATABASE_URL` is correct.
  - Run `bun run db:migrate` after changing the schema.
  - Check Network tab and API responses.

- Filters feel slow:
  - Client-side `q` filtering is instant; status/priority changes refetch, but list stays visible thanks to placeholder data.

---

