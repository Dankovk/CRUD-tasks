-- Composite indexes to speed up common filtered + ordered queries
CREATE INDEX IF NOT EXISTS "idx_tasks_status_created_at" ON "tasks" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "idx_tasks_priority_created_at" ON "tasks" ("priority", "created_at");


