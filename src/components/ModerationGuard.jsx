import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function ModerationGuard({ children }) {
  const { logout } = useAuth();
  const [state, setState] = useState("checking");
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("moderation-check");
        const data = res?.data || {};
        if (cancelled) return;
        if (data.blocked) { setInfo(data); setState("blocked"); }
        else setState("ok");
      } catch (e) {
        // Fail open — never lock a user out due to a function error.
        setState("ok");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (state === "checking") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (state === "blocked") {
    const isBan = info?.type === "ban";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-black">{isBan ? "Account banned" : "Account suspended"}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {info?.reason || "Your account has been restricted for a Privacy Policy or Terms of Service violation."}
          </p>
          {!isBan && info?.until && (
            <p className="text-sm font-bold mt-2">You can log back in after {new Date(info.until).toLocaleDateString()}.</p>
          )}
          <p className="text-xs text-muted-foreground mt-3">Questions? Contact budgieapp.support@gmail.com</p>
          <Button onClick={() => logout()} variant="outline" className="mt-5">Sign out</Button>
        </div>
      </div>
    );
  }

  return children;
}