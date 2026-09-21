import React from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid px-4 py-10 relative overflow-hidden">
      {/* playful blobs */}
      <div className="pointer-events-none absolute -top-20 -left-16 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-success/10 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ rotate: -12, scale: 0.6 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary text-primary-foreground shadow-cartoon mb-4"
          >
            <Icon className="w-8 h-8" strokeWidth={2.5} aria-hidden="true" />
          </motion.div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wallet className="w-6 h-6 text-primary" strokeWidth={2.5} />
            <span className="text-2xl font-black tracking-tight">Budgey</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground text-balance">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-3xl shadow-cartoon border-2 border-border p-5 sm:p-7">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6 font-medium">{footer}</p>
        )}
      </motion.div>
    </div>
  );
}