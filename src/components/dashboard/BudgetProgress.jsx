import React from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import EmptyStateIcon from "@/components/dashboard/EmptyStateIcon";
import { EXPENSE_CATEGORIES, getCategory } from "@/lib/budgetCategories";
import { formatCurrency } from "@/lib/format";

export default function BudgetProgress({ spentByCategory, budgets }) {
  const budgetMap = {};
  budgets.forEach((b) => { budgetMap[b.category] = Number(b.limit) || 0; });

  const rows = EXPENSE_CATEGORIES.map((c) => {
    const spent = spentByCategory[c.id] || 0;
    const limit = budgetMap[c.id] || 0;
    return { cat: c, spent, limit, pct: limit > 0 ? Math.min(100, (spent / limit) * 100) : 0, over: limit > 0 && spent > limit };
  }).filter((r) => r.limit > 0 || r.spent > 0);

  if (!rows.length) {
    return (
      <div className="text-center py-8 text-muted-foreground font-semibold">
        <EmptyStateIcon icon={Target} size="sm" />
        Set a budget to track your spending limits here!
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {rows.map((r) => {
        const remaining = r.limit - r.spent;
        return (
          <div key={r.cat.id}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${r.cat.color}22`, color: r.cat.color }}
                >
                  <r.cat.icon className="w-4 h-4" strokeWidth={2.5} />
                </span>
                <span className="font-bold text-sm break-words">{r.cat.label}</span>
              </div>
              <span className={`text-xs font-black sm:text-right ${r.over ? "text-destructive" : "text-muted-foreground"}`}>
                {formatCurrency(r.spent)} / {formatCurrency(r.limit)}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={r.over ? { backgroundColor: "hsl(var(--destructive))" } : { backgroundColor: r.cat.color }}
                initial={{ width: 0 }}
                animate={{ width: `${r.pct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <p className={`text-[11px] font-bold mt-1 ${remaining >= 0 ? "text-success" : "text-destructive"}`}>
              {remaining >= 0
                ? `${formatCurrency(remaining)} left to spend`
                : `${formatCurrency(Math.abs(remaining))} over budget`}
            </p>
          </div>
        );
      })}
    </div>
  );
}