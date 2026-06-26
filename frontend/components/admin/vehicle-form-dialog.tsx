"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ClientWithStats, Vehicle } from "@shared";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  vehicle?: Vehicle | null;
  defaultClientId?: string;
};

export function VehicleFormDialog({ open, onOpenChange, vehicle, defaultClientId }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const editing = !!vehicle;

  const { data: clients } = useQuery({
    queryKey: ["clients", ""],
    queryFn: () => api.listClients("") as Promise<ClientWithStats[]>,
    enabled: open,
  });

  const [form, setForm] = useState({ clientId: "", plateNo: "", makeModel: "", color: "", year: "" });

  useEffect(() => {
    if (open) {
      setForm({
        clientId: vehicle?.clientId ?? defaultClientId ?? "",
        plateNo: vehicle?.plateNo ?? "",
        makeModel: vehicle?.makeModel ?? "",
        color: vehicle?.color ?? "",
        year: vehicle?.year ? String(vehicle.year) : "",
      });
    }
  }, [open, vehicle, defaultClientId]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        clientId: form.clientId,
        plateNo: form.plateNo.trim(),
        makeModel: form.makeModel.trim(),
        color: form.color.trim() || null,
        year: form.year ? Number(form.year) : null,
      };
      return editing ? api.updateVehicle(vehicle!.id, payload) : api.createVehicle(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client", form.clientId] });
      toast({ title: editing ? "Vehicle updated" : "Vehicle added", variant: "success" });
      onOpenChange(false);
    },
    onError: (e: Error) => toast({ title: "Couldn't save", description: e.message, variant: "error" }),
  });

  const valid = form.clientId && form.plateNo.trim() && form.makeModel.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) mutation.mutate();
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="vclient">Owner *</Label>
          <Select
            id="vclient"
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            placeholder="Select client"
            options={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))}
            disabled={!!defaultClientId && !editing}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="plate">Plate no *</Label>
            <Input id="plate" value={form.plateNo} onChange={(e) => setForm({ ...form, plateNo: e.target.value })} placeholder="e.g. 312 01" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="make">Make / model *</Label>
            <Input id="make" value={form.makeModel} onChange={(e) => setForm({ ...form, makeModel: e.target.value })} placeholder="e.g. Toyota Hiace" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="color">Color</Label>
            <Input id="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="e.g. White" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" min={1980} max={2030} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="e.g. 2019" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" variant="brand" disabled={!valid || mutation.isPending}>
            {mutation.isPending ? "Saving…" : editing ? "Save changes" : "Add vehicle"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
