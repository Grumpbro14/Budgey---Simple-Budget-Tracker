import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { HandCoins, ArrowDownLeft, ArrowUpRight, Trash2, Pencil, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

export default function LoanCard({ loan, isPremium, onEdit, onDelete }) {
  const isBorrowed = loan.type === "borrowed";

  const { accruedInterest, total } = useMemo(() => {
    const principal = Number(loan.principal) || 0;
    const rate = Number(loan.interest_rate) || 0;
    if (!rate || !loan.start_date) return { accruedInterest: 0, total: principal };
    const start = new Date(loan.start_date);
    const now = new Date();
    const days = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));
    const interest = principal * (rate / 100) * (days / 365);
    return { accruedInterest: interest, total: principal + interest };
  }, [loan.principal, loan.interest_rate, loan.start_date]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-card border-2 border-primary rounded-3xl p-5 shadow-cartoon overflow-hidden"
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-[0.07] ${isBorrowed ? "bg-destructive" : "bg-success"}`}
      />
      <div className="flex items-start justify-between gap-2 mb-3 relative">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isBorrowed ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
            }`}
          >
            {isBorrowed ? <ArrowDownLeft className="w-5 h-5" strokeWidth={2.5} /> : <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />}
          </div>
          <div>
            <p className="font-black leading-tight">{loan.name}</p>
            <p className="text-xs font-bold text-muted-foreground">
              {isBorrowed ? "You owe" : "Owed to you"} · since {new Date(loan.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button onClick={() => onEdit(loan)} variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button onClick={() => onDelete(loan)} variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 relative">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-muted-foreground">Principal</span>
          <span className="font-black text-lg tabular-nums">{formatCurrency(Number(loan.principal) || 0)}</span>
        </div>

        {isPremium && Number(loan.interest_rate) > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" /> {Number(loan.interest_rate).toFixed(2)}% APR
              </span>
              <span className="font-bold text-accent tabular-nums">+{formatCurrency(accruedInterest)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t-2 border-border">
              <span className="text-sm font-black">Total {isBorrowed ? "owed" : "receivable"}</span>
              <span className="font-black text-lg text-primary tabular-nums">{formatCurrency(total)}</span>
            </div>
          </>
        )}

        {!isPremium && (
          <p className="text-xs font-bold text-muted-foreground bg-muted rounded-xl px-3 py-2 flex items-center gap-1.5">
            <HandCoins className="w-3.5 h-3.5" /> Upgrade to Pro to track interest on this loan
          </p>
        )}

        {loan.notes && (
          <p className="text-xs text-muted-foreground font-semibold pt-1">{loan.notes}</p>
        )}
      </div>
    </motion.div>
  );
}