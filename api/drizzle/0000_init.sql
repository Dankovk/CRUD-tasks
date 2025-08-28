-- Drizzle initial migration: tasks schema
CREATE TYPE "task_status" AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE "task_priority" AS ENUM ('low', 'medium', 'high');

CREATE TABLE IF NOT EXISTS "tasks" (
  "id" serial PRIMARY KEY,
  "title" varchar(100) NOT NULL,
  "description" varchar(500),
  "status" task_status NOT NULL DEFAULT 'pending',
  "priority" task_priority NOT NULL DEFAULT 'medium',
  "due_date" timestamp NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_tasks_status" ON "tasks" ("status");
CREATE INDEX IF NOT EXISTS "idx_tasks_priority" ON "tasks" ("priority");
CREATE INDEX IF NOT EXISTS "idx_tasks_due_date" ON "tasks" ("due_date");

-- optional: update updated_at automatically
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at ON tasks;
CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


