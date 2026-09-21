import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, TrendingDown, TrendingUp, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, monthKey } from "@/lib/format";
import { getCategory, ALL_CATEGORIES } from "@/lib/budgetCategories";

export default function DetailedHistory({ transactions }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  const months = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => t.date && set.add(monthKey(t.date)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
        if (monthFilter !== "all" && !t.date?.startsWith(monthFilter)) return false;
        if (search) {
          const q = search.toLowerCase();
          const cat = getCategory(t.category);
          if (!(`${t.description || ""} ${cat.label}`.toLowerCase().includes(q))) return false;
        }
        return true;
      })
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [transactions, search, categoryFilter, monthFilter]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expenses = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const byCategory = {};
    filtered.filter((t) => t.type === "expense").forEach((t) => {
      const cat = getCategory(t.category);
      byCategory[cat.label] = (byCategory[cat.label] || 0) + Number(t.amount);
    });
    const catList = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    return { income, expenses, net: income - expenses, catList };
  }, [filtered]);

  return (
    <div className="bg-card border-2 border-primary rounded-3xl p-5 shadow-cartoon hover:border-primary transition-colors duration-300">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="pl-9 rounded-xl border-2 border-border font-semibold"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-xl border-2 border-border bg-card px-3 font-bold text-sm"
        >
          <option value="all">All categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="h-9 rounded-xl border-2 border-border bg-card px-3 font-bold text-sm"
        >
          <option value="all">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4">
        <div className="bg-success/10 rounded-2xl p-2 sm:p-3 text-center border border-success/20">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Income</p>
          <p className="text-sm sm:text-lg font-black text-success tabular-nums break-all sm:break-normal">{formatCurrency(totals.income)}</p>
        </div>
        <div className="bg-destructive/10 rounded-2xl p-2 sm:p-3 text-center border border-destructive/20">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Expenses</p>
          <p className="text-sm sm:text-lg font-black text-destructive tabular-nums break-all sm:break-normal">{formatCurrency(totals.expenses)}</p>
        </div>
        <div className="bg-primary/10 rounded-2xl p-2 sm:p-3 text-center border border-primary/20">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Net</p>
          <p className={`text-sm sm:text-lg font-black tabular-nums break-all sm:break-normal ${totals.net >= 0 ? "text-success" : "text-destructive"}`}>
            {formatCurrency(totals.net, { sign: true })}
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      {totals.catList.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Category Breakdown</p>
          <div className="flex flex-wrap gap-1.5">
            {totals.catList.map(([name, amt]) => (
              <span key={name} className="text-xs font-bold bg-muted rounded-full px-2.5 py-1">
                {name}: {formatCurrency(amt)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground font-semibold text-center py-8">No transactions match your filters</p>
        ) : (
          filtered.map((t, i) => {
            const cat = getCategory(t.category);
            const Icon = cat.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm line-clamp-2 sm:truncate break-words">{t.description || cat.label}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">
                    {cat.label} · {formatDate(t.date)}
                  </p>
                </div>
                <span className={`font-black text-xs sm:text-sm whitespace-nowrap tabular-nums shrink-0 ${t.type === "income" ? "text-success" : "text-foreground"}`}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
      <p className="text-xs text-muted-foreground font-semibold mt-3 text-center">
        Showing {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}