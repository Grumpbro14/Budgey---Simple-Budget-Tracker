import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { formatDate } from "@/lib/billUtils";

export default function BillNotificationBell() {
  const { isPremium } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const loadNotifications = async () => {
    try {
      const list = await base44.entities.BillNotification.list("-created_date", 20);
      setNotifications(list || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (!isPremium) return;
    loadNotifications();
  }, [isPremium]);

  // Close dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = async () => {
    if (!open && unreadCount > 0) {
      // Mark all as read when opening.
      try {
        for (const n of notifications.filter((n) => !n.read)) {
          await base44.entities.BillNotification.update(n.id, { read: true });
        }
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (e) {}
    }
    setOpen(!open);
  };

  if (!isPremium) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-2xl border-2 border-border bg-card shadow-cartoon hover:bg-accent/10 transition-colors"
        aria-label="Bill reminders"
      >
        <Bell className="w-4 h-4" strokeWidth={2.5} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 top-10 sm:top-12 w-64 sm:w-72 max-h-80 overflow-y-auto bg-popover border-2 border-border rounded-2xl shadow-pop z-50"
          >
            <div className="p-3 border-b-2 border-border">
              <p className="font-black text-sm">Bill Reminders</p>
            </div>
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <BellOff className="w-6 h-6 mx-auto text-muted-foreground mb-2" strokeWidth={2} />
                <p className="text-xs text-muted-foreground font-semibold">
                  No reminders yet. Budgie will notify you here when a bill is due soon.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-accent/5 transition-colors">
                    <p className="text-xs font-bold leading-snug">{n.title}</p>
                    {n.due_date && (
                      <p className="text-[11px] text-muted-foreground font-semibold mt-1">
                        Due {formatDate(n.due_date)}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 font-semibold mt-1">
                      {formatDate(n.created_date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}