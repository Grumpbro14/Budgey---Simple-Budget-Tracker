import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { GOAL_ICONS, GOAL_COLORS } from "@/lib/budgetCategories";

export default function SavingsGoalModal({ open, onClose, onSave, editing }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [icon, setIcon] = useState("PiggyBank");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setTarget(String(editing.target_amount ?? ""));
      setDate(editing.target_date || "");
      setColor(editing.color || GOAL_COLORS[0]);
      setIcon(editing.icon || "PiggyBank");
    } else {
      setName("");
      setTarget("");
      setDate("");
      setColor(GOAL_COLORS[0]);
      setIcon("PiggyBank");
    }
  }, [editing, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = parseFloat(target);
    if (!name.trim() || !t || t <= 0) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        target_amount: t,
        target_date: date || null,
        color,
        icon
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl border-2 border-border max-w-md p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black">
            {editing ? "Edit Goal" : "New Savings Goal"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="gname" className="font-bold">Goal Name</Label>
            <Input
              id="gname"
              autoFocus
              placeholder="e.g. Vacation to Japan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="gtarget" className="font-bold">Target Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-muted-foreground">$</span>
                <Input
                  id="gtarget"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="pl-7 h-11"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gdate" className="font-bold">Target Date</Label>
              <Input
                id="gdate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Pick an Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {GOAL_ICONS.map((g) => {
                const active = icon === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setIcon(g.id)}
                    className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all ${active ? "border-primary scale-110 bg-primary/10" : "border-border hover:border-primary/40"}`}
                    aria-label={g.label}
                  >
                    <g.icon className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Pick a Color</Label>
            <div className="flex flex-wrap gap-2">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full border-4 transition-transform ${color === c ? "scale-110 border-foreground/30" : "border-transparent hover:scale-105"}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full h-12 font-bold text-base">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editing ? "Save Goal" : "Create Goal!"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}