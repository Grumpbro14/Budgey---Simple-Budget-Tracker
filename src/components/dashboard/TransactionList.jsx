import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight, Coins, Plus, Search, X } from "lucide-react";
import EmptyStateIcon from "@/components/dashboard/EmptyStateIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategory } from "@/lib/budgetCategories";
import { formatCurrency, formatDate } from "@/lib/format";

export default function TransactionList({ transactions, allTransactions, onEdit, onDelete, onAddTransaction, emptyMessage = "No transactions yet" }) {
  const [search, setSearch] = useState("");

  // When searching, look through the full set so older transactions are findable.
  const source = search ? (allTransactions && allTransactions.length ? allTransactions : transactions) : transactions;

  const filtered = useMemo(() => {
    if (!search) return source;
    const q = search.toLowerCase().trim();
    if (!q) return source;
    return source.filter((t) => {
      const cat = getCategory(t.category);
      return `${t.description || ""} ${cat.label}`.toLowerCase().includes(q);
    });
  }, [source, search]);

  const hasTransactions = transactions.length > 0;

  if (!hasTransactions && !search) {
    return (
      <div className="flex flex-col items-center text-center py-10 text-muted-foreground font-semibold">
        <EmptyStateIcon icon={Coins} />
        <p className="font-bold text-foreground">{emptyMessage}</p>
        <p className="text-sm mt-1">Add your first one to get started!</p>
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
    <div className="space-y-2.5 sm:space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category…"
          className="pl-9 pr-9 rounded-xl border-2 border-border font-semibold h-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground font-semibold text-center py-8">
          No transactions match "{search}"
        </p>
      ) : (
        <div className="space-y-2 sm:space-y-2.5">
          <AnimatePresence initial={false}>
            {filtered.map((t) => {
              const cat = getCategory(t.category);
              const isIncome = t.type === "income";
              if (t.isDemo) {
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="group flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border-2 border-border bg-card opacity-40"
                  >
                    <div
                      className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center relative"
                      style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                    >
                      <cat.icon className="w-5 h-5" strokeWidth={2.5} />
                      <span
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-card ${isIncome ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}
                      >
                        {isIncome ? <ArrowUpRight className="w-3 h-3" strokeWidth={3} /> : <ArrowDownLeft className="w-3 h-3" strokeWidth={3} />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold truncate">Fake {t.description}</p>
                        <span className="shrink-0 text-[10px] font-black uppercase tracking-wide bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5">Fake</span>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground">Add your first transaction to replace this</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black ${isIncome ? "text-success" : "text-foreground"}`}>
                        {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
                      </p>
                    </div>
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  whileHover={{ x: 3 }}
                  className="group flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border-2 border-border bg-card hover:border-primary/40 hover:bg-accent/5 cursor-pointer transition-all duration-200"
                  onClick={() => onEdit(t)}
                >
                  <div
                    className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center relative"
                    style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                  >
                    <cat.icon className="w-5 h-5" strokeWidth={2.5} />
                    <span
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-card ${isIncome ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}
                    >
                      {isIncome ? <ArrowUpRight className="w-3 h-3" strokeWidth={3} /> : <ArrowDownLeft className="w-3 h-3" strokeWidth={3} />}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold line-clamp-2 sm:truncate break-words">{t.description || cat.label}</p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {cat.label} · {formatDate(t.date)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-sm sm:text-base ${isIncome ? "text-success" : "text-foreground"}`}>
                      {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
                    </p>
                  </div>
                  <button
                    className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-muted text-muted-foreground"
                    onClick={(e) => { e.stopPropagation(); onEdit(t); }}
                    aria-label="Edit transaction"
                  >
                    <Pencil className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  {onDelete && (
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); onDelete(t); }}
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}