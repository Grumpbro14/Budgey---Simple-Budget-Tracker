import React from "react";
import { motion } from "framer-motion";

function SkeletonCard({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="bg-card border-2 border-border rounded-3xl p-4 sm:p-5 shadow-cartoon"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded-full bg-muted shimmer" />
          <div className="h-7 w-28 rounded-full bg-muted shimmer" />
          <div className="h-3 w-16 rounded-full bg-muted/60 shimmer" />
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-muted shimmer" />
      </div>
    </motion.div>
  );
}

function SkeletonPanel({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="bg-card border-2 border-border rounded-3xl p-4 sm:p-5 shadow-cartoon"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded-lg bg-muted shimmer" />
        <div className="h-4 w-32 rounded-full bg-muted shimmer" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full rounded-full bg-muted shimmer" />
        <div className="h-3 w-3/4 rounded-full bg-muted/70 shimmer" />
        <div className="h-3 w-5/6 rounded-full bg-muted/50 shimmer" />
      </div>
    </motion.div>
  );
}

function SkeletonGrid({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="bg-card border-2 border-border rounded-3xl p-4 sm:p-5 shadow-cartoon"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded-lg bg-muted shimmer" />
        <div className="h-4 w-32 rounded-full bg-muted shimmer" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border-2 border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-muted shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded-full bg-muted shimmer" />
                <div className="h-2.5 w-14 rounded-full bg-muted/60 shimmer" />
              </div>
            </div>
            <div className="h-3 w-full rounded-full bg-muted/50 shimmer" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SkeletonCard delay={0} />
        <SkeletonCard delay={0.05} />
        <SkeletonCard delay={0.1} />
        <SkeletonCard delay={0.15} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <SkeletonPanel delay={0.2} />
        <SkeletonPanel delay={0.25} />
      </div>
      <SkeletonGrid delay={0.3} />
    </div>
  );
}