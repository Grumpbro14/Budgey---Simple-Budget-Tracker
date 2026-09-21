import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink } from "lucide-react";
import { GOOGLE_PLAY_URL, REVIEW_VISIT_THRESHOLD } from "@/lib/appInfo";

const VISITS_KEY = "budgie-visit-count";
const SESSION_KEY = "budgie-visit-counted";
const DISMISSED_KEY = "budgie-review-dismissed";
const DONE_KEY = "budgie-review-done";

export default function ReviewPrompt() {
  // Temporarily disabled — flip to true to re-enable.
  const ENABLED = false;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ENABLED) return;
    // Count one visit per tab load (not per remount).
    const countedThisSession = sessionStorage.getItem(SESSION_KEY) === "1";
    let visits = 0;
    try { visits = parseInt(localStorage.getItem(VISITS_KEY) || "0", 10) || 0; } catch (e) {}
    if (!countedThisSession) {
      visits += 1;
      try { localStorage.setItem(VISITS_KEY, String(visits)); } catch (e) {}
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
    }

    const dismissed = localStorage.getItem(DISMISSED_KEY) === "1";
    const done = localStorage.getItem(DONE_KEY) === "1";
    if (!dismissed && !done && visits >= REVIEW_VISIT_THRESHOLD) {
      const t = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleRate = () => {
    try { localStorage.setItem(DONE_KEY, "1"); } catch (e) {}
    window.open(GOOGLE_PLAY_URL, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleNever = () => {
    try { localStorage.setItem(DISMISSED_KEY, "1"); } catch (e) {}
    setOpen(false);
  };

  const handleOpenChange = (next) => {
    if (!next) {
      // Closed without a button (X / backdrop / esc) — treat as "maybe later":
      // reset the counter so it asks again after a few more visits.
      try { localStorage.setItem(VISITS_KEY, "0"); } catch (e) {}
    }
    setOpen(next);
  };

  if (!ENABLED) return null;
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl text-center">
        <DialogHeader className="items-center text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-2"
          >
            <Star className="w-8 h-8 text-white" strokeWidth={2.5} fill="currentColor" />
          </motion.div>
          <DialogTitle className="text-xl font-black">Enjoying Budgey?</DialogTitle>
          <DialogDescription className="text-sm">
            You've visited a few times — that must mean you're having fun! A quick rating on Google Play
            helps others find a simple, friendly way to budget.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-1 my-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 8, rotate: -20 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 300, damping: 16 }}
            >
              <Star className="w-7 h-7 text-primary" strokeWidth={2.5} fill="currentColor" />
            </motion.span>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleRate}
            className="w-full h-11 font-bold rounded-xl bg-gradient-to-r from-primary to-accent text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Rate on Google Play
          </Button>
          <div className="flex gap-2 w-full">
            <Button onClick={() => handleOpenChange(false)} variant="ghost" className="flex-1 h-10 font-bold rounded-xl">
              Maybe later
            </Button>
            <Button onClick={handleNever} variant="ghost" className="flex-1 h-10 font-bold rounded-xl text-muted-foreground">
              Never
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}