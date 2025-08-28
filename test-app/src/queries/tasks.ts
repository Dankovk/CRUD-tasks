import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type TaskDto, type TaskPriority, type TaskStatus, type StatsDto } from "@/api/tasks";

const keys = {
  // only status/priority affect server query; q is filtered on the client to avoid refetch flicker
  tasks: (filters: { status?: string[]; priority?: string[] }) => ["tasks", { status: filters.status, priority: filters.priority }] as const,
  stats: ["tasks", "stats"] as const,
};

export function useTasks(filters: { q?: string; status?: string[]; priority?: string[] }) {
  return useQuery({
    queryKey: keys.tasks({ status: filters.status, priority: filters.priority }),
    queryFn: () => api.listTasks({
      status: (filters.status && filters.status.length ? filters.status.join(",") : undefined) as any,
      priority: (filters.priority && filters.priority.length ? filters.priority.join(",") : undefined) as any,
    }),
    staleTime: 30_000,
    placeholderData: (prev) => prev, // keep previous to avoid list flicker
  });
}

export function useTaskStats() {
  return useQuery<StatsDto>({ queryKey: keys.stats, queryFn: api.stats, staleTime: 30_000 });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; description?: string; status: TaskStatus; priority: TaskPriority; dueDate?: string | null }) =>
      api.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Omit<TaskDto, "id" | "createdAt" | "updatedAt">> }) => api.update(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}


