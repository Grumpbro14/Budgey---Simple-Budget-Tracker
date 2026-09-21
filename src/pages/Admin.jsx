import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Gem, Ban, PauseCircle, Flag, Crown, ShieldAlert, Loader2, Lock } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [entitlements, setEntitlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [violationFor, setViolationFor] = useState(null);
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState(50);
  const [saving, setSaving] = useState(false);
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("budgie-admin-authed") === "1");
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [query, setQuery] = useState("");

  const isOwner = user?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, a, e] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.ModerationAction.list("-created_date", 200),
        base44.entities.PremiumEntitlement.list("-created_date", 200),
      ]);
      setUsers(u || []);
      setActions(a || []);
      setEntitlements(e || []);
    } catch (err) {
      toast({ title: "Couldn't load", description: "Make sure you're signed in as admin.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { if (isOwner) load(); }, [isOwner, load]);

  const premiumUserIds = new Set((entitlements || []).map((e) => e.user_id));

  const grantPremium = async (u) => {
    if (premiumUserIds.has(u.id)) { toast({ title: "Already has Pro", description: u.email }); return; }
    try {
      await base44.entities.PremiumEntitlement.create({
        user_id: u.id, purchased_at: new Date().toISOString(), is_permanent: true, plan_type: "lifetime",
      });
      await base44.entities.ModerationAction.create({
        user_id: u.id, user_email: u.email, user_name: u.full_name || u.email,
        type: "premium_grant", reason: "Pro granted by admin", active: true,
      });
      toast({ title: "Pro granted", description: u.email });
      load();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const suspend = async (u) => {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    try {
      await base44.entities.ModerationAction.create({
        user_id: u.id, user_email: u.email, user_name: u.full_name || u.email,
        type: "suspend", reason: "Suspended for 7 days (policy violation)", expires_at: expires, active: true,
      });
      toast({ title: "Suspended 7 days", description: `${u.email} locked out until ${new Date(expires).toLocaleDateString()}` });
      load();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const ban = async (u) => {
    try {
      await base44.entities.ModerationAction.create({
        user_id: u.id, user_email: u.email, user_name: u.full_name || u.email,
        type: "ban", reason: "Banned (policy violation)", active: true,
      });
      toast({ title: "Banned", description: u.email });
      load();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const submitPassword = async () => {
    setPwLoading(true); setPwError("");
    try {
      const res = await base44.functions.invoke("admin-auth", { password: pw });
      if (res?.data?.ok) {
        sessionStorage.setItem("budgie-admin-authed", "1");
        setAuthed(true);
      } else {
        setPwError(res?.data?.error || "Wrong password");
      }
    } catch (e) {
      setPwError(e?.response?.data?.error || "Couldn't verify password");
    } finally {
      setPwLoading(false);
    }
  };

  const submitViolation = async () => {
    if (!violationFor) return;
    setSaving(true);
    try {
      const res = await base44.functions.invoke("record-violation", {
        userId: violationFor.id,
        userEmail: violationFor.email,
        userName: violationFor.full_name || violationFor.email,
        reason: reason || "Policy violation",
        severity: Number(severity),
      });
      if (!res?.data?.ok) throw new Error(res?.data?.error || "Failed");
      toast({ title: "Violation recorded", description: "You've been emailed and it's in the feed." });
      setViolationFor(null); setReason(""); setSeverity(50);
      load();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-sm">
          <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-3" />
          <h1 className="text-xl font-black">Not authorized</h1>
          <p className="text-sm text-muted-foreground mt-1">This area is restricted to the app owner.</p>
          <Link to="/"><Button variant="outline" className="mt-4">Back to app</Button></Link>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-black text-center">Admin Panel Locked</h1>
          <p className="text-sm text-muted-foreground text-center mt-1 mb-4">Enter your panel password to continue.</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitPassword()}
            placeholder="Password"
            className="w-full rounded-xl border-2 border-border p-2.5 text-sm bg-background mb-2"
          />
          {pwError && <p className="text-xs text-destructive font-bold mb-2">{pwError}</p>}
          <Button onClick={submitPassword} disabled={pwLoading} className="w-full h-11 font-bold rounded-xl">
            {pwLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}Unlock
          </Button>
          <Link to="/"><Button variant="ghost" className="w-full mt-2">Back to app</Button></Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (u.email || "").toLowerCase().includes(q) || (u.full_name || "").toLowerCase().includes(q);
  });
  const violations = actions.filter((a) => a.type === "violation");
  const suspensions = actions.filter((a) => a.type === "suspend" && a.active !== false);
  const bans = actions.filter((a) => a.type === "ban" && a.active !== false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />Back to app
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Admin Control Panel</h1>
            <p className="text-sm text-muted-foreground">Moderation, Pro, and policy enforcement</p>
          </div>
        </div>

        {/* Notifications feed */}
        <section className="bg-card border-2 border-border rounded-3xl p-5 shadow-cartoon mb-6">
          <h2 className="font-black text-lg mb-3 flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary" strokeWidth={2.5} />Moderation Notifications
          </h2>
          {violations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No violations reported yet.</p>
          ) : (
            <div className="space-y-2">
              {violations.map((v) => (
                <div key={v.id} className="rounded-2xl border-2 border-border p-3 bg-muted/40">
                  <p className="text-sm font-bold">
                    {v.user_name || v.user_email} violated {v.reason} — it was {v.severity ?? 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(v.created_date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active restrictions */}
        <section className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-card border-2 border-border rounded-3xl p-5 shadow-cartoon">
            <h3 className="font-black mb-2 flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-warning" />Suspended ({suspensions.length})
            </h3>
            {suspensions.length === 0 ? (
              <p className="text-sm text-muted-foreground">None</p>
            ) : suspensions.map((s) => (
              <p key={s.id} className="text-sm">{s.user_email} — until {s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "—"}</p>
            ))}
          </div>
          <div className="bg-card border-2 border-border rounded-3xl p-5 shadow-cartoon">
            <h3 className="font-black mb-2 flex items-center gap-2">
              <Ban className="w-4 h-4 text-destructive" />Banned ({bans.length})
            </h3>
            {bans.length === 0 ? (
              <p className="text-sm text-muted-foreground">None</p>
            ) : bans.map((b) => (
              <p key={b.id} className="text-sm">{b.user_email}</p>
            ))}
          </div>
        </section>

        {/* Users */}
        <section className="bg-card border-2 border-border rounded-3xl p-5 shadow-cartoon">
          <h2 className="font-black text-lg mb-3">Users</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full mb-3 rounded-xl border-2 border-border p-2 text-sm bg-background"
          />
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => {
                const isPremiumUser = premiumUserIds.has(u.id);
                const isMe = u.id === user?.id;
                return (
                  <div key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border-2 border-border p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">
                        {u.full_name || u.email} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email} · {u.role}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isPremiumUser && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 rounded-full px-2 py-1">
                          <Crown className="w-3 h-3" />Has Pro
                        </span>
                      )}
                      <Button size="sm" variant="outline" onClick={() => grantPremium(u)}>
                        <Gem className="w-3.5 h-3.5 mr-1" />Grant Pro
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setViolationFor(u)}>
                        <Flag className="w-3.5 h-3.5 mr-1" />Report
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => suspend(u)} disabled={isMe}>
                        <PauseCircle className="w-3.5 h-3.5 mr-1" />Suspend 7d
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => ban(u)} disabled={isMe} className="border-destructive/30 text-destructive">
                        <Ban className="w-3.5 h-3.5 mr-1" />Ban
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Violation dialog */}
        <Dialog open={!!violationFor} onOpenChange={(o) => !o && setViolationFor(null)}>
          <DialogContent className="max-w-sm rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Flag className="w-5 h-5 text-primary" />Report a violation</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">For {violationFor?.email}</p>
            <label className="text-xs font-bold uppercase text-muted-foreground">What they did</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border-2 border-border p-2 text-sm bg-background"
              placeholder="e.g. abused the review system"
            />
            <label className="text-xs font-bold uppercase text-muted-foreground">How bad (0–100%)</label>
            <input type="range" min={0} max={100} value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full" />
            <p className="text-sm font-bold text-center">{severity}%</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViolationFor(null)}>Cancel</Button>
              <Button onClick={submitViolation} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Record violation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}