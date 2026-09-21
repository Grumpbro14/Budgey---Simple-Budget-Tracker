import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Receipt, Pencil, Check, Trash2, Bell, BellOff, Mail, BellRing, Repeat, StickyNote
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { daysUntilDue, formatDueLabel, getUrgencyLevel, urgencyBadgeClasses, formatDate, recurringLabel } from "@/lib/billUtils";

export default function BillReminderCard({ bill, onEdit, onDelete, onMarkPaid, onToggleReminder }) {
  const days = daysUntilDue(bill.due_date);
  const urgency = getUrgencyLevel(days);
  const isOverdue = days < 0;
  const isPaid = bill.status === "paid";

  const MethodIcon = bill.reminder_method === "email" ? Mail : bill.reminder_method === "both" ? Bell : BellRing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className={`bg-card border-2 rounded-3xl p-4 shadow-cartoon ${
        isOverdue && !isPaid ? "border-destructive/30" : isPaid ? "border-border opacity-75" : "border-primary"
      }`}
    >
      {/* Top row: name + amount */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isOverdue && !isPaid ? "bg-destructive/10" : "bg-primary/10"
          }`}>
            <Receipt className={`w-4 h-4 ${isOverdue && !isPaid ? "text-destructive" : "text-primary"}`} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm truncate">{bill.name}</p>
            <p className="text-xs text-muted-foreground font-semibold">{formatDate(bill.due_date)}</p>
          </div>
        </div>
        <p className="font-black text-lg shrink-0 tabular-nums">{formatCurrency(Number(bill.amount))}</p>
      </div>

      {/* Countdown badge */}
      {!isPaid && (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full border-2 text-xs font-black ${urgencyBadgeClasses(urgency)}`}>
          {formatDueLabel(days)}
        </div>
      )}

      {/* Tags row */}
      <div className="flex items-center flex-wrap gap-1.5 mt-3">
        {bill.recurring && bill.recurring !== "none" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
            <Repeat className="w-3 h-3" strokeWidth={2.5} />
            {recurringLabel(bill.recurring)}
          </span>
        )}
        {isPaid && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success text-xs font-bold">
            <Check className="w-3 h-3" strokeWidth={3} /> Paid
          </span>
        )}
        {bill.reminder_enabled ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <MethodIcon className="w-3 h-3" strokeWidth={2.5} />
            {bill.reminder_method === "email" ? "Email" : bill.reminder_method === "both" ? "In-app+Email" : "In-app"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold">
            <BellOff className="w-3 h-3" strokeWidth={2.5} /> Off
          </span>
        )}
      </div>

      {/* Notes */}
      {bill.notes && (
        <p className="text-xs text-muted-foreground font-semibold mt-2 flex items-start gap-1">
          <StickyNote className="w-3 h-3 mt-0.5 shrink-0" strokeWidth={2.5} />
          {bill.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t-2 border-border">
        {!isPaid && (
          <Button
            onClick={() => onMarkPaid(bill)}
            variant="ghost"
            className="h-8 px-2.5 text-xs font-bold rounded-lg text-success hover:bg-success/10 hover:text-success"
          >
            <Check className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} /> Mark Paid
          </Button>
        )}
        <Button
          onClick={() => onEdit(bill)}
          variant="ghost"
          className="h-8 px-2.5 text-xs font-bold rounded-lg"
        >
          <Pencil className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} /> Edit
        </Button>
        <Button
          onClick={() => onDelete(bill)}
          variant="ghost"
          className="h-8 px-2.5 text-xs font-bold rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
        </Button>
      </div>
    </motion.div>
  );
}