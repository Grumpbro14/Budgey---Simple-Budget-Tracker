import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Gem, Check, Palette, Target, BarChart3, History, Bell, HandCoins, Sparkles, Loader2, Crown, Calendar, Infinity as InfinityIcon
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/lib/ThemeContext";
import ThemePicker from "./ThemePicker";

const BENEFITS = [
  { icon: Palette, text: "Unlock custom color themes & light mode" },
  { icon: Target, text: "Unlimited savings goals (free limited to 5)" },
  { icon: BarChart3, text: "Advanced charts & insights - see where your money really goes" },
  { icon: History, text: "Full transaction history with search & filters" },
  { icon: Bell, text: "Bill alerts - get notified 1 day before your bill is due (app + email) - never pay a late fee again" },
  { icon: HandCoins, text: "Loan interest tracking" },
  { icon: Sparkles, text: "Budgey Pro experience" }
];

export default function PremiumModal({ open, onClose }) {
  const { isPremium, premiumModeEnabled, setPremiumModeEnabled, refreshPremium, totalPaid, isProLifetime } = useTheme();
  const { toast } = useToast();
  const [checkingOut, setCheckingOut] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("installment"); // "installment" | "lifetime"
  const [restoring, setRestoring] = useState(false);

  const handleUpgrade = async () => {
    setCheckingOut(true);
    try {
      const res = await base44.functions.invoke("create-checkout", {
        productId: selectedPlan === "lifetime" ? "budgie-premium-lifetime" : "budgey_5",
        purchaseType: selectedPlan,
      });
      if (res?.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e) {
      setCheckingOut(false);
      toast({
        title: "Checkout couldn't start",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const premium = await refreshPremium();
      if (premium) {
        toast({ title: "Pro restored!", description: "Welcome back to Budgey Pro.", variant: "default" });
        onClose();
      } else {
        toast({ title: "No purchase found", description: "If you bought Pro, make sure you're signed in to the same account.", variant: "default" });
      }
    } catch (e) {
      toast({ title: "Couldn't restore", description: "Please try again.", variant: "destructive" });
    } finally {
      setRestoring(false);
    }
  };

  const planOptions = [
    {
      id: "installment",
      icon: Calendar,
      label: "Installment",
      price: "$5",
      unit: "/mo",
      tagline: "4 payments, then free forever",
      description: "$5/month for 4 months ($20 total). After that, Pro is yours permanently — never pay again.",
    },
    {
      id: "lifetime",
      icon: InfinityIcon,
      label: "Lifetime",
      price: "$20",
      unit: " once",
      tagline: "Pay once, keep it forever",
      description: "One payment of $20 and you unlock Budgey Pro permanently. No recurring charges, ever.",
    },
  ];

  const showProgress = !isProLifetime && totalPaid > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-3xl border-2 border-border p-0">
        {/* Hero header */}
        <div className="relative bg-gradient-to-br from-primary to-accent text-white p-6 text-center rounded-t-3xl">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-3 shadow-pop"
          >
            <Gem className="w-8 h-8" strokeWidth={2.5} />
          </motion.div>
          <DialogTitle className="text-2xl font-black tracking-tight">Budgey Pro</DialogTitle>
          {!isPremium && (
            <p className="font-bold text-white/90 text-sm mt-2">Choose your plan</p>
          )}
        </div>

        <div className="p-6 pt-4">
          {isPremium ? (
            /* ---- Already owns Pro ---- */
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 justify-center text-success">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center"
                >
                  <Check className="w-5 h-5" strokeWidth={3} />
                </motion.div>
                <span className="text-lg font-black">
                  {isProLifetime ? "You own Budgey Pro — Forever" : "You have Budgey Pro"}
                </span>
              </div>
              <p className="text-center text-sm text-muted-foreground font-semibold -mt-2">
                {isProLifetime
                  ? "Pro is permanently unlocked — enjoy it on every device."
                  : "Your Pro is active — keep it going or pay it off to unlock forever."}
              </p>

              {showProgress && (
                <div className="bg-muted rounded-2xl p-4 border-2 border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm">Progress to Lifetime</span>
                    <span className="font-black text-sm text-primary">${totalPaid} / $20</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (totalPaid / 20) * 100)}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold mt-2">
                    {20 - totalPaid} more ${20 - totalPaid === 5 ? "payment" : "payments"} to unlock Pro forever.
                  </p>
                </div>
              )}

              {/* Pro Mode toggle */}
              <div className="flex items-center justify-between gap-3 bg-muted rounded-2xl p-4 border-2 border-border">
                <div>
                  <p className="font-black text-sm">Pro Mode</p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {premiumModeEnabled ? "Pro features are ON" : "Showing the free Budgey look"}
                  </p>
                </div>
                <Switch
                  checked={premiumModeEnabled}
                  onCheckedChange={(v) => setPremiumModeEnabled(v)}
                />
              </div>

              {/* Theme picker */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  <h3 className="font-black text-sm">Custom Theme</h3>
                </div>
                <ThemePicker />
              </div>

              <Button onClick={onClose} variant="outline" className="w-full h-11 font-bold rounded-2xl border-2 border-border">
                Done
              </Button>
            </div>
          ) : (
            /* ---- Upgrade offer ---- */
            <div className="space-y-5">
              <div className="space-y-2.5">
                {BENEFITS.map((b, i) => (
                  <motion.div
                    key={b.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <b.icon className="w-4 h-4 text-primary" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-sm">{b.text}</span>
                    <Check className="w-4 h-4 text-success ml-auto" strokeWidth={3} />
                  </motion.div>
                ))}
              </div>

              {/* Progress toward lifetime (installment plan) */}
              {showProgress && (
                <div className="bg-primary/5 rounded-2xl p-4 border-2 border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm">Progress: You've paid ${totalPaid} / $20</span>
                    <span className="font-black text-sm text-primary">{Math.round((totalPaid / 20) * 100)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (totalPaid / 20) * 100)}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold mt-2">
                    {20 - totalPaid} more ${20 - totalPaid === 5 ? "payment" : "payments"} of $5 to unlock Pro forever.
                  </p>
                </div>
              )}

              {/* Plan selector */}
              <div className="space-y-2.5">
                {planOptions.map((plan) => {
                  const selected = selectedPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full text-left rounded-2xl p-4 border-2 transition-all ${
                        selected
                          ? "border-primary bg-primary/5 shadow-cartoon"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <plan.icon className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-lg">{plan.price}</span>
                            <span className="font-bold text-sm text-muted-foreground">{plan.unit}</span>
                            <span className="font-bold text-sm ml-1">{plan.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-semibold">{plan.tagline}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-primary bg-primary" : "border-border"}`}>
                          {selected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold mt-2 pl-[3.25rem]">
                        {plan.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={checkingOut}
                className="w-full h-12 py-3.5 font-black text-base rounded-2xl shadow-cartoon"
              >
                {checkingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" strokeWidth={2.5} />
                    Starting checkout…
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" strokeWidth={2.5} />
                    {selectedPlan === "lifetime" ? "Unlock Pro Forever — $20" : "Pay $5 — Unlock Pro for 30 Days"}
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground font-semibold">
                Secure checkout via Base44 Payments.{" "}
                {selectedPlan === "lifetime"
                  ? "One payment, Pro forever."
                  : "After 4 payments of $5, Pro is yours for life."}
              </p>
              <div className="pt-1 text-center">
                <button
                  onClick={handleRestore}
                  disabled={restoring}
                  className="text-sm font-bold text-primary hover:underline disabled:opacity-50"
                >
                  {restoring ? "Restoring…" : "Restore Purchases"}
                </button>
                <p className="text-xs text-muted-foreground font-semibold mt-1">
                  Already purchased? Tap Restore
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}