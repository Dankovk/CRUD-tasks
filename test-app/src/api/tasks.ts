export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskDto {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatsDto {
  totalTasks: number;
  byStatus: { pending: number; in_progress: number; completed: number };
  byPriority: { low: number; medium: number; high: number };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  listTasks: (params: { q?: string; status?: string; priority?: string } = {}) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status) sp.set("status", params.status);
    if (params.priority) sp.set("priority", params.priority);
    const qs = sp.toString();
    return fetchJSON<TaskDto[]>(`${API_BASE}/tasks${qs ? `?${qs}` : ""}`);
  },
  stats: () => fetchJSON<StatsDto>(`${API_BASE}/tasks/stats`),
  create: (payload: { title: string; description?: string; status: TaskStatus; priority: TaskPriority; dueDate?: string | null }) =>
    fetchJSON<TaskDto>(`${API_BASE}/tasks`, { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number, payload: Partial<Omit<TaskDto, "id" | "createdAt" | "updatedAt">>) =>
    fetchJSON<TaskDto>(`${API_BASE}/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number) => fetchJSON<{ success: true }>(`${API_BASE}/tasks/${id}`, { method: "DELETE" }),
};


