import React, { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { TrendingUp, CalendarRange, PieChart as PieIcon, Activity, PiggyBank } from "lucide-react";
import { formatCurrency, monthKey } from "@/lib/format";
import { getCategory, ALL_CATEGORIES } from "@/lib/budgetCategories";

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

function monthLabel(mk) {
  const [y, m] = mk.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: "short" });
}

function ChartCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-card border-2 border-primary rounded-3xl p-5 shadow-cartoon hover:border-primary transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" strokeWidth={2.5} />
        <h3 className="text-base font-black">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AdvancedCharts({ transactions, goals }) {
  // Income vs Expenses over the last 6 months
  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const mk = monthKey(t.date);
      if (!map[mk]) map[mk] = { month: mk, income: 0, expenses: 0 };
      if (t.type === "income") map[mk].income += Number(t.amount);
      else map[mk].expenses += Number(t.amount);
    });
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((d) => ({ ...d, label: monthLabel(d.month) }));
  }, [transactions]);

  // Spending over time (cumulative daily within current month)
  const dailyData = useMemo(() => {
    const now = monthKey();
    const days = {};
    transactions
      .filter((t) => t.type === "expense" && t.date?.startsWith(now))
      .forEach((t) => {
        const day = t.date.slice(8, 10);
        days[day] = (days[day] || 0) + Number(t.amount);
      });
    const sorted = Object.entries(days).sort((a, b) => a[0].localeCompare(b[0]));
    let cum = 0;
    return sorted.map(([day, amt]) => {
      cum += amt;
      return { day: `Day ${Number(day)}`, spent: Number(amt.toFixed(2)), cumulative: Number(cum.toFixed(2)) };
    });
  }, [transactions]);

  // Category breakdown (all-time expenses)
  const categoryData = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      const cat = getCategory(t.category);
      map[cat.label] = (map[cat.label] || 0) + Number(t.amount);
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)), pct: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Savings progress per goal
  const goalData = useMemo(() => {
    return goals.map((g) => ({
      name: g.name.length > 14 ? g.name.slice(0, 14) + "…" : g.name,
      saved: Number(g.current_amount || 0),
      target: Number(g.target_amount || 0),
      pct: g.target_amount > 0 ? Math.min(100, Math.round((Number(g.current_amount || 0) / Number(g.target_amount)) * 100)) : 0
    }));
  }, [goals]);

  const hasData = transactions.length > 0;

  if (!hasData) {
    return (
      <div className="bg-card border-2 border-primary rounded-3xl p-8 text-center">
        <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-2" strokeWidth={2} />
        <p className="font-bold">Add some transactions to unlock your advanced charts</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <ChartCard icon={CalendarRange} title="Income vs Expenses (6 months)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 700 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11, fontWeight: 600 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "2px solid hsl(var(--border))", borderRadius: 16, fontWeight: 700 }}
              formatter={(v) => formatCurrency(v)}
            />
            <Legend wrapperStyle={{ fontWeight: 700, fontSize: 12 }} />
            <Bar dataKey="income" name="Income" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard icon={TrendingUp} title="Spending Trend (This Month)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 600 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11, fontWeight: 600 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "2px solid hsl(var(--border))", borderRadius: 16, fontWeight: 700 }}
              formatter={(v) => formatCurrency(v)}
            />
            <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="hsl(var(--chart-1))" strokeWidth={3} fill="url(#spendGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard icon={PieIcon} title="Spending Breakdown (%)">
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "2px solid hsl(var(--border))", borderRadius: 16, fontWeight: 700 }}
                formatter={(v, n) => [formatCurrency(v), n]}
              />
              <Legend wrapperStyle={{ fontWeight: 700, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground font-semibold py-10 text-center">No expense data yet</p>
        )}
      </ChartCard>

      <ChartCard icon={PiggyBank} title="Savings Progress">
        {goalData.length > 0 ? (
          <div className="space-y-3">
            {goalData.map((g) => (
              <div key={g.name}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="truncate pr-2">{g.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap tabular-nums">{formatCurrency(g.saved)} / {formatCurrency(g.target)}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden border border-border">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${g.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-semibold py-10 text-center">No savings goals yet</p>
        )}
      </ChartCard>
    </div>
  );
}