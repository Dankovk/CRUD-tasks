import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateTaskRequestDto, TaskResponseDto, UpdateTaskRequestDto, StatsResponseDto } from './dto';
import { z } from 'zod';
import { TasksService } from './tasks.service';

const dueDateSchema = z
  .preprocess((val) => {
    if (val === null || val === undefined || val === '') return null;
    const d = new Date(String(val));
    return d;
  }, z.date().nullable())
  .refine((d) => d === null || !Number.isNaN(d.getTime()), { message: 'Invalid due date' })
  .refine((d) => d === null || d.getTime() >= Date.now() - 60_000, { message: 'Due date/time cannot be in the past' });

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Max 100 characters'),
  description: z.string().trim().max(500, 'Max 500 characters').optional().nullable().transform((v) => (v === '' ? null : v)),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: dueDateSchema.optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional().nullable().transform((v) => (v === '' ? null : v)),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: dueDateSchema.optional(),
});

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks' })
  @ApiQuery({ name: 'status', required: false, description: 'Comma-separated list of statuses' })
  @ApiQuery({ name: 'priority', required: false, description: 'Comma-separated list of priorities' })
  @ApiQuery({ name: 'q', required: false, description: 'Search in title' })
  @ApiQuery({ name: 'sort', required: false, example: 'created_at.desc' })
  @ApiOkResponse({ type: TaskResponseDto, isArray: true })
  @ApiBadRequestResponse({ description: 'Invalid query' })
  async list(@Query('status') statusParam?: string, @Query('priority') priorityParam?: string, @Query('q') q?: string, @Query('sort') sort?: string) {
    const allowedStatus = new Set(['pending', 'in_progress', 'completed']);
    const allowedPriority = new Set(['low', 'medium', 'high']);

    const status = statusParam && statusParam.length > 0 ? statusParam.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
    const priority = priorityParam && priorityParam.length > 0 ? priorityParam.split(',').map((s) => s.trim()).filter(Boolean) : undefined;

    if (status && status.some((s) => !allowedStatus.has(s))) {
      throw new HttpException({ error: `Invalid status value. Allowed: ${[...allowedStatus].join(', ')}` } as any, 400);
    }
    if (priority && priority.some((p) => !allowedPriority.has(p))) {
      throw new HttpException({ error: `Invalid priority value. Allowed: ${[...allowedPriority].join(', ')}` } as any, 400);
    }
    if (q && q.length > 100) {
      throw new HttpException({ error: "Query 'q' too long (max 100)." } as any, 400);
    }

    const data = await this.tasks.list({ q: q ?? undefined, status, priority, sort: sort ?? 'created_at.desc' });
    return data.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? null,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by id' })
  @ApiOkResponse({ type: TaskResponseDto })
  async get(@Param('id') idParam: string) {
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      throw new HttpException({ error: 'Invalid id' } as any, 400);
    }
    const t = await this.tasks.getById(id);
    if (!t) {
      throw new HttpException({ error: 'Not found' } as any, 404);
    }
    return {
      id: t.id,
      title: t.title,
      description: t.description ?? null,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create task' })
  @ApiCreatedResponse({ type: TaskResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async create(@Body() body: CreateTaskRequestDto) {
    try {
      const parsed = createTaskSchema.parse(body);
      const inserted = await this.tasks.create(parsed);
      return {
        id: inserted.id,
        title: inserted.title,
        description: inserted.description ?? null,
        status: inserted.status,
        priority: inserted.priority,
        dueDate: inserted.dueDate ? inserted.dueDate.toISOString() : null,
        createdAt: inserted.createdAt.toISOString(),
        updatedAt: inserted.updatedAt.toISOString(),
      };
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        throw new HttpException({ error: err.flatten() } as any, 400);
      }
      throw new HttpException({ error: 'Internal Server Error' } as any, 500);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiOkResponse({ type: TaskResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async update(@Param('id') idParam: string, @Body() body: UpdateTaskRequestDto) {
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      throw new HttpException({ error: 'Invalid id' } as any, 400);
    }
    try {
      const parsed = updateTaskSchema.parse(body);
      const updated = await this.tasks.update(id, parsed);
      if (!updated) {
        throw new HttpException({ error: 'Not found' } as any, 404);
      }
      return {
        id: updated.id,
        title: updated.title,
        description: updated.description ?? null,
        status: updated.status,
        priority: updated.priority,
        dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        throw new HttpException({ error: err.flatten() } as any, 400);
      }
      throw new HttpException({ error: 'Internal Server Error' } as any, 500);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiOkResponse({ schema: { properties: { success: { type: 'boolean' } } } })
  async remove(@Param('id') idParam: string) {
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      throw new HttpException({ error: 'Invalid id' } as any, 400);
    }
    const deleted = await this.tasks.remove(id);
    if (!deleted) {
      throw new HttpException({ error: 'Not found' } as any, 404);
    }
    return { success: true };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Tasks statistics' })
  @ApiOkResponse({ type: StatsResponseDto })
  async stats() {
    return this.tasks.stats();
  }
}


