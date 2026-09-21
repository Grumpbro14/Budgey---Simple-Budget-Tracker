import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CompleteProfileModal({ open, onDone }) {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim()) {
      toast({ title: "First name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await base44.auth.updateMe({ name: fullName });
      toast({ title: "Nice to meet you!", description: "Your name has been saved." });
      onDone();
    } catch (e) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDone()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Let's get to know you
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          What's your name? We'll use it to personalize your Budgey experience.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="cp-firstName">First Name</Label>
            <Input
              id="cp-firstName"
              type="text"
              autoFocus
              placeholder="Alex"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 font-semibold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-lastName">Last Name</Label>
            <Input
              id="cp-lastName"
              type="text"
              placeholder="Johnson"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12 font-semibold"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>Skip for now</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}