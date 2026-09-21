import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Loader2, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/ThemeContext";
import { celebrate } from "@/lib/celebrate";

export default function PremiumSuccess() {
  const navigate = useNavigate();
  const { refreshPremium } = useTheme();
  const [status, setStatus] = useState("checking"); // checking | confirmed | timeout

  const poll = useCallback(async () => {
    let attempts = 0;
    const tick = async () => {
      const premium = await refreshPremium();
      attempts++;
      if (premium) {
        setStatus("confirmed");
        return;
      }
      if (attempts < 15) {
        setTimeout(tick, 2500);
      } else {
        setStatus("timeout");
      }
    };
    tick();
  }, [refreshPremium]);

  useEffect(() => {
    poll();
  }, [poll]);

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="max-w-md w-full bg-card border-2 border-border rounded-3xl p-6 sm:p-8 shadow-cartoon text-center"
      >
        {status === "checking" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black mb-2">Confirming your purchase…</h1>
            <p className="text-muted-foreground font-semibold">
              We're verifying your payment with Base44 Payments. This only takes a moment.
            </p>
          </>
        )}

        {status === "confirmed" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center mb-4 shadow-pop"
            >
              <Sparkles className="w-8 h-8" strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-2xl font-black mb-2">Welcome to Budgey Pro!</h1>
            <p className="text-muted-foreground font-semibold mb-6">
              {celebrate("Pro unlocked — your subscription is active!")} All advanced charts,
              themes, and tools are yours.
            </p>
            <Button onClick={() => navigate("/")} className="h-12 px-6 font-bold rounded-2xl shadow-cartoon">
              <HomeIcon className="w-5 h-5 mr-2" strokeWidth={2.5} />
              Go to my dashboard
            </Button>
          </>
        )}

        {status === "timeout" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-warning/15 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-warning" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black mb-2">Payment received!</h1>
            <p className="text-muted-foreground font-semibold mb-6">
              Your payment went through, but it's taking a moment to confirm on our end. Head back
              to your dashboard — your Pro features will appear shortly.
            </p>
            <Button onClick={() => navigate("/")} className="h-12 px-6 font-bold rounded-2xl shadow-cartoon">
              <HomeIcon className="w-5 h-5 mr-2" strokeWidth={2.5} />
              Go to my dashboard
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}