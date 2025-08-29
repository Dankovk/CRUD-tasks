import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, inArray } from 'drizzle-orm';
import { db } from '../../db/client';
import { tasks, type Task } from '../../db/schema';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

@Injectable()
export class TasksService {
  async list(params: { q?: string; status?: string[]; priority?: string[]; sort?: string }) {
    const { q, status, priority, sort } = params;
    let orderBy: any = desc(tasks.createdAt);
    if (sort) {
      const [column, direction] = sort.split('.');
      const isDesc = direction === 'desc';
      switch (column) {
        case 'due_date':
          orderBy = isDesc ? desc(tasks.dueDate) : asc(tasks.dueDate);
          break;
        case 'priority':
          orderBy = isDesc ? desc(tasks.priority) : asc(tasks.priority);
          break;
        case 'created_at':
        default:
          orderBy = isDesc ? desc(tasks.createdAt) : asc(tasks.createdAt);
          break;
      }
    }

    const where = and(
      status && status.length ? inArray(tasks.status, status as any[]) : undefined,
      priority && priority.length ? inArray(tasks.priority, priority as any[]) : undefined,
      q ? ilike(tasks.title, `%${q}%`) : undefined,
    );

    const data = await db.select().from(tasks).where(where).orderBy(orderBy);
    return data;
  }

  async getById(id: number) {
    const [t] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return t ?? null;
  }

  async create(payload: CreateTaskDto) {
    const [inserted] = await db
      .insert(tasks)
      .values({
        title: payload.title,
        description: payload.description ?? null,
        status: payload.status ?? 'pending',
        priority: payload.priority ?? 'medium',
        dueDate: payload.dueDate ?? null,
      })
      .returning();
    return inserted;
  }

  async update(id: number, patch: UpdateTaskDto) {
    const [updated] = await db
      .update(tasks)
      .set({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.dueDate !== undefined ? { dueDate: patch.dueDate ?? null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();
    return updated ?? null;
  }

  async remove(id: number) {
    const [deleted] = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
    return deleted ?? null;
  }

  async stats() {
    const totalTasksRow = await db.select({ c: count() }).from(tasks);
    const totalTasks = Number(totalTasksRow[0]?.c ?? 0);

    const byStatusGrouped = await db
      .select({ status: tasks.status, c: count() })
      .from(tasks)
      .groupBy(tasks.status);

    const byPriorityGrouped = await db
      .select({ priority: tasks.priority, c: count() })
      .from(tasks)
      .groupBy(tasks.priority);

    const byStatus: Record<'pending' | 'in_progress' | 'completed', number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
    };
    for (const row of byStatusGrouped) {
      const key = row.status as 'pending' | 'in_progress' | 'completed';
      byStatus[key] = Number(row.c) || 0;
    }

    const byPriority: Record<'low' | 'medium' | 'high', number> = { low: 0, medium: 0, high: 0 };
    for (const row of byPriorityGrouped) {
      const key = row.priority as 'low' | 'medium' | 'high';
      byPriority[key] = Number(row.c) || 0;
    }

    return { totalTasks, byStatus, byPriority };
  }
}


