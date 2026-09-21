import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HandCoins, ArrowDownLeft, ArrowUpRight, Percent, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function LoanModal({ open, editing, isPremium, onClose, onSave, onDelete }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", principal: "", interest_rate: "", type: "borrowed", start_date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: editing?.name || "",
        principal: editing?.principal || "",
        interest_rate: editing?.interest_rate || "",
        type: editing?.type || "borrowed",
        start_date: editing?.start_date || new Date().toISOString().slice(0, 10),
        notes: editing?.notes || ""
      });
    }
  }, [open, editing]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (!form.principal || Number(form.principal) <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    if (!form.start_date) { toast({ title: "Start date required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await onSave({
        ...form,
        principal: Number(form.principal),
        interest_rate: isPremium ? Number(form.interest_rate) || 0 : 0
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <HandCoins className="w-5 h-5 text-primary" strokeWidth={2.5} />
            {editing ? "Edit Loan" : "Add Loan"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update("type", "borrowed")}
              className={`flex items-center justify-center gap-2 h-12 rounded-2xl border-2 font-bold transition-all ${
                form.type === "borrowed" ? "border-destructive bg-destructive/10 text-destructive" : "border-border text-muted-foreground"
              }`}
            >
              <ArrowDownLeft className="w-5 h-5" strokeWidth={2.5} /> I borrowed
            </button>
            <button
              type="button"
              onClick={() => update("type", "lent")}
              className={`flex items-center justify-center gap-2 h-12 rounded-2xl border-2 font-bold transition-all ${
                form.type === "lent" ? "border-success bg-success/10 text-success" : "border-border text-muted-foreground"
              }`}
            >
              <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} /> I lent out
            </button>
          </div>

          <div>
            <Label className="font-bold">Loan Name</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Car loan from Dad" className="rounded-xl mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-bold">Amount</Label>
              <Input type="number" step="0.01" value={form.principal} onChange={(e) => update("principal", e.target.value)} placeholder="0.00" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label className="font-bold">Start Date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} className="rounded-xl mt-1" />
            </div>
          </div>

          {/* Interest rate — Premium only */}
          {isPremium ? (
            <div>
              <Label className="font-bold flex items-center gap-1.5">
                <Percent className="w-4 h-4" /> Interest Rate (APR %)
              </Label>
              <Input type="number" step="0.01" value={form.interest_rate} onChange={(e) => update("interest_rate", e.target.value)} placeholder="e.g. 5.5" className="rounded-xl mt-1" />
              <p className="text-xs text-muted-foreground font-semibold mt-1">Interest accrues daily from the start date.</p>
            </div>
          ) : (
            <div className="bg-muted rounded-2xl p-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-bold text-sm">Interest rates are a Premium feature</p>
                <p className="text-xs text-muted-foreground font-semibold">Upgrade to track accruing interest on your loans.</p>
              </div>
            </div>
          )}

          <div>
            <Label className="font-bold">Notes (optional)</Label>
            <Input value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Repayment terms, due date, etc." className="rounded-xl mt-1" />
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-2">
          {editing && onDelete ? (
            <Button variant="destructive" onClick={() => { onDelete(editing); onClose(); }} className="rounded-2xl font-bold">
              Delete
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-2xl font-bold">Cancel</Button>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button onClick={handleSubmit} disabled={saving} className="rounded-2xl font-bold">
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Loan"}
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}