"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type HeaderStats = {
  totalTasks: number;
  byStatus: { pending: number; in_progress: number; completed: number };
  byPriority: { low: number; medium: number; high: number };
};

export interface TopbarProps {
  q: string;
  onQChange: (q: string) => void;
  statusSelected: ("pending" | "in_progress" | "completed")[];
  prioritySelected: ("low" | "medium" | "high")[];
  onToggleStatus: (s: "pending" | "in_progress" | "completed") => void;
  onTogglePriority: (p: "low" | "medium" | "high") => void;
  onCreateClick: () => void;
  stats?: HeaderStats | null;
}

export function Topbar({ q, onQChange, statusSelected, prioritySelected, onToggleStatus, onTogglePriority, onCreateClick, stats }: TopbarProps) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="flex flex-wrap items-center gap-3 py-3">
        <div className="flex items-center gap-2">
          <Input
            id="q"
            placeholder="Search tasks..."
            value={q}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQChange(e.target.value)}
            className="h-9 w-[220px] sm:w-[260px] md:w-[320px]"
          />
          {stats ? (
            <Badge variant="muted">Total {stats.totalTasks ?? 0}</Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Badge asChild variant="muted" className={statusSelected.includes("pending") ? "ring-2 ring-ring" : undefined}>
            <button type="button" aria-pressed={statusSelected.includes("pending")} aria-label="Filter status: pending" onClick={() => onToggleStatus("pending")} className="cursor-pointer">Pending {stats?.byStatus.pending ?? 0}</button>
          </Badge>
          <Badge asChild variant="info" className={statusSelected.includes("in_progress") ? "ring-2 ring-ring" : undefined}>
            <button type="button" aria-pressed={statusSelected.includes("in_progress")} aria-label="Filter status: in progress" onClick={() => onToggleStatus("in_progress")} className="cursor-pointer">In progress {stats?.byStatus.in_progress ?? 0}</button>
          </Badge>
          <Badge asChild variant="outline" className={statusSelected.includes("completed") ? "ring-2 ring-ring" : undefined}>
            <button type="button" aria-pressed={statusSelected.includes("completed")} aria-label="Filter status: completed" onClick={() => onToggleStatus("completed")} className="cursor-pointer">Completed {stats?.byStatus.completed ?? 0}</button>
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge asChild variant="muted" className={prioritySelected.includes("low") ? "ring-2 ring-ring" : undefined}>
            <button type="button" aria-pressed={prioritySelected.includes("low")} aria-label="Filter priority: low" onClick={() => onTogglePriority("low")} className="cursor-pointer">Low {stats?.byPriority.low ?? 0}</button>
          </Badge>
          <Badge asChild variant="secondary" className={prioritySelected.includes("medium") ? "ring-2 ring-ring" : undefined}>
            <button type="button" aria-pressed={prioritySelected.includes("medium")} aria-label="Filter priority: medium" onClick={() => onTogglePriority("medium")} className="cursor-pointer">Medium {stats?.byPriority.medium ?? 0}</button>
          </Badge>
          <Badge asChild variant="destructive" className={prioritySelected.includes("high") ? "ring-2 ring-ring" : undefined}>
            <button type="button" aria-pressed={prioritySelected.includes("high")} aria-label="Filter priority: high" onClick={() => onTogglePriority("high")} className="cursor-pointer">High {stats?.byPriority.high ?? 0}</button>
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={onCreateClick}>Create</Button>
        </div>
      </div>
    </div>
  );
}


