import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Target, BarChart3,
  Settings, Sparkles, ArrowLeftRight, Trophy, Gem, Crown, History, Wrench, HandCoins
} from "lucide-react";
import { Image } from "@/components/ui/image";
import EmptyStateIcon from "@/components/dashboard/EmptyStateIcon";
import PremiumBadge from "@/components/dashboard/PremiumBadge";
import SettingsModal from "@/components/dashboard/SettingsModal";
import PremiumModal from "@/components/dashboard/PremiumModal";
import AdvancedCharts from "@/components/dashboard/AdvancedCharts";
import DetailedHistory from "@/components/dashboard/DetailedHistory";
import PremiumTools from "@/components/dashboard/PremiumTools";
import { useTheme } from "@/lib/ThemeContext";
import { Link } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import TransactionModal from "@/components/dashboard/TransactionModal";
import TransactionList from "@/components/dashboard/TransactionList";
import SavingsGoalCard from "@/components/dashboard/SavingsGoalCard";
import SavingsGoalModal from "@/components/dashboard/SavingsGoalModal";
import ContributeModal from "@/components/dashboard/ContributeModal";
import BudgetModal from "@/components/dashboard/BudgetModal";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import SpendingChart from "@/components/dashboard/SpendingChart";
import { formatCurrency, monthKey, isInMonth } from "@/lib/format";
import { celebrate } from "@/lib/celebrate";
import { getCategory } from "@/lib/budgetCategories";
import LoanCard from "@/components/dashboard/LoanCard";
import LoanModal from "@/components/dashboard/LoanModal";
import BillRemindersSection from "@/components/dashboard/BillRemindersSection";
import BillNotificationBell from "@/components/dashboard/BillNotificationBell";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import ReviewPrompt from "@/components/ReviewPrompt";
import CompleteProfileModal from "@/components/CompleteProfileModal";

const DEMO_TX_DATE = new Date().toISOString().slice(0, 10);
const DEMO_TRANSACTIONS = [
  { id: "demo-1", type: "expense", amount: 4.5, category: "food", description: "Coffee", date: DEMO_TX_DATE, isDemo: true },
  { id: "demo-2", type: "income", amount: 500, category: "salary", description: "Paycheck", date: DEMO_TX_DATE, isDemo: true },
  { id: "demo-3", type: "expense", amount: 62.3, category: "shopping", description: "Groceries", date: DEMO_TX_DATE, isDemo: true },
];
const DEMO_CHART_DATA = [
  { category: "food", amount: 4.5 },
  { category: "shopping", amount: 62.3 },
];

const DEMO_BUDGETS = [
  { id: "demo-budget-1", category: "food", limit: 300, isDemo: true },
  { id: "demo-budget-2", category: "transport", limit: 150, isDemo: true },
  { id: "demo-budget-3", category: "shopping", limit: 200, isDemo: true },
];

const DEMO_GOAL = {
  id: "demo-goal-1",
  name: "Emergency Fund",
  target_amount: 1000,
  current_amount: 250,
  color: "#f97316",
  icon: "Shield",
  isDemo: true,
};

