import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';
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
      status && status.length === 1 ? eq(tasks.status, status[0] as any) : undefined,
      priority && priority.length === 1 ? eq(tasks.priority, priority[0] as any) : undefined,
      q ? ilike(tasks.title, `%${q}%`) : undefined,
    );

    const dataRaw = await db.select().from(tasks).where(where).orderBy(orderBy);
    return dataRaw.filter((t: Task) => {
      const statusOk = Array.isArray(status) && status.length ? status.includes(t.status as any) : true;
      const priorityOk = Array.isArray(priority) && priority.length ? priority.includes(t.priority as any) : true;
      return statusOk && priorityOk;
    });
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
    const totalTasks = (await db.select({ c: count() }).from(tasks))[0].c as number;
    const byStatusRows = await Promise.all([
      db.select({ c: count() }).from(tasks).where(eq(tasks.status, 'pending' as any)),
      db.select({ c: count() }).from(tasks).where(eq(tasks.status, 'in_progress' as any)),
      db.select({ c: count() }).from(tasks).where(eq(tasks.status, 'completed' as any)),
    ]);
    const byPriorityRows = await Promise.all([
      db.select({ c: count() }).from(tasks).where(eq(tasks.priority, 'low' as any)),
      db.select({ c: count() }).from(tasks).where(eq(tasks.priority, 'medium' as any)),
      db.select({ c: count() }).from(tasks).where(eq(tasks.priority, 'high' as any)),
    ]);

    return {
      totalTasks,
      byStatus: {
        pending: (byStatusRows[0][0]?.c as number) ?? 0,
        in_progress: (byStatusRows[1][0]?.c as number) ?? 0,
        completed: (byStatusRows[2][0]?.c as number) ?? 0,
      },
      byPriority: {
        low: (byPriorityRows[0][0]?.c as number) ?? 0,
        medium: (byPriorityRows[1][0]?.c as number) ?? 0,
        high: (byPriorityRows[2][0]?.c as number) ?? 0,
      },
    };
  }
}


