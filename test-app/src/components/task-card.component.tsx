"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Flag, Trash2 } from "lucide-react";

export type TaskCardTask = {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface TaskCardProps {
  task: TaskCardTask;
  onClick?: (task: TaskCardTask) => void;
  onComplete?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
}

function StatusBadge({ status }: { status: TaskCardTask["status"] }) {
  switch (status) {
    case "pending":
      return <Badge variant="muted" className="gap-1"><Clock className="size-3" /> Pending</Badge>;
    case "in_progress":
      return <Badge variant="info" className="gap-1"><Clock className="size-3" /> In progress</Badge>;
    case "completed":
      return <Badge variant="outline" className="gap-1"><CheckCircle2 className="size-3" /> Completed</Badge>;
  }
}

function PriorityBadge({ priority }: { priority: TaskCardTask["priority"] }) {
  switch (priority) {
    case "low":
      return <Badge variant="muted" className="gap-1"><Flag className="size-3" /> Low</Badge>;
    case "medium":
      return <Badge variant="secondary" className="gap-1"><Flag className="size-3" /> Medium</Badge>;
    case "high":
      return <Badge variant="destructive" className="gap-1"><Flag className="size-3" /> High</Badge>;
  }
}

export function TaskCard({ task, onClick, onComplete, onDelete }: TaskCardProps) {
  return (
    <Card className="hover:shadow-md transition cursor-pointer" onClick={() => onClick?.(task)}>
      <CardHeader className="flex items-start justify-between gap-2">
        <CardTitle className="truncate">{task.title}</CardTitle>
        <div className="flex gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground line-clamp-3 min-h-10">
          {task.description || "No description"}
        </div>
        <div className="text-xs text-muted-foreground">
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : "—"}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => { e.stopPropagation(); onComplete?.(task.id); }}
            disabled={task.status === "completed"}
          >
            <CheckCircle2 className="mr-1 size-3" /> Done
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); }}
          >
            <Trash2 className="mr-1 size-3" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


