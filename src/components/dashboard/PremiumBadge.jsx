import React from "react";
import { motion } from "framer-motion";
import { Gem } from "lucide-react";

export default function PremiumBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.03 }}
      className="flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold text-xs"
      title="You own Budgey Pro"
    >
      <Gem className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span className="tracking-tight whitespace-nowrap">Budgey Pro</span>
    </motion.div>
  );
}