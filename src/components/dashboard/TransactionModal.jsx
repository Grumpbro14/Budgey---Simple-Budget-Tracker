import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownCircle, ArrowUpCircle, Trash2, Loader2 } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getGoalIcon } from "@/lib/budgetCategories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { Target } from "lucide-react";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TransactionModal({ open, onClose, onSave, onDelete, editing, goals = [] }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState("");

  const activeGoals = goals.filter((g) => !g.isDemo && (Number(g.current_amount) || 0) < (g.target_amount || 0));
  const showGoalPicker = type === "expense" && category === "savings" && activeGoals.length > 0;

  useEffect(() => {
    if (editing) {
      setType(editing.type || "expense");
      setAmount(String(editing.amount ?? ""));
      setCategory(editing.category || "food");
      setDescription(editing.description || "");
      setDate(editing.date || todayStr());
      setSelectedGoalId(editing.savings_goal_id || "");
    } else {
      setType("expense");
      setAmount("");
      setCategory("food");
      setDescription("");
      setDate(todayStr());
      setSelectedGoalId("");
    }
  }, [editing, open]);

  const cats = (type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)
    .filter((c) => c.id !== "savings" || activeGoals.length > 0);

  useEffect(() => {
    if (!open) return;
    if (!cats.find((c) => c.id === category)) setCategory(cats[0].id);
  }, [type]); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    if (showGoalPicker && !selectedGoalId) return;
    setSaving(true);
    try {
      await onSave({
        type,
        amount: amt,
        category,
        description: description.trim(),
        date,
        savings_goal_id: showGoalPicker ? selectedGoalId : undefined
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
            {editing ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* type toggle */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-muted rounded-2xl">
            {[
              { id: "expense", label: "Expense", icon: ArrowDownCircle, color: "destructive" },
              { id: "income", label: "Income", icon: ArrowUpCircle, color: "success" }
            ].map((t) => {
              const active = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className="relative flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors"
                >
                  {active && (
                    <motion.div
                      layoutId="type-pill"
                      className={`absolute inset-0 rounded-xl ${t.color === "success" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 ${active ? "" : "text-muted-foreground"}`}>
                    <t.icon className="w-4 h-4" strokeWidth={2.5} />
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-12 text-lg font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {cats.map((c) => {
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 transition-all ${active ? "border-primary bg-primary/10 scale-105" : "border-border hover:border-primary/40"}`}
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${c.color}22`, color: c.color }}
                    >
                      <c.icon className="w-5 h-5" strokeWidth={2.5} />
                    </span>
                    <span className="text-[10px] font-bold leading-tight text-center">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {showGoalPicker && (
            <div className="space-y-2">
              <Label className="font-bold">Savings Goal</Label>
              {activeGoals.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-3 text-sm font-semibold text-muted-foreground">
                  <Target className="w-4 h-4" strokeWidth={2.5} />
                  No active goals — create one first!
                </div>
              ) : (
                <Select value={selectedGoalId} onValueChange={setSelectedGoalId} required>
                  <SelectTrigger className="h-12 font-bold rounded-xl border-2 border-border">
                    <SelectValue placeholder="Choose a goal…" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeGoals.map((g) => {
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
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="desc" className="font-bold">Note (optional)</Label>
            <Input
              id="desc"
              placeholder="What was it for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="font-bold">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="flex gap-2 pt-1">
            {editing && onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={() => { onDelete(editing); onClose(); }}
                className="h-12 px-4 text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 font-bold text-base"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editing ? "Save Changes" : "Add It!"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}