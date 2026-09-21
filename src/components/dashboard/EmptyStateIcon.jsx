import React from "react";
import { motion } from "framer-motion";

const sizeMap = {
  sm: { box: "w-14 h-14", icon: "w-7 h-7" },
  md: { box: "w-16 h-16", icon: "w-8 h-8" },
  lg: { box: "w-20 h-20", icon: "w-10 h-10" }
};

export default function EmptyStateIcon({ icon: Icon, size = "md", className = "" }) {
  const s = sizeMap[size] || sizeMap.md;
  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      className={`${s.box} rounded-full bg-card border border-border dark:bg-primary/10 dark:border-primary/15 flex items-center justify-center mx-auto mb-3 ${className}`}
    >
      <Icon className={`${s.icon} text-primary`} strokeWidth={2.5} />
    </motion.div>
  );
}