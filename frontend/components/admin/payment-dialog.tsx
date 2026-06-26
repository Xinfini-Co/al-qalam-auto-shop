"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JobWithRelations, PaymentMethod } from "@shared";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { METHOD_OPTIONS } from "@/lib/constants";
import { formatAED } from "@/lib/utils";

export function PaymentDialog({
  open,
  onOpenChange,
  job,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  job: JobWithRelations;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setAmount(job.totals.balance > 0 ? String(job.totals.balance) : "");
      setMethod("CASH");
      setNote("");
    }
  }, [open, job.totals.balance]);

  const mutation = useMutation({
    mutationFn: () =>
      api.addPayment({ jobId: job.id, amount: Number(amount), method, note: note.trim() || undefined }),
    onSuccess: () => {
      qc.invalidateQueries();
      toast({ title: "Payment recorded", variant: "success" });
      onOpenChange(false);
    },
    onError: (e: Error) => toast({ title: "Couldn't record payment", description: e.message, variant: "error" }),
  });

  const value = Number(amount) || 0;
  const valid = value > 0 && value <= job.totals.balance + 0.001;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Record payment · No. {job.jobNo}</DialogTitle>
        <DialogDescription>
          Remaining balance: <span className="font-medium text-danger">{formatAED(job.totals.balance)}</span>
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => { e.preventDefault(); if (valid) mutation.mutate(); }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="amt">Amount (Dhs)</Label>
            <Input id="amt" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pm">Method</Label>
            <Select id="pm" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} options={METHOD_OPTIONS} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[job.totals.balance, job.totals.balance / 2].map((v, i) => (
            v > 0 && (
              <button key={i} type="button" onClick={() => setAmount(String(Math.round(v * 100) / 100))} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent">
                {i === 0 ? "Full balance" : "Half"} · {formatAED(Math.round(v * 100) / 100)}
              </button>
            )
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea id="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {value > job.totals.balance + 0.001 && (
          <p className="text-xs text-danger">Amount exceeds the remaining balance.</p>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" variant="brand" disabled={!valid || mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Record payment"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
