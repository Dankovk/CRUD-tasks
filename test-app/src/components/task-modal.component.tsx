"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock as ClockIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export type TaskFormValues = {
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
};

export interface TaskModalProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: TaskFormValues;
  onChange: (values: TaskFormValues) => void;
  dueDate?: string | null;
  onSubmit: (payload: { values: TaskFormValues; dueIso?: string | null }) => void;
}

function combineLocalDateAndTime(date: Date | undefined, time: string | undefined): string | undefined {
  if (!date) return undefined;
  const [hh, mm] = (time && time.length >= 4 ? time : "00:00").split(":");
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(hh ?? 0), Number(mm ?? 0), 0, 0);
  return local.toISOString();
}

export function TaskModal({ mode, open, onOpenChange, values, onChange, dueDate, onSubmit }: TaskModalProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");

  const schema = useMemo(() => z.object({
    title: z.string().min(1, "Title is required").max(100, "Max 100 characters"),
    description: z.string().max(500, "Max 500 characters").optional().or(z.literal("")),
    status: z.enum(["pending", "in_progress", "completed"]),
    priority: z.enum(["low", "medium", "high"]),
    time: z
      .string()
      .regex(/^$|^(?:[01]\d|2[0-3]):[0-5]\d$/, "Invalid time (HH:MM)")
      .optional()
      .or(z.literal("")),
    date: z.date().optional(),
  }).refine((data) => {
    if (!data.date) return true; // date optional
    const [hh, mm] = (data.time && data.time.length >= 4 ? data.time : "00:00").split(":");
    const candidate = new Date(
      data.date.getFullYear(),
      data.date.getMonth(),
      data.date.getDate(),
      Number(hh ?? 0),
      Number(mm ?? 0),
      0, 0,
    );
    return candidate.getTime() >= Date.now() - 60_000; // allow 1m skew
  }, { message: "Due date/time cannot be in the past", path: ["date"] }), []);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { title: values.title, description: values.description, status: values.status, priority: values.priority, date: undefined, time: "" },
  });

  const handleFormSubmit = () => onSubmit({ values, dueIso: date ? combineLocalDateAndTime(date, time) : null });

  useEffect(() => {
    if (open) {
      form.reset({ title: values.title, description: values.description, status: values.status, priority: values.priority, date: undefined, time: "" });
      if (dueDate) {
        const dt = new Date(dueDate);
        setDate(dt);
        form.setValue("date", dt, { shouldValidate: true });
        const hh = String(dt.getHours()).padStart(2, "0");
        const mm = String(dt.getMinutes()).padStart(2, "0");
        form.setValue("time", `${hh}:${mm}`, { shouldValidate: true });
        setTime(`${hh}:${mm}`);
      } else {
        setDate(undefined);
        setTime("");
        form.setValue("date", undefined, { shouldValidate: true });
        form.setValue("time", "", { shouldValidate: true });
      }
    }
  }, [open, dueDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "New Task" : "Edit Task"}</DialogTitle>
            
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input id="task-title" className="w-full" {...form.register("title")} onChange={(e) => { form.register("title").onChange?.(e); onChange({ ...values, title: e.target.value }); }} />
              {form.formState.errors.title && <div className="text-destructive text-xs">{form.formState.errors.title.message as string}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Input id="task-description" className="w-full" {...form.register("description")} onChange={(e) => { form.register("description").onChange?.(e); onChange({ ...values, description: e.target.value }); }} />
              {form.formState.errors.description && <div className="text-destructive text-xs">{form.formState.errors.description.message as string}</div>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={values.status} onValueChange={(v: TaskFormValues["status"]) => { onChange({ ...values, status: v }); form.setValue("status", v, { shouldValidate: true }); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={values.priority} onValueChange={(v: TaskFormValues["priority"]) => { onChange({ ...values, priority: v }); form.setValue("priority", v, { shouldValidate: true }); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due">Due date</Label>
                <div className="flex flex-col gap-2 min-w-0">
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" id="task-due" className="justify-between w-full">
                        {date ? date.toLocaleDateString() : "Select date"}
                        <CalendarIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} captionLayout="dropdown" onSelect={(d) => { setDate(d ?? undefined); form.setValue("date", d, { shouldValidate: true }); setDateOpen(false); }} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due-time">Time</Label>
                <div className="relative">
                  <Input
                    id="task-due-time"
                    type="time"
                    step={60}
                    placeholder="--:--"
                    value={time}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setTime(e.target.value); form.setValue("time", e.target.value, { shouldValidate: true }); }}
                    className="w-full pr-9 appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                  <ClockIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {(form.formState.errors.date || form.formState.errors.time) && (
                  <div className="text-destructive text-xs">
                    {(form.formState.errors.date?.message as string) || (form.formState.errors.time?.message as string)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <StatefulButton type="submit" disabled={!form.formState.isValid} aria-label="Save task">Save</StatefulButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


