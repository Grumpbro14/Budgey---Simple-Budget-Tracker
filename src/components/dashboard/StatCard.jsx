import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, accent = "primary", subtitle, delay = 0, children }) {
  const iconColor = {
    primary: "text-primary",
    accent: "text-accent",
    success: "text-success",
    warning: "text-warning",
    expense: "text-destructive"
  };
  const darkGradient = {
    primary: "sm:dark:bg-gradient-to-br sm:dark:from-primary sm:dark:to-primary/85 sm:dark:text-primary-foreground",
    accent: "sm:dark:bg-gradient-to-br sm:dark:from-accent sm:dark:to-accent/85 sm:dark:text-accent-foreground",
    success: "sm:dark:bg-gradient-to-br sm:dark:from-success sm:dark:to-success/85 sm:dark:text-success-foreground",
    warning: "sm:dark:bg-gradient-to-br sm:dark:from-warning sm:dark:to-warning/85 sm:dark:text-warning-foreground",
    expense: "sm:dark:bg-gradient-to-br sm:dark:from-destructive sm:dark:to-destructive/85 sm:dark:text-destructive-foreground"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 20, delay }}
      whileHover={{ y: -2 }}
      className="relative bg-card border-2 border-primary rounded-3xl p-3 sm:p-5 shadow-cartoon hover:shadow-cartoon-hover hover:border-primary cursor-default overflow-hidden group transition-shadow duration-300"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full bg-primary/5 group-hover:bg-primary/12 transition-all duration-500 group-hover:scale-110" />
      <div className="flex items-start justify-between gap-2 sm:gap-3 relative">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-base sm:text-3xl font-black mt-1 sm:mt-1.5 text-balance tabular-nums leading-tight break-all sm:break-normal sm:truncate">{value}</p>
          {subtitle && <p className="text-xs font-semibold text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className={`shrink-0 w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border border-primary/30 bg-transparent sm:bg-muted sm:border-border ${iconColor[accent]} ${darkGradient[accent]} sm:dark:border-transparent`}
        >
          <Icon className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
        </motion.div>
      </div>
      {children}
    </motion.div>
  );
}