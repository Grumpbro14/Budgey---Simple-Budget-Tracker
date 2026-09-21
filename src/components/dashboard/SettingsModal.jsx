import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, BellOff, LogOut, Settings, BellRing, Trash2, Loader2, Mail, Star, Shield, ShieldAlert, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { APP_VERSION, SUPPORT_EMAIL, GOOGLE_PLAY_URL } from "@/lib/appInfo";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/billUtils";
import LoadingScreen from "@/components/LoadingScreen";

export default function SettingsModal({ open, onClose }) {
  const { theme, toggleTheme, isPremium } = useTheme();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => logout(), 100);
  };

  const isDark = theme === "dark";
  const isOwner = user?.role === "admin";

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await base44.functions.invoke("delete-account");
      setAlertOpen(false);
      // Wipe local preferences/data so the device is clean before returning to onboarding.
      try {
        localStorage.removeItem("budgie-theme");
        localStorage.removeItem("budgie-visit-count");
        localStorage.removeItem("budgie-visit-counted");
        localStorage.removeItem("budgie-review-dismissed");
        localStorage.removeItem("budgie-review-done");
      } catch (e) {}
      logout();
    } catch (e) {
      setDeleting(false);
      toast({ title: "Couldn't delete account", description: "Please try again.", variant: "destructive" });
    }
  };

  const loadNotifications = async () => {
    try {
      const list = await base44.entities.BillNotification.list("-created_date", 20);
      setNotifications(list || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (open && isPremium) {
      loadNotifications();
    }
  }, [open, isPremium]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      for (const n of notifications.filter((n) => !n.read)) {
        await base44.entities.BillNotification.update(n.id, { read: true });
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Settings className="w-5 h-5 text-primary" strokeWidth={2.5} />
            Settings
          </DialogTitle>
        </DialogHeader>

        {/* Appearance */}
        <div className="space-y-3">
          <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-cartoon">
            <p className="text-xs font-black uppercase text-muted-foreground mb-3">Appearance</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-secondary" : "bg-accent/15"}`}>
                  {isDark ? <Moon className="w-5 h-5 text-accent" strokeWidth={2.5} /> : <Sun className="w-5 h-5 text-accent" strokeWidth={2.5} />}
                </div>
                <div>
                  <p className="font-black text-sm">{isDark ? "Dark Mode" : "Light Mode"}</p>
                  <p className="text-xs text-muted-foreground font-semibold">Switch theme anytime</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`relative w-14 h-8 rounded-full border-2 border-border transition-colors ${isDark ? "bg-primary" : "bg-muted"}`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center ${isDark ? "left-7" : "left-0.5"}`}
                >
                  {isDark ? <Moon className="w-3 h-3 text-primary" strokeWidth={2.5} /> : <Sun className="w-3 h-3 text-accent" strokeWidth={2.5} />}
                </motion.span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          {isPremium && (
            <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-cartoon">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  <p className="text-xs font-black uppercase text-muted-foreground">Notifications</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {unreadCount > 0 && (
                <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  {unreadCount} new
                </div>
              )}
              {notifications.length === 0 ? (
                <div className="py-4 text-center">
                  <BellOff className="w-6 h-6 mx-auto text-muted-foreground mb-2" strokeWidth={2} />
                  <p className="text-xs text-muted-foreground font-semibold">
                    No reminders yet. Budgey will notify you here when a bill is due soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-2.5 rounded-xl border ${n.read ? "border-border bg-transparent" : "border-primary/30 bg-primary/5"}`}>
                      <p className="text-xs font-bold leading-snug">{n.title}</p>
                      {n.due_date && (
                        <p className="text-[11px] text-muted-foreground font-semibold mt-1">
                          Due {formatDate(n.due_date)}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/70 font-semibold mt-0.5">
                        {formatDate(n.created_date)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Support */}
          <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-cartoon">
            <p className="text-xs font-black uppercase text-muted-foreground mb-3">Support</p>
            <div className="space-y-2">
              <Link to="/privacy" onClick={() => onClose()} className="flex items-center gap-3 w-full text-left">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-primary" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-sm">Privacy Policy</p>
                  <p className="text-xs text-muted-foreground font-semibold">How we handle your data</p>
                </div>
              </Link>
              <Link to="/terms-of-service" onClick={() => onClose()} className="flex items-center gap-3 w-full text-left">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-sm">Terms of Service</p>
                  <p className="text-xs text-muted-foreground font-semibold">The rules of using Budgey</p>
                </div>
              </Link>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 w-full text-left">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-sm">Contact Support</p>
                  <p className="text-xs text-muted-foreground font-semibold">{SUPPORT_EMAIL}</p>
                </div>
              </a>
              <button onClick={() => window.open(GOOGLE_PLAY_URL, "_blank", "noopener,noreferrer")} className="flex items-center gap-3 w-full text-left">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-primary" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-sm">Rate App</p>
                  <p className="text-xs text-muted-foreground font-semibold">On Google Play</p>
                </div>
              </button>
              {isOwner && (
                <Link to="/admin" onClick={() => onClose()} className="flex items-center gap-3 w-full text-left">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-black text-sm">Admin Panel</p>
                    <p className="text-xs text-muted-foreground font-semibold">Moderation & Pro</p>
                  </div>
                </Link>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-semibold">Version</span>
              <span className="text-xs font-black">{APP_VERSION}</span>
            </div>
          </div>

          {/* Account */}
          <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-cartoon">
            <p className="text-xs font-black uppercase text-muted-foreground mb-3">Account</p>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-11 font-bold rounded-2xl border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" strokeWidth={2.5} />
              Log Out
            </Button>
            <div className="my-3 border-t border-border" />
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
              <Button
                onClick={() => setAlertOpen(true)}
                variant="outline"
                disabled={deleting}
                className="w-full h-11 font-bold rounded-2xl border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2.5} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" strokeWidth={2.5} />
                    Delete Account
                  </>
                )}
              </Button>
              <AlertDialogContent className="max-w-sm rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-lg font-black">
                    <Trash2 className="w-5 h-5 text-destructive" strokeWidth={2.5} />
                    Delete everything?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    This cannot be undone. All your transactions, goals, budgets, loans, bills, and Pro access will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="rounded-xl" disabled={deleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2.5} />
                        Deleting...
                      </>
                    ) : (
                      "Yes, delete everything"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {loggingOut && <LoadingScreen message="Logging out..." />}
      </DialogContent>
    </Dialog>
  );
}