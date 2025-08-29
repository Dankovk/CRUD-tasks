"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Layout } from "@/components/layout.component";
import { Topbar } from "@/components/topbar.component";
import { TaskCard } from "@/components/task-card.component";
import type { TaskCardTask } from "@/components/task-card.component";
import { TaskModal, type TaskFormValues } from "@/components/task-modal.component";
import { toast } from "sonner";
import { useCreateTask, useDeleteTask, useTaskStats, useTasks, useUpdateTask } from "@/lib/queries/tasks";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button as StatefulButton } from "@/components/ui/stateful-button";

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  totalTasks: number;
  byStatus: { pending: number; in_progress: number; completed: number };
  byPriority: { low: number; medium: number; high: number };
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Home() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [priority, setPriority] = useState<string[]>([]);
  const filters = { q, status: status.length ? status : undefined, priority: priority.length ? priority : undefined };
  const { data: serverTasks = [], isLoading: loading, error } = useTasks(filters) as { data: Task[] | undefined; isLoading: boolean; error: any };
  const { data: stats } = useTaskStats();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createValues, setCreateValues] = useState<TaskFormValues>({ title: "", description: "", status: "pending", priority: "medium" });
  const [editValues, setEditValues] = useState<TaskFormValues>({ title: "", description: "", status: "pending", priority: "medium" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const resetCreate = () => setCreateValues({ title: "", description: "", status: "pending", priority: "medium" });

  const createTask = async (payload: { values: TaskFormValues; dueIso?: string | null }) => {
    const { values, dueIso } = payload;
    try {
      const task = await createMutation.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        status: values.status,
        priority: values.priority,
        dueDate: dueIso ?? undefined,
      });
      toast.success("Task created", { description: task.title });
      resetCreate();
      setCreateOpen(false);
    } catch (e: any) {
      toast.error("Failed to create task", { description: e?.message });
    }
  };

  const updateTask = async (id: number, partial: Partial<Task>) => {
    try {
      await updateMutation.mutateAsync({ id, patch: partial as any });
      toast.success("Task updated");
    } catch (e: any) {
      toast.error("Failed to update task", { description: e?.message });
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Task deleted");
    } catch (e: any) {
      toast.error("Failed to delete task", { description: e?.message });
    }
  };

  const deleteEntity = (serverTasks || []).find((t) => t.id === deleteId) ?? null;
  const requestDelete = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (deleteId == null) return;
    await deleteTask(deleteId);
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const openEdit = (task: Task) => {
    setSelectedTask(task);
    setEditOpen(true);
    setEditValues({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
    });
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSelectedTask(null);
  };

  const saveEdit = async (payload: { values: TaskFormValues; dueIso?: string | null }) => {
    if (!selectedTask) return;
    const { values, dueIso } = payload;
    await updateTask(selectedTask.id, {
      title: values.title,
      description: values.description ?? null,
      status: values.status,
      priority: values.priority,
      dueDate: dueIso ?? null,
    } as Partial<Task>);
    closeEdit();
  };

  // Client-side filtering to avoid flicker while user types; serverTasks is the source.
  const tasks = (serverTasks || []).filter((t) => {
    const matchesQ = q ? t.title.toLowerCase().includes(q.toLowerCase()) : true;
    const matchesStatus = status.length ? (status as any).includes(t.status) : true;
    const matchesPriority = priority.length ? (priority as any).includes(t.priority) : true;
    return matchesQ && matchesStatus && matchesPriority;
  });

  return (
    <Layout>
      <Topbar
        q={q}
        onQChange={setQ}
        statusSelected={status as any}
        prioritySelected={priority as any}
        onToggleStatus={(s) => setStatus((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))}
        onTogglePriority={(p) => setPriority((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))}
        onCreateClick={() => setCreateOpen(true)}
        stats={stats}
      />


      
        
          
        
        <div>
          {error ? (
            <div className="text-red-600">{error}</div>
          ) : serverTasks.length === 0 ? (
            <div>No tasks</div>
          ) : tasks.length === 0 ? (
            <div>No matching tasks</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t as TaskCardTask}
                  onClick={() => openEdit(t)}
                  onComplete={(id) => void updateTask(id, { status: "completed" })}
                  onDelete={(id) => requestDelete(id)}
                />
              ))}
            </div>
          )}
        </div>
      
      <TaskModal
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        values={createValues}
        onChange={setCreateValues}
        onSubmit={createTask}
      />
      <TaskModal
        mode="edit"
        open={editOpen}
        onOpenChange={(v) => { if (!v) closeEdit(); else setEditOpen(v); }}
        values={editValues}
        onChange={setEditValues}
        dueDate={selectedTask?.dueDate ?? null}
        onSubmit={saveEdit}
      />
      <Dialog open={deleteOpen} onOpenChange={(v) => { setDeleteOpen(v); if (!v) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {deleteEntity ? (
              <>This will permanently delete "{deleteEntity.title}". This action cannot be undone.</>
            ) : (
              <>This will permanently delete the selected task. This action cannot be undone.</>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border bg-background shadow-xs px-4 py-2 hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50">Cancel</button>
            </DialogClose>
            <button onClick={() => void confirmDelete()} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 bg-destructive text-white shadow-xs hover:bg-destructive/90 px-4 py-2">
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="fixed left-4 bottom-4 z-40 pointer-events-none">
        {loading && (
          <div className="h-10 w-10 rounded-full border-2 border-muted-foreground/40 border-t-primary animate-spin" />
        )}
      </div>
    </Layout>
  );
}