export default function Home() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loanModal, setLoanModal] = useState({ open: false, editing: null });
  const [loading, setLoading] = useState(true);

  const [txModal, setTxModal] = useState({ open: false, editing: null });
  const [goalModal, setGoalModal] = useState({ open: false, editing: null });
  const [contributeModal, setContributeModal] = useState({ open: false, goal: null });
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [navActive, setNavActive] = useState("spending");
  const { isPremium, premiumActive } = useTheme();

  const currentMonth = useMemo(() => monthKey(), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tx, gl, bd, ln] = await Promise.all([
        base44.entities.Transaction.list("-date", 500),
        base44.entities.SavingsGoal.list("-updated_date", 100),
        base44.entities.CategoryBudget.filter({ month: currentMonth }, "-created_date", 100),
        base44.entities.Loan.list("-created_date", 100)
      ]);
      setTransactions(tx || []);
      setGoals(gl || []);
      setBudgets(bd || []);
      setLoans(ln || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => { loadData(); }, [loadData]);

  // ---- derived stats ----
  const stats = useMemo(() => {
    const monthTx = transactions.filter((t) => isInMonth(t.date, currentMonth));
    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expenses = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const totalBalance = transactions.reduce((s, t) => s + (t.type === "income" ? Number(t.amount) : -Number(t.amount)), 0);
    const totalBudget = budgets.reduce((s, b) => s + Number(b.limit), 0);
    const remaining = totalBudget - expenses;
    const savings = goals.reduce((s, g) => s + Number(g.current_amount || 0), 0);

    const spentByCategory = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => {
      spentByCategory[t.category] = (spentByCategory[t.category] || 0) + Number(t.amount);
    });

    const chartData = Object.entries(spentByCategory).map(([category, amount]) => ({ category, amount }));

    return { income, expenses, totalBalance, totalBudget, remaining, savings, spentByCategory, chartData, monthTx };
  }, [transactions, budgets, goals, currentMonth]);

  const recentTransactions = useMemo(
    () => transactions.length === 0
      ? DEMO_TRANSACTIONS
      : [...transactions].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8),
    [transactions]
  );

  const emailPrefix = (user?.email || "").split("@")[0];
  const fullNameIsReal = !!user?.full_name && user.full_name !== emailPrefix;
  const firstName = (user?.name || (fullNameIsReal ? user.full_name : "") || emailPrefix || "Friend").split(" ")[0];
  const hasName = !!(user?.name || fullNameIsReal);
  const [profilePromptDismissed, setProfilePromptDismissed] = useState(false);
  const showProfilePrompt = !hasName && !profilePromptDismissed;
  const handleProfileComplete = async () => {
    setProfilePromptDismissed(true);
    try { await checkUserAuth(); } catch (e) {}
  };

  // ---- handlers ----
  const handleSaveTransaction = async (data) => {
    const { savings_goal_id, ...txData } = data;
    if (savings_goal_id) txData.savings_goal_id = savings_goal_id;
    if (txModal.editing) {
      await base44.entities.Transaction.update(txModal.editing.id, txData);
      setTransactions((prev) => prev.map((t) => (t.id === txModal.editing.id ? { ...t, ...txData } : t)));
      toast({ title: "Updated!", description: "Your transaction was saved.", variant: "default" });
    } else {
      const created = await base44.entities.Transaction.create(txData);
      setTransactions((prev) => [created, ...prev]);
      if (data.type === "income") {
        toast({ title: "Nice!", description: celebrate("Money in — keep it flowing!"), variant: "default" });
      } else {
        toast({ title: "Logged!", description: "Expense added. Stay on track!", variant: "default" });
      }
    }
    // Link contribution to a savings goal (only on create — edits don't re-add)
    if (savings_goal_id && !txModal.editing) {
      const goal = goals.find((g) => g.id === savings_goal_id);
      if (goal) {
        const newAmount = Math.min((Number(goal.current_amount) || 0) + Number(data.amount), goal.target_amount);
        const reached = newAmount >= goal.target_amount && (Number(goal.current_amount) || 0) < goal.target_amount;
        await base44.entities.SavingsGoal.update(goal.id, { current_amount: newAmount });
        setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, current_amount: newAmount } : g)));
        if (reached) {
          toast({ title: "Goal unlocked!", description: celebrate("Savings goal unlocked!"), variant: "default" });
        }
      }
    }
  };

  const handleDeleteTransaction = async (t) => {
    // Reverse savings goal contribution if this transaction was linked to one
    if (t.savings_goal_id && t.category === "savings") {
      const goal = goals.find((g) => g.id === t.savings_goal_id);
      if (goal) {
        const newAmount = Math.max(0, (Number(goal.current_amount) || 0) - Number(t.amount));
        await base44.entities.SavingsGoal.update(goal.id, { current_amount: newAmount });
        setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, current_amount: newAmount } : g)));
      }
    }
    await base44.entities.Transaction.delete(t.id);
    setTransactions((prev) => prev.filter((x) => x.id !== t.id));
    toast({ title: "Deleted", description: "Transaction removed.", variant: "default" });
  };

  const handleSaveGoal = async (data) => {
    if (goalModal.editing) {
      await base44.entities.SavingsGoal.update(goalModal.editing.id, data);
      setGoals((prev) => prev.map((g) => (g.id === goalModal.editing.id ? { ...g, ...data } : g)));
      toast({ title: "Goal updated!", description: "Keep chasing it!", variant: "default" });
    } else {
      const created = await base44.entities.SavingsGoal.create({ ...data, current_amount: 0 });
      setGoals((prev) => [created, ...prev]);
      toast({ title: "Goal created!", description: "Let's get saving!", variant: "default" });
    }
  };

  const handleContribute = async (goal, amt) => {
    const newAmount = Math.min((Number(goal.current_amount) || 0) + amt, goal.target_amount);
    const reached = newAmount >= goal.target_amount && (Number(goal.current_amount) || 0) < goal.target_amount;
    await base44.entities.SavingsGoal.update(goal.id, { current_amount: newAmount });
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, current_amount: newAmount } : g)));
    // Subtract the contributed amount from total balance by logging an expense transaction
    const txData = {
      type: "expense",
      amount: amt,
      category: "savings",
      description: `Savings: ${goal.name}`,
      date: new Date().toISOString().slice(0, 10),
      savings_goal_id: goal.id,
    };
    const createdTx = await base44.entities.Transaction.create(txData);
    setTransactions((prev) => [createdTx, ...prev]);
    if (reached) {
      toast({ title: "Goal unlocked!", description: celebrate("Savings goal unlocked!"), variant: "default" });
    } else {
      toast({ title: "You're getting closer!", description: "Funds added to your goal.", variant: "default" });
    }
  };

  const handleDeleteGoal = async (goal) => {
    await base44.entities.SavingsGoal.delete(goal.id);
    setGoals((prev) => prev.filter((g) => g.id !== goal.id));
    toast({ title: "Goal removed", description: "No worries — make a new one anytime!", variant: "default" });
  };

  const handleSaveBudgets = async (entries, mKey) => {
    // remove existing budgets for the month, then create new ones
    const existing = budgets.filter((b) => b.month === mKey);
    if (existing.length) {
      await base44.entities.CategoryBudget.deleteMany({ month: mKey });
    }
    if (entries.length) {
      const created = await base44.entities.CategoryBudget.bulkCreate(entries.map((e) => ({ ...e, month: mKey })));
      setBudgets(created || []);
    } else {
      setBudgets([]);
    }
    toast({ title: "Budgets saved!", description: "You're set for the month!", variant: "default" });
  };

  const handleSaveLoan = async (data) => {
    if (loanModal.editing) {
      await base44.entities.Loan.update(loanModal.editing.id, data);
      setLoans((prev) => prev.map((l) => (l.id === loanModal.editing.id ? { ...l, ...data } : l)));
      toast({ title: "Loan updated!", description: "Changes saved.", variant: "default" });
    } else {
      const created = await base44.entities.Loan.create(data);
      setLoans((prev) => [created, ...prev]);
      toast({ title: "Loan added!", description: "Keep an eye on that balance!", variant: "default" });
    }
  };

  const handleDeleteLoan = async (loan) => {
    await base44.entities.Loan.delete(loan.id);
    setLoans((prev) => prev.filter((l) => l.id !== loan.id));
    toast({ title: "Loan removed", description: "Loan deleted.", variant: "default" });
  };

  const handleBillPaid = (createdTx) => {
    if (createdTx) setTransactions((prev) => [createdTx, ...prev]);
  };

  const handleNewGoal = () => {
    if (!isPremium && goals.length >= 5) {
      setPremiumModalOpen(true);
      toast({
        title: "You're using all 5 free goals!",
        description: "Upgrade to Budgey Pro for unlimited savings goals.",
        variant: "default"
      });
    } else {
      setGoalModal({ open: true, editing: null });
    }
  };

  const underBudget = stats.totalBudget > 0 && stats.expenses <= stats.totalBudget;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`h-9 sm:h-11 items-center justify-center cursor-pointer ${premiumActive ? "hidden sm:flex" : "flex"}`}
            >
              <Image
                src="https://media.base44.com/images/public/6aa8016442ae2c535453ee79/68892e863_generated_image.png"
                alt="Budgey"
                fittingType="fit"
                className="h-full w-auto"
              />
            </motion.div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-gradient">Budgey</span>
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground">Fun & Simple Budgeting</span>
            </div>
            {premiumActive && <PremiumBadge />}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            {premiumActive && <BillNotificationBell />}
            {!isPremium ? (
              <Button
                onClick={() => setPremiumModalOpen(true)}
                variant="ghost"
                className="h-9 sm:h-11 px-2 sm:px-4 font-bold rounded-xl sm:bg-gradient-to-r sm:from-primary sm:to-accent sm:text-white"
              >
                <Gem className="w-5 h-5 sm:mr-2 text-primary sm:text-primary-foreground" strokeWidth={2.5} />
                <span className="hidden sm:inline">Pro</span>
              </Button>
            ) : (
              <Button
                onClick={() => setPremiumModalOpen(true)}
                variant="ghost"
                className="h-9 sm:h-11 px-2 sm:px-4 font-bold rounded-xl sm:border sm:border-border"
              >
                <Crown className="w-5 h-5 sm:mr-2" strokeWidth={2.5} />
                <span className="hidden sm:inline">Pro</span>
              </Button>
            )}
            <Button
              onClick={() => setSettingsModalOpen(true)}
              variant="ghost"
              className="h-9 sm:h-11 px-2 sm:px-4 font-bold rounded-xl sm:border sm:border-border"
            >
              <Settings className="w-5 h-5 sm:mr-2" strokeWidth={2.5} />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-balance">
              Welcome Back, <span className="text-gradient">{firstName}</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-semibold mt-1">
              {underBudget && stats.totalBudget > 0
                ? "You're crushing your budget! Keep it going!"
                : "Let's make today's money moves count."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <motion.div
              whileTap={{ scale: 0.96 }}
              className="inline-block"
            >
              <Button
                onClick={() => setTxModal({ open: true, editing: null })}
                className="h-11 px-4 sm:h-12 sm:px-5 font-bold rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" strokeWidth={2.5} /> Add Transaction
              </Button>
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.96 }}
              className="inline-block"
            >
              <Button
                onClick={handleNewGoal}
                className="h-11 px-3 sm:h-12 sm:px-4 font-bold rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm sm:text-base"
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-1" strokeWidth={2.5} /> New Goal
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Stat cards */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <StatCard icon={Wallet} label="Total Balance" value={formatCurrency(stats.totalBalance)} accent={stats.totalBalance >= 0 ? "primary" : "expense"} delay={0} />
              <StatCard icon={TrendingUp} label="Monthly Income" value={formatCurrency(stats.income)} accent="success" delay={0.05} />
              <StatCard icon={TrendingDown} label="Monthly Expenses" value={formatCurrency(stats.expenses)} accent="expense" delay={0.1} />
              <StatCard
                icon={PiggyBank}
                label="Remaining Budget"
                value={stats.totalBudget > 0 ? formatCurrency(stats.remaining) : "—"}
                accent={stats.remaining >= 0 ? "accent" : "expense"}
                subtitle={stats.totalBudget > 0 ? `${Math.round(Math.max(0, stats.remaining) / stats.totalBudget * 100)}% left` : "Set a budget"}
                delay={0.15}
              />
            </section>

            {stats.expenses === 0 && transactions.length > 0 && (
              <div className="flex items-center gap-3 bg-muted border border-border dark:bg-muted/40 dark:border-dashed rounded-xl p-3 sm:p-4">
                <div className="w-9 h-9 rounded-full bg-card border border-border dark:bg-primary/10 dark:border-primary/15 flex items-center justify-center shrink-0">
                  <PiggyBank className="w-5 h-5 text-primary" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">No spend yet this month</p>
                  <p className="text-xs text-muted-foreground font-medium">Add your first one to start tracking.</p>
                </div>
                <Button
                  onClick={() => setTxModal({ open: true, editing: null })}
                  size="sm"
                  className="h-8 px-3 font-bold rounded-lg shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" strokeWidth={2.5} /> Add
                </Button>
              </div>
            )}

            {/* Spending / Budget / Goals — quick nav + long scroll */}
            <section className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {/* Mobile pill nav */}
              <div className="sm:hidden mb-4">
                <div className="flex bg-card border border-primary rounded-full p-1 gap-1">
                  <button
                    onClick={() => { setNavActive('spending'); scrollToSection('spending-section'); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full font-bold text-sm transition-colors ${navActive === 'spending' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  >
                    <BarChart3 className="w-4 h-4" strokeWidth={2.5} /> Spending
                  </button>
                  <button
                    onClick={() => { setNavActive('budget'); scrollToSection('budget-section'); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full font-bold text-sm transition-colors ${navActive === 'budget' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  >
                    <Target className="w-4 h-4" strokeWidth={2.5} /> Budget
                  </button>
                  <button
                    onClick={() => { setNavActive('goals'); scrollToSection('goals-section'); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full font-bold text-sm transition-colors ${navActive === 'goals' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  >
                    <PiggyBank className="w-4 h-4" strokeWidth={2.5} /> Goals
                  </button>
                </div>
              </div>
              {/* Desktop nav buttons */}
              <div className="hidden sm:flex flex-wrap gap-2 mb-4">
                <Button onClick={() => scrollToSection('spending-section')} variant="outline" className="h-9 px-3 font-bold rounded-xl border-2 border-border">
                  <BarChart3 className="w-4 h-4 mr-1" strokeWidth={2.5} /> Spending
                </Button>
                <Button onClick={() => scrollToSection('budget-section')} variant="outline" className="h-9 px-3 font-bold rounded-xl border-2 border-border">
                  <Target className="w-4 h-4 mr-1" strokeWidth={2.5} /> Budget
                </Button>
                <Button onClick={() => scrollToSection('goals-section')} variant="outline" className="h-9 px-3 font-bold rounded-xl border-2 border-border">
                  <PiggyBank className="w-4 h-4 mr-1" strokeWidth={2.5} /> Goals
                </Button>
              </div>

              <div id="spending-section" className="scroll-mt-24 bg-card border-2 border-primary rounded-3xl p-5 shadow-cartoon hover:border-primary/20 transition-colors duration-300 mb-4">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" strokeWidth={2.5} />
                    <h2 className="text-base sm:text-lg font-black">Where Your Money Goes</h2>
                  </div>
                  {transactions.length === 0 && (
                    <span className="text-[10px] font-black uppercase tracking-wide bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5">Fake</span>
                  )}
                </div>
                <SpendingChart
                  data={transactions.length === 0 ? DEMO_CHART_DATA : stats.chartData}
                  isDemo={transactions.length === 0}
                  onAddTransaction={() => setTxModal({ open: true, editing: null })}
                />
              </div>

              <div id="budget-section" className="scroll-mt-24 bg-card border-2 border-primary rounded-3xl p-5 shadow-cartoon hover:border-primary/20 transition-colors duration-300 mb-4">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" strokeWidth={2.5} />
                    <h2 className="text-lg font-black">Budget Progress</h2>
                    {budgets.length === 0 && (
                      <span className="text-[10px] font-black uppercase tracking-wide bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5">Fake</span>
                    )}
                  </div>
                  <Button
                    onClick={() => setBudgetModalOpen(true)}
                    variant="outline"
                    className="h-9 px-3 font-bold rounded-xl border-2 border-border"
                  >
                    <Sparkles className="w-4 h-4 mr-1" strokeWidth={2.5} /> Set Budgets
                  </Button>
                </div>
                <BudgetProgress spentByCategory={stats.spentByCategory} budgets={budgets.length === 0 ? DEMO_BUDGETS : budgets} />
              </div>

              <div id="goals-section" className="scroll-mt-24 bg-card border-2 border-primary rounded-3xl p-5 shadow-cartoon">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-primary" strokeWidth={2.5} />
                    <h2 className="text-base sm:text-lg font-black">Savings Goals</h2>
                    <span className="text-xs sm:text-sm font-bold text-muted-foreground">· {formatCurrency(stats.savings)} saved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isPremium && (
                      <span className="text-xs font-bold text-muted-foreground hidden sm:block">
                        {goals.length}/5 goals
                      </span>
                    )}
                    <Button
                      onClick={handleNewGoal}
                      className="h-9 px-3 font-bold rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1" strokeWidth={2.5} /> Add Goal
                    </Button>
                  </div>
                </div>
                {!isPremium && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="flex items-center gap-2 mb-3"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-muted-foreground bg-muted/70 border-2 border-border rounded-full px-3 py-1 shadow-cartoon">
                      <Target className="w-3 h-3 text-primary" strokeWidth={2.5} />
                      Goals: {goals.length}/5 <span className="text-muted-foreground/70 font-bold">(Free)</span>
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setPremiumModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-black text-primary bg-primary/10 border-2 border-primary/30 rounded-full px-3 py-1 hover:bg-primary/15 hover:border-primary/50 transition-colors shadow-cartoon"
                    >
                      <Gem className="w-3 h-3" strokeWidth={2.5} />
                      Upgrade
                    </motion.button>
                  </motion.div>
                )}
                {goals.length === 0 ? (
                  <div className="relative max-w-sm">
                    <span className="absolute -top-2 right-2 z-10 text-[10px] font-black uppercase tracking-wide bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5">Fake</span>
                    <SavingsGoalCard
                      goal={DEMO_GOAL}
                      onContribute={() => handleNewGoal()}
                      onDelete={() => handleNewGoal()}
                    />
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals.map((g) => (
                      <SavingsGoalCard
                        key={g.id}
                        goal={g}
                        onContribute={(goal) => setContributeModal({ open: true, goal })}
                        onDelete={handleDeleteGoal}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Loans */}
            <section className="animate-fade-up" style={{ animationDelay: '0.35s' }}>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <HandCoins className="w-5 h-5 text-primary" strokeWidth={2.5} />
                  <h2 className="text-base sm:text-lg font-black">Loans</h2>
                  {!isPremium && (
                    <span className="text-xs font-bold text-muted-foreground">· interest tracking is Pro</span>
                  )}
                </div>
                <Button
                  onClick={() => setLoanModal({ open: true, editing: null })}
                  className="h-9 px-3 font-bold rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-1" strokeWidth={2.5} /> Add Loan
                </Button>
              </div>
              {loans.length === 0 ? (
                <div className="bg-muted border-2 border-primary dark:bg-card rounded-3xl p-6 sm:p-8 text-center">
                  <EmptyStateIcon icon={HandCoins} size="lg" />
                  <p className="font-bold">No loans tracked yet</p>
                  <p className="text-sm text-muted-foreground font-semibold mt-1">Track money you borrowed or lent — add interest with Pro.</p>
                  <Button onClick={() => setLoanModal({ open: true, editing: null })} className="mt-4 h-11 font-bold rounded-2xl">
                    <HandCoins className="w-4 h-4 mr-1" strokeWidth={2.5} /> Add your first loan
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loans.map((l) => (
                    <LoanCard
                      key={l.id}
                      loan={l}
                      isPremium={isPremium}
                      onEdit={(loan) => setLoanModal({ open: true, editing: loan })}
                      onDelete={handleDeleteLoan}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Bill Reminders */}
            <BillRemindersSection
              isPremium={isPremium}
              onUpgradeClick={() => setPremiumModalOpen(true)}
              onBillPaid={handleBillPaid}
            />

            {/* Recent transactions */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="lg:col-span-2 bg-card border-2 border-primary rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-cartoon hover:border-primary/20 transition-colors duration-300">
                <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" strokeWidth={2.5} />
                    <h2 className="text-sm sm:text-lg font-black">Recent Transactions</h2>
                  </div>
                  <Button
                    onClick={() => setTxModal({ open: true, editing: null })}
                    className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" strokeWidth={2.5} /> Add
                  </Button>
                </div>
                <TransactionList
                  transactions={recentTransactions}
                  allTransactions={transactions}
                  onEdit={(t) => setTxModal({ open: true, editing: t })}
                  onDelete={handleDeleteTransaction}
                  onAddTransaction={() => setTxModal({ open: true, editing: null })}
                  emptyMessage="Your transactions will show up here"
                />
              </div>

              <div className="bg-card border-2 border-primary rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-cartoon hover:border-primary transition-colors duration-300">
                <h2 className="text-sm sm:text-lg font-black mb-2 sm:mb-3">This Month</h2>
                <div className="space-y-1.5 sm:space-y-3">
                  <MiniStat label="Income" value={formatCurrency(stats.income)} color="text-success" />
                  <MiniStat label="Expenses" value={formatCurrency(stats.expenses)} color="text-destructive" />
                  <MiniStat label="Net" value={formatCurrency(stats.income - stats.expenses, { sign: true })} color={stats.income - stats.expenses >= 0 ? "text-success" : "text-destructive"} />
                  <div className="pt-2 sm:pt-3 border-t-2 border-border">
                    <p className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground mb-0.5 sm:mb-1">Savings Rate</p>
                    <p className={`text-lg sm:text-2xl font-black tabular-nums ${stats.income - stats.expenses >= 0 ? "text-success" : "text-destructive"}`}>
                      {stats.income > 0 ? Math.round(((stats.income - stats.expenses) / stats.income) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {premiumActive && (
              <>
                {/* Advanced Insights */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary" strokeWidth={2.5} />
                    <h2 className="text-base sm:text-lg font-black">Advanced Insights</h2>
                    <span className="ml-1"><PremiumBadge /></span>
                  </div>
                  <AdvancedCharts transactions={transactions} goals={goals} />
                </section>

                {/* Detailed Spending History */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-primary" strokeWidth={2.5} />
                    <h2 className="text-base sm:text-lg font-black">Detailed Spending History</h2>
                  </div>
                  <DetailedHistory transactions={transactions} />
                </section>

                {/* Budgeting Tools & Insights */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Wrench className="w-5 h-5 text-primary" strokeWidth={2.5} />
                    <h2 className="text-base sm:text-lg font-black">Budgeting Tools & Insights</h2>
                  </div>
                  <PremiumTools transactions={transactions} budgets={budgets} goals={goals} currentMonth={currentMonth} />
                </section>
              </>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        open={txModal.open}
        editing={txModal.editing}
        goals={goals}
        onClose={() => setTxModal({ open: false, editing: null })}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
      />
      <SavingsGoalModal
        open={goalModal.open}
        editing={goalModal.editing}
        onClose={() => setGoalModal({ open: false, editing: null })}
        onSave={handleSaveGoal}
      />
      <ContributeModal
        open={contributeModal.open}
        goal={contributeModal.goal}
        goals={goals}
        onClose={() => setContributeModal({ open: false, goal: null })}
        onContribute={handleContribute}
      />
      <BudgetModal
        open={budgetModalOpen}
        budgets={budgets}
        monthKey={currentMonth}
        onClose={() => setBudgetModalOpen(false)}
        onSave={handleSaveBudgets}
      />
      <LoanModal
        open={loanModal.open}
        editing={loanModal.editing}
        isPremium={isPremium}
        onClose={() => setLoanModal({ open: false, editing: null })}
        onSave={handleSaveLoan}
        onDelete={handleDeleteLoan}
      />
      <PremiumModal open={premiumModalOpen} onClose={() => setPremiumModalOpen(false)} />
      <SettingsModal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
      <ReviewPrompt />
      <CompleteProfileModal open={showProfilePrompt} onDone={handleProfileComplete} />

      <footer className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Budgey - Fun & Simple Budgeting &copy; {new Date().getFullYear()} &middot;{" "}
          <Link to="/privacy" className="hover:text-primary underline-offset-2 hover:underline">Privacy Policy</Link>
          {" &middot; "}
          <Link to="/terms-of-service" className="hover:text-primary underline-offset-2 hover:underline">Terms of Service</Link>
        </p>
      </footer>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs sm:text-sm font-bold text-muted-foreground">{label}</span>
      <span className={`text-sm sm:text-base font-black tabular-nums ${color}`}>{value}</span>
    </div>
  );
}