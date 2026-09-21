import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Receipt, Trash2, Loader2, Bell, Mail, BellRing, Calendar, Repeat, StickyNote } from "lucide-react";

const RECURRING_OPTIONS = [
  { value: "none", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const METHOD_OPTIONS = [
  { value: "push", label: "In-app", icon: BellRing },
  { value: "email", label: "Email", icon: Mail },
  { value: "both", label: "Both", icon: Bell },
];

export default function BillReminderModal({ open, editing, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    due_date: "",
    recurring: "none",
    notes: "",
    reminder_enabled: true,
    reminder_method: "email",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          name: editing.name || "",
          amount: editing.amount != null ? String(editing.amount) : "",
          due_date: editing.due_date || "",
          recurring: editing.recurring || "none",
          notes: editing.notes || "",
          reminder_enabled: editing.reminder_enabled !== false,
          reminder_method: editing.reminder_method || "email",
        });
      } else {
        const today = new Date().toISOString().split("T")[0];
        setForm({
          name: "",
          amount: "",
          due_date: today,
          recurring: "none",
          notes: "",
          reminder_enabled: true,
          reminder_method: "email",
        });
      }
    }
  }, [open, editing]);

  const canSave = form.name.trim() && Number(form.amount) >= 0 && form.due_date;

  const handleSubmit = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        amount: Number(form.amount),
        due_date: form.due_date,
        recurring: form.recurring,
        notes: form.notes.trim(),
        reminder_enabled: form.reminder_enabled,
        reminder_method: form.reminder_method,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-3xl border-2 border-border p-0">
        <div className="bg-gradient-to-br from-primary to-accent text-white p-5 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Receipt className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-xl font-black">
              {editing ? "Edit Bill" : "Add Bill Reminder"}
            </DialogTitle>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-black">Bill Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Phone Bill, Rent, Car Payment"
              className="h-11 rounded-xl border-2 font-semibold"
            />
          </div>

          {/* Amount + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-black">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="h-11 rounded-xl border-2 font-semibold pl-7"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-black">Due Date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="h-11 rounded-xl border-2 font-semibold"
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="space-y-1.5">
            <Label className="text-sm font-black flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5" strokeWidth={2.5} /> Recurring Schedule
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {RECURRING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, recurring: opt.value })}
                  className={`h-10 rounded-xl border-2 text-xs font-bold transition-all ${
                    form.recurring === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm font-black flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" strokeWidth={2.5} /> Notes (optional)
            </Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any extra details about this bill…"
              className="rounded-xl border-2 font-semibold min-h-[60px] resize-none"
            />
          </div>

          {/* Reminder enabled + method */}
          <div className="rounded-2xl border-2 border-border p-4 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-sm flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-primary" strokeWidth={2.5} /> Reminder
                </p>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  Budgie reminds you 1 day before the due date
                </p>
              </div>
              <Switch
                checked={form.reminder_enabled}
                onCheckedChange={(v) => setForm({ ...form, reminder_enabled: v })}
              />
            </div>

            {form.reminder_enabled && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Reminder Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {METHOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm({ ...form, reminder_method: opt.value })}
                      className={`h-10 rounded-xl border-2 text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        form.reminder_method === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <opt.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {editing && (
              <Button
                onClick={() => onDelete?.(editing)}
                variant="outline"
                className="h-11 px-4 font-bold rounded-2xl border-2 border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!canSave || saving}
              className="flex-1 h-11 font-black rounded-2xl shadow-cartoon"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2.5} />
                  Saving…
                </>
              ) : (
                editing ? "Save Changes" : "Add Bill Reminder"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}