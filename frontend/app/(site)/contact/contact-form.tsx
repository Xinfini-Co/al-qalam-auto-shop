"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export function ContactForm() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    // Demo only — no message is actually sent.
    setTimeout(() => {
      setSending(false);
      (e.target as HTMLFormElement).reset();
      toast({
        title: "Message received",
        description: "Thanks! Our team will call you back shortly. (Demo — not actually sent.)",
        variant: "success",
      });
    }, 700);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Send us a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Your name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required placeholder="05X XXX XXXX" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="vehicle">Vehicle (optional)</Label>
        <Input id="vehicle" name="vehicle" placeholder="e.g. Toyota Hiace 2019" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">How can we help?</Label>
        <Textarea id="message" name="message" required rows={4} placeholder="Describe the issue or the service you need…" />
      </div>
      <Button type="submit" variant="brand" disabled={sending} className="w-full sm:w-auto">
        {sending ? "Sending…" : (<>Send message <Send className="size-4" /></>)}
      </Button>
    </form>
  );
}
