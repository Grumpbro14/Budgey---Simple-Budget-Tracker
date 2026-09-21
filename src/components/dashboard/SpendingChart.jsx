import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart3, Plus } from "lucide-react";
import EmptyStateIcon from "@/components/dashboard/EmptyStateIcon";
import { Button } from "@/components/ui/button";
import { getCategory } from "@/lib/budgetCategories";
import { formatCurrency } from "@/lib/format";

export default function SpendingChart({ data, onAddTransaction, isDemo = false }) {
  // data: [{ category, amount }]
  const chartData = data
    .filter((d) => d.amount > 0)
    .map((d) => {
      const c = getCategory(d.category);
      return { name: c.label, value: d.amount, color: c.color };
    })
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (!chartData.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground font-semibold">
        <EmptyStateIcon icon={BarChart3} />
        <p className="font-bold text-foreground">No spending yet</p>
        <p className="text-sm mt-1">Add an expense to see your breakdown!</p>
        {onAddTransaction && (
          <motion.div whileTap={{ scale: 0.96 }} className="mt-4">
            <Button onClick={onAddTransaction} className="h-11 px-5 font-bold rounded-xl bg-primary">
              <Plus className="w-4 h-4 mr-1" strokeWidth={2.5} /> Add Transaction
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`flex flex-col sm:flex-row items-center gap-4 ${isDemo ? "opacity-40" : ""}`}>
      <div className="relative w-48 h-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "2px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                fontWeight: 700
              }}
              formatter={(v) => formatCurrency(v)}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Spent</span>
          <span className="text-xl font-black tabular-nums">{formatCurrency(total, { compact: true })}</span>
        </div>
      </div>
      <div className="flex-1 w-full space-y-2">
        {chartData.slice(0, 6).map((d) => (
          <div key={d.name} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-muted/60 transition-colors">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="flex-1 text-base font-bold truncate">{d.name}</span>
            <span className="text-base font-black tabular-nums">{formatCurrency(d.value)}</span>
            <span className="text-sm font-bold text-muted-foreground w-12 text-right tabular-nums">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
      </div>
      {isDemo && (
        <p className="text-center text-xs font-semibold text-muted-foreground mt-3">Add your first transaction to replace this</p>
      )}
    </div>
  );
}