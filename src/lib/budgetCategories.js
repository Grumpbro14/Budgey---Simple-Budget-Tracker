import {
  Utensils, Car, ShoppingBag, Receipt, Film, HeartPulse, Wallet,
  Banknote, Gift, Briefcase, PiggyBank, Plane, Shield, House, GraduationCap, Sparkles
} from "lucide-react";

export const EXPENSE_CATEGORIES = [
  { id: "food", label: "Food & Dining", icon: Utensils, color: "#f97316" },
  { id: "transport", label: "Transport", icon: Car, color: "#ef4444" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, color: "#f59e0b" },
  { id: "bills", label: "Bills & Utilities", icon: Receipt, color: "#6b7280" },
  { id: "entertainment", label: "Entertainment", icon: Film, color: "#fb923c" },
  { id: "health", label: "Health", icon: HeartPulse, color: "#dc2626" },
  { id: "savings", label: "Savings", icon: PiggyBank, color: "#22c55e" },
  { id: "other_expense", label: "Other", icon: Wallet, color: "#9ca3af" }
];

export const INCOME_CATEGORIES = [
  { id: "salary", label: "Salary", icon: Banknote, color: "#22c55e" },
  { id: "freelance", label: "Freelance", icon: Briefcase, color: "#84cc16" },
  { id: "gift", label: "Gift", icon: Gift, color: "#f59e0b" },
  { id: "other_income", label: "Other Income", icon: Wallet, color: "#6b7280" }
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const GOAL_ICONS = [
  { id: "PiggyBank", label: "Piggy Bank", icon: PiggyBank },
  { id: "Plane", label: "Travel", icon: Plane },
  { id: "Shield", label: "Emergency", icon: Shield },
  { id: "House", label: "Home", icon: House },
  { id: "GraduationCap", label: "Education", icon: GraduationCap },
  { id: "Sparkles", label: "Treat", icon: Sparkles }
];

export const GOAL_COLORS = ["#f97316", "#ef4444", "#f59e0b", "#22c55e", "#fb923c", "#6b7280"];

export function getCategory(id) {
  return ALL_CATEGORIES.find((c) => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

export function getGoalIcon(name) {
  const found = GOAL_ICONS.find((g) => g.id === name);
  return found ? found.icon : PiggyBank;
}