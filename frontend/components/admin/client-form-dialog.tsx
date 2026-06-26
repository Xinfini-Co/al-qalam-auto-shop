"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Client } from "@shared";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  client?: Client | null;
};

export function ClientFormDialog({ open, onOpenChange, client }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const editing = !!client;

  const [form, setForm] = useState({ name: "", phone1: "", phone2: "", phone3: "", address: "" });

  useEffect(() => {
    if (open) {
      setForm({
        name: client?.name ?? "",
        phone1: client?.phone1 ?? "",
        phone2: client?.phone2 ?? "",
        phone3: client?.phone3 ?? "",
        address: client?.address ?? "",
      });
    }
  }, [open, client]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        phone1: form.phone1.trim(),
        phone2: form.phone2.trim() || null,
        phone3: form.phone3.trim() || null,
        address: form.address.trim() || null,
      };
      return editing ? api.updateClient(client!.id, payload) : api.createClient(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: editing ? "Client updated" : "Client added", variant: "success" });
      onOpenChange(false);
    },
    onError: (e: Error) => toast({ title: "Couldn't save", description: e.message, variant: "error" }),
  });

  const valid = form.name.trim() && form.phone1.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit client" : "Add client"}</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) mutation.mutate();
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="cname">Name *</Label>
          <Input id="cname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mohammed Al Falasi" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone1">Phone 1 *</Label>
            <Input id="phone1" value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} placeholder="055-XXXXXXX" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone2">Phone 2</Label>
            <Input id="phone2" value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone3">Phone 3</Label>
          <Input id="phone3" value={form.phone3} onChange={(e) => setForm({ ...form, phone3: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Area, Emirate" />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" variant="brand" disabled={!valid || mutation.isPending}>
            {mutation.isPending ? "Saving…" : editing ? "Save changes" : "Add client"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
