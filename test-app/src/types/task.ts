export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskDto {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}


