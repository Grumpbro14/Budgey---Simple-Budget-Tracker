import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/lib/budgetCategories";

export default function BudgetModal({ open, onClose, onSave, budgets, monthKey }) {
  // budgets: array of CategoryBudget for current month
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const map = {};
    EXPENSE_CATEGORIES.forEach((c) => {
      const b = budgets.find((bd) => bd.category === c.id);
      map[c.id] = b ? String(b.limit) : "";
    });
    setValues(map);
  }, [open, budgets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const entries = EXPENSE_CATEGORIES
        .map((c) => ({ category: c.id, limit: parseFloat(values[c.id]) || 0 }))
        .filter((x) => x.limit > 0);
      await onSave(entries, monthKey);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl border-2 border-border max-w-md p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black">Set Monthly Budgets</DialogTitle>
          <p className="text-sm font-semibold text-muted-foreground">
            Decide how much to spend in each category this month.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {EXPENSE_CATEGORIES.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span
                className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${c.color}22`, color: c.color }}
              >
                <c.icon className="w-5 h-5" strokeWidth={2.5} />
              </span>
              <span className="flex-1 font-bold text-sm">{c.label}</span>
              <div className="relative w-28">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={values[c.id] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [c.id]: e.target.value }))}
                  className="pl-7 h-10 font-bold"
                />
              </div>
            </div>
          ))}
          <Button type="submit" disabled={saving} className="w-full h-12 font-bold text-base mt-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Budgets!"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}