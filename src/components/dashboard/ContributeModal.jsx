import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Minus, Plus, Target } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getGoalIcon } from "@/lib/budgetCategories";
import { formatCurrency } from "@/lib/format";

export default function ContributeModal({ open, goal, goals = [], onClose, onContribute }) {
  const [amount, setAmount] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (open) {
      setAmount("");
      const active = goals.filter((g) => !g.isDemo && (Number(g.current_amount) || 0) < (g.target_amount || 0));
      // Auto-select if only one active goal, otherwise use the passed-in goal (if still active)
      if (active.length === 1) {
        setSelectedId(active[0].id);
      } else {
        setSelectedId(goal && active.some((g) => g.id === goal.id) ? goal.id : "");
      }
    }
  }, [open, goal?.id, goals]);

  const selectableGoals = goals.filter((g) => !g.isDemo && (Number(g.current_amount) || 0) < (g.target_amount || 0));
  const selectedGoal = selectableGoals.find((g) => g.id === selectedId) || null;
  const showSelector = selectableGoals.length > 1;
  const remaining = selectedGoal ? Math.max(0, (selectedGoal.target_amount || 0) - (selectedGoal.current_amount || 0)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || !selectedGoal) return;
    setSaving(true);
    try {
      await onContribute(selectedGoal, amt);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl border-2 border-border max-w-sm p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black">
            {selectedGoal ? `Add to ${selectedGoal.name}` : "Add to Savings Goal"}
          </DialogTitle>
          <p className="text-sm font-semibold text-muted-foreground">
            {selectedGoal
              ? remaining > 0
                ? `${formatCurrency(remaining)} to go!`
                : "Goal already reached!"
              : "Select a goal to add funds to."}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {showSelector && (
            <div className="space-y-2">
              <Label className="font-bold">Savings Goal</Label>
              <Select value={selectedId} onValueChange={setSelectedId} required>
                <SelectTrigger className="h-12 font-bold rounded-xl border-2 border-border">
                  <SelectValue placeholder="Choose a goal…" />
                </SelectTrigger>
                <SelectContent>
                  {selectableGoals.map((g) => {
                    const Icon = getGoalIcon(g.icon);
                    return (
                      <SelectItem key={g.id} value={g.id}>
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" strokeWidth={2.5} style={{ color: g.color }} />
                          {g.name}
                          <span className="text-xs text-muted-foreground font-semibold">
                            ({formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)})
                          </span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
          {selectableGoals.length === 0 && (
            <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-3 text-sm font-semibold text-muted-foreground">
              <Target className="w-4 h-4" strokeWidth={2.5} />
              No active goals — create one first!
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="camount" className="font-bold">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-muted-foreground">$</span>
              <Input
                id="camount"
                type="number"
                step="0.01"
                min="0.01"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-12 text-lg font-bold"
                required
                disabled={!selectedGoal}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 font-bold"
              onClick={() => setAmount(String(Math.max(0, (parseFloat(amount) || 0) - 25)))}
              disabled={!selectedGoal}
            >
              <Minus className="w-4 h-4" strokeWidth={2.5} /> 25
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 font-bold"
              onClick={() => setAmount(String((parseFloat(amount) || 0) + 25))}
              disabled={!selectedGoal}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} /> 25
            </Button>
          </div>
          <Button type="submit" disabled={saving || !selectedGoal} className="w-full h-12 font-bold text-base">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Funds!"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}