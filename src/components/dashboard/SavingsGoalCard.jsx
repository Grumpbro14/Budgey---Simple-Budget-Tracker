import React from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGoalIcon } from "@/lib/budgetCategories";
import { formatCurrency, formatDate } from "@/lib/format";

export default function SavingsGoalCard({ goal, onContribute, onDelete }) {
  const Icon = getGoalIcon(goal.icon);
  const color = goal.color || "#f97316";
  const target = Number(goal.target_amount) || 0;
  const current = Math.min(Number(goal.current_amount) || 0, target);
  const pct = target > 0 ? Math.round((current / target) * 100) : 0;
  const done = current >= target && target > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="relative bg-card border-2 border-primary rounded-xl p-5 shadow-cartoon overflow-hidden"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-10"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${color}22`, color }}
          >
            <Icon className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-black line-clamp-2 sm:truncate break-words">{goal.name}</p>
            <p className="text-xs font-semibold text-muted-foreground">
              {goal.target_date ? `By ${formatDate(goal.target_date)}` : "No deadline"}
            </p>
          </div>
        </div>
        {done && (
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            className="shrink-0 w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center"
          >
            <Check className="w-5 h-5" strokeWidth={3} />
          </motion.span>
        )}
      </div>

      <div className="mt-4 relative">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-lg font-black">{formatCurrency(current)}</span>
          <span className="text-sm font-bold text-muted-foreground">of {formatCurrency(target)}</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full relative"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            {pct > 6 && (
              <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-black text-white/90">
                {pct}%
              </span>
            )}
          </motion.div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={() => onContribute(goal)} className="flex-1 h-10 font-bold text-sm">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Add Funds
        </Button>
        <Button
          variant="outline"
          onClick={() => onDelete(goal)}
          className="h-10 px-3 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
          aria-label="Delete goal"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
        </Button>
      </div>
    </motion.div>
  );
}