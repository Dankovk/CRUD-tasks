import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  title!: string;
  @ApiPropertyOptional({ nullable: true })
  description!: string | null;
  @ApiProperty({ enum: ['pending', 'in_progress', 'completed'] })
  status!: 'pending' | 'in_progress' | 'completed';
  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  priority!: 'low' | 'medium' | 'high';
  @ApiPropertyOptional({ type: String, nullable: true, description: 'ISO string' })
  dueDate!: string | null;
  @ApiProperty({ type: String, description: 'ISO string' })
  createdAt!: string;
  @ApiProperty({ type: String, description: 'ISO string' })
  updatedAt!: string;
}

export class CreateTaskRequestDto {
  @ApiProperty()
  title!: string;
  @ApiPropertyOptional({ maxLength: 500, nullable: true })
  description?: string | null;
  @ApiPropertyOptional({ enum: ['pending', 'in_progress', 'completed'] })
  status?: 'pending' | 'in_progress' | 'completed';
  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
  priority?: 'low' | 'medium' | 'high';
  @ApiPropertyOptional({ type: String, nullable: true, description: 'ISO date string' })
  dueDate?: string | null;
}

export class UpdateTaskRequestDto {
  @ApiPropertyOptional()
  title?: string;
  @ApiPropertyOptional({ maxLength: 500, nullable: true })
  description?: string | null;
  @ApiPropertyOptional({ enum: ['pending', 'in_progress', 'completed'] })
  status?: 'pending' | 'in_progress' | 'completed';
  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
  priority?: 'low' | 'medium' | 'high';
  @ApiPropertyOptional({ type: String, nullable: true, description: 'ISO date string' })
  dueDate?: string | null;
}

export class StatsResponseDto {
  @ApiProperty()
  totalTasks!: number;
  @ApiProperty()
  byStatus!: { pending: number; in_progress: number; completed: number };
  @ApiProperty()
  byPriority!: { low: number; medium: number; high: number };
}


