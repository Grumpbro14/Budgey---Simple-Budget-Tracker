import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Receipt, Plus, Gem, Bell, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/lib/ThemeContext";
import EmptyStateIcon from "@/components/dashboard/EmptyStateIcon";
import BillReminderCard from "@/components/dashboard/BillReminderCard";
import BillReminderModal from "@/components/dashboard/BillReminderModal";
import { daysUntilDue } from "@/lib/billUtils";

const FREE_BILL_LIMIT = 1;

export default function BillRemindersSection({ onUpgradeClick, onBillPaid }) {
  const { isPremium } = useTheme();
  const { toast } = useToast();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [showPaid, setShowPaid] = useState(false);

  // Store the user's timezone on mount so the scheduled reminder processor can use it.
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      base44.auth.updateMe({ timezone: tz }).catch(() => {});
    } catch (e) {}
  }, []);

  const loadBills = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.BillReminder.list("-due_date", 500);
      setBills(list || []);
    } catch (e) {
      console.error("BillReminders load error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // Group bills into overdue / upcoming / paid.
  const { overdue, upcoming, paid } = useMemo(() => {
    const overdue = [];
    const upcoming = [];
    const paid = [];
    for (const b of bills) {
      if (b.status === "paid") {
        paid.push(b);
      } else if (daysUntilDue(b.due_date) < 0) {
        overdue.push(b);
      } else {
        upcoming.push(b);
      }
    }
    overdue.sort((a, b) => a.due_date.localeCompare(b.due_date));
    upcoming.sort((a, b) => a.due_date.localeCompare(b.due_date));
    paid.sort((a, b) => (b.updated_date || "").localeCompare(a.updated_date || ""));
    return { overdue, upcoming, paid };
  }, [bills]);

  const handleSave = async (data) => {
    try {
      if (modal.editing) {
        const res = await base44.functions.invoke("manage-bill-reminders", {
          action: "update",
          id: modal.editing.id,
          data,
        });
        setBills((prev) => prev.map((b) => (b.id === modal.editing.id ? res.data.bill : b)));
        toast({ title: "Bill updated!", description: "Your changes were saved." });
      } else {
        const res = await base44.functions.invoke("manage-bill-reminders", {
          action: "create",
          data,
        });
        setBills((prev) => [res.data.bill, ...prev]);
        toast({ title: "Bill added!", description: "Budgey will remind you before it's due." });
      }
      setModal({ open: false, editing: null });
    } catch (e) {
      toast({ title: "Couldn't save bill", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleDelete = async (bill) => {
    try {
      await base44.functions.invoke("manage-bill-reminders", { action: "delete", id: bill.id });
      setBills((prev) => prev.filter((b) => b.id !== bill.id));
      setModal({ open: false, editing: null });
      toast({ title: "Bill deleted", description: "The reminder was removed." });
    } catch (e) {
      toast({ title: "Couldn't delete bill", variant: "destructive" });
    }
  };

  const handleMarkPaid = async (bill) => {
    try {
      const res = await base44.functions.invoke("manage-bill-reminders", {
        action: "markPaid",
        id: bill.id,
      });
      setBills((prev) => prev.map((b) => (b.id === bill.id ? res.data.bill : b)));
      // Deduct the bill amount from the user's total balance via an expense transaction
      try {
        const txData = {
          type: "expense",
          amount: Number(bill.amount) || 0,
          category: "bills",
          description: `Bill: ${bill.name}`,
          date: new Date().toISOString().slice(0, 10),
        };
        const createdTx = await base44.entities.Transaction.create(txData);
        onBillPaid?.(createdTx);
      } catch (e) {
        console.error("Failed to log bill payment transaction", e);
      }
      toast({
        title: "Marked as paid!",
        description: bill.recurring && bill.recurring !== "none"
          ? "Next occurrence scheduled automatically."
          : "Nice work staying on top of your bills!",
      });
    } catch (e) {
      toast({ title: "Couldn't update bill", variant: "destructive" });
    }
  };

  // Free users: 1 bill max. Trying to add beyond the limit opens the Premium upgrade modal.
  const handleAddClick = () => {
    if (!isPremium && bills.length >= FREE_BILL_LIMIT) {
      onUpgradeClick();
      return;
    }
    setModal({ open: true, editing: null });
  };

  const hasBills = bills.length > 0;
  const atFreeLimit = !isPremium && bills.length >= FREE_BILL_LIMIT;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Receipt className="w-5 h-5 text-primary shrink-0" strokeWidth={2.5} />
          <h2 className="text-lg font-black truncate">Bill Reminders</h2>
          {hasBills && (
            <span className="text-sm font-bold text-muted-foreground">
              · {overdue.length + upcoming.length} active
            </span>
          )}
          {!isPremium && (
            <span className="text-xs font-bold text-muted-foreground">
              · {bills.length}/{FREE_BILL_LIMIT} free
            </span>
          )}
        </div>
        <Button onClick={handleAddClick} className="h-9 px-3 font-bold rounded-xl">
          <Plus className="w-4 h-4 mr-1" strokeWidth={2.5} /> Add Bill
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : !hasBills ? (
        /* Empty state — 0 bills (free or premium) */
        <div className="bg-card border-2 border-primary rounded-3xl p-6 sm:p-8 text-center overflow-hidden max-w-full">
          <EmptyStateIcon icon={Receipt} size="lg" />
          <p className="font-black text-lg">No bills yet!</p>
          <p className="text-sm text-muted-foreground font-semibold mt-1 max-w-xs mx-auto">
            Add your first bill and Budgey will help you remember when it's due.
          </p>
          <Button onClick={handleAddClick} className="mt-4 h-11 font-bold rounded-2xl">
            <Plus className="w-4 h-4 mr-1" strokeWidth={2.5} /> Add your first bill
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Overdue */}
          {overdue.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <AlertTriangle className="w-4 h-4 text-destructive" strokeWidth={2.5} />
                <h3 className="font-black text-sm text-destructive">Overdue</h3>
                <span className="text-xs font-bold text-muted-foreground">· {overdue.length}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {overdue.map((b) => (
                  <BillReminderCard
                    key={b.id}
                    bill={b}
                    onEdit={(bill) => setModal({ open: true, editing: bill })}
                    onDelete={handleDelete}
                    onMarkPaid={handleMarkPaid}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Bell className="w-4 h-4 text-primary" strokeWidth={2.5} />
                <h3 className="font-black text-sm">Upcoming</h3>
                <span className="text-xs font-bold text-muted-foreground">· {upcoming.length}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcoming.map((b) => (
                  <BillReminderCard
                    key={b.id}
                    bill={b}
                    onEdit={(bill) => setModal({ open: true, editing: bill })}
                    onDelete={handleDelete}
                    onMarkPaid={handleMarkPaid}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Paid (collapsible) */}
          {paid.length > 0 && (
            <div>
              <button
                onClick={() => setShowPaid(!showPaid)}
                className="flex items-center gap-2 mb-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={2.5} />
                <h3 className="font-black text-sm">Paid</h3>
                <span className="text-xs font-bold">· {paid.length}</span>
                {showPaid ? <ChevronUp className="w-4 h-4" strokeWidth={2.5} /> : <ChevronDown className="w-4 h-4" strokeWidth={2.5} />}
              </button>
              <AnimatePresence>
                {showPaid && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {paid.map((b) => (
                        <BillReminderCard
                          key={b.id}
                          bill={b}
                          onEdit={(bill) => setModal({ open: true, editing: bill })}
                          onDelete={handleDelete}
                          onMarkPaid={handleMarkPaid}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Free user has used their 1 free bill — show the Premium upsell */}
      {atFreeLimit && (
        <div className="mt-5 bg-card border-2 border-primary rounded-3xl p-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-pop"
          >
            <Gem className="w-7 h-7 text-white" strokeWidth={2.5} />
          </motion.div>
          <p className="font-black text-base mb-1">Bill Reminders are a Pro feature</p>
          <p className="text-sm text-muted-foreground font-semibold max-w-sm mx-auto mb-5">
            You've used your free bill reminder. Upgrade to Pro for unlimited bill reminders
            and automatic alerts before your bills are due — via email, in-app, or both.
          </p>
          <Button
            onClick={onUpgradeClick}
            className="h-11 px-5 font-bold rounded-2xl shadow-cartoon bg-gradient-to-r from-primary to-accent"
          >
            <Gem className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Upgrade to Pro
          </Button>
        </div>
      )}

      <BillReminderModal
        open={modal.open}
        editing={modal.editing}
        onClose={() => setModal({ open: false, editing: null })}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </section>
  );
}