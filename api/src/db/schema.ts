import { pgTable, serial, varchar, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const statusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed']);
export const priorityEnum = pgEnum('task_priority', ['low', 'medium', 'high']);

export const tasks = pgTable(
  'tasks',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 100 }).notNull(),
    description: varchar('description', { length: 500 }),
    status: statusEnum('status').notNull().default('pending'),
    priority: priorityEnum('priority').notNull().default('medium'),
    dueDate: timestamp('due_date', { withTimezone: false }),
    createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: false }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index('idx_tasks_status').on(table.status),
    priorityIdx: index('idx_tasks_priority').on(table.priority),
    dueDateIdx: index('idx_tasks_due_date').on(table.dueDate),
    statusCreatedAtIdx: index('idx_tasks_status_created_at').on(table.status, table.createdAt),
    priorityCreatedAtIdx: index('idx_tasks_priority_created_at').on(table.priority, table.createdAt),
  })
);

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;


