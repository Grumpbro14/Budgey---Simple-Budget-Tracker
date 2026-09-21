import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Wallet, TrendingDown, TrendingUp, PiggyBank, Scale } from "lucide-react";
import { formatCurrency, monthKey, isInMonth } from "@/lib/format";
import { getCategory } from "@/lib/budgetCategories";

export default function PremiumTools({ transactions, budgets, goals, currentMonth }) {
  const insights = useMemo(() => {
    const monthTx = transactions.filter((t) => isInMonth(t.date, currentMonth));
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonth = monthKey(prevMonthDate);
    const prevTx = transactions.filter((t) => isInMonth(t.date, prevMonth));

    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expenses = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const prevExpenses = prevTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

    const totalBudget = budgets.reduce((s, b) => s + Number(b.limit), 0);
    const remaining = totalBudget - expenses;
    const budgetUsedPct = totalBudget > 0 ? Math.round((expenses / totalBudget) * 100) : 0;
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

    const monthChange = prevExpenses > 0 ? Math.round(((expenses - prevExpenses) / prevExpenses) * 100) : 0;

    // Top spending category this month
    const catMap = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => {
      const cat = getCategory(t.category);
      catMap[cat.label] = (catMap[cat.label] || 0) + Number(t.amount);
    });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

    // Over-budget categories
    const overBudget = budgets
      .map((b) => {
        const cat = getCategory(b.category);
        const spent = catMap[cat.label] || 0;
        return { label: cat.label, limit: Number(b.limit), spent, over: spent > Number(b.limit) };
      })
      .filter((b) => b.over);

    // Build tips
    const tips = [];
    if (topCat) tips.push(`Your top spending category this month is ${topCat[0]} (${formatCurrency(topCat[1])}).`);
    if (monthChange < 0) tips.push(`Spending is down ${Math.abs(monthChange)}% vs last month — great progress!`);
    else if (monthChange > 0) tips.push(`Spending is up ${monthChange}% vs last month. Watch those categories!`);
    if (savingsRate >= 20) tips.push(`Your savings rate is ${savingsRate}% — you're building a strong cushion.`);
    else if (income > 0) tips.push(`Your savings rate is ${savingsRate}%. Aim for 20%+ to grow your savings faster.`);
    if (overBudget.length > 0) tips.push(`You're over budget in ${overBudget.map((b) => b.label).join(", ")}.`);
    if (totalBudget > 0 && remaining > 0) tips.push(`${formatCurrency(remaining)} left in your budget this month — stay on track!`);

    return { income, expenses, totalBudget, remaining, budgetUsedPct, savingsRate, monthChange, topCat, overBudget, tips };
  }, [transactions, budgets, currentMonth]);

  return (
    <div className="space-y-4">
      {/* Budget overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ToolStat icon={Wallet} label="Budget Left" value={insights.totalBudget > 0 ? formatCurrency(insights.remaining) : "—"} accent={insights.remaining >= 0 ? "success" : "expense"} />
        <ToolStat icon={Scale} label="Budget Used" value={insights.totalBudget > 0 ? `${insights.budgetUsedPct}%` : "—"} accent={insights.budgetUsedPct > 100 ? "expense" : "primary"} />
        <ToolStat icon={PiggyBank} label="Savings Rate" value={`${insights.savingsRate}%`} accent={insights.savingsRate >= 20 ? "success" : "accent"} />
        <ToolStat
          icon={insights.monthChange <= 0 ? TrendingDown : TrendingUp}
          label="vs Last Month"
          value={insights.monthChange === 0 ? "—" : `${insights.monthChange > 0 ? "+" : ""}${insights.monthChange}%`}
          accent={insights.monthChange <= 0 ? "success" : "expense"}
        />
      </div>

      {/* Budget progress bar */}
      {insights.totalBudget > 0 && (
        <div className="bg-card border-2 border-primary rounded-3xl p-5 shadow-cartoon">
          <div className="flex justify-between mb-2">
            <span className="font-black text-sm">Monthly Budget Progress</span>
            <span className="font-bold text-sm text-muted-foreground">{formatCurrency(insights.expenses)} / {formatCurrency(insights.totalBudget)}</span>
          </div>
          <div className="h-4 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, insights.budgetUsedPct)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className={`h-full rounded-full ${insights.budgetUsedPct > 100 ? "bg-destructive" : "bg-gradient-to-r from-primary to-accent"}`}
            />
          </div>
          <p className="text-xs font-semibold text-muted-foreground mt-2">
            {insights.budgetUsedPct > 100
              ? `You're ${insights.budgetUsedPct - 100}% over budget this month.`
              : `${100 - insights.budgetUsedPct}% of your budget remaining.`}
          </p>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary rounded-3xl p-5 shadow-cartoon">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-primary" strokeWidth={2.5} />
          <h3 className="text-base font-black">Budgeting Insights</h3>
        </div>
        {insights.tips.length > 0 ? (
          <ul className="space-y-2">
            {insights.tips.map((tip, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2 text-sm font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground font-semibold">Add transactions and set budgets to get personalized insights.</p>
        )}
      </div>
    </div>
  );
}

function ToolStat({ icon: Icon, label, value, accent }) {
  const colorMap = {
    success: "text-success",
    expense: "text-destructive",
    primary: "text-primary",
    accent: "text-accent"
  };
  return (
    <div className="bg-card border-2 border-primary rounded-2xl p-3 shadow-cartoon hover:border-primary transition-colors duration-300">
      <Icon className="w-4 h-4 text-muted-foreground mb-1.5" strokeWidth={2.5} />
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className={`text-lg font-black tabular-nums ${colorMap[accent] || ""}`}>{value}</p>
    </div>
  );
}