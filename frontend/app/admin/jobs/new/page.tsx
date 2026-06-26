"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, UserPlus, Car, Loader2 } from "lucide-react";
import type {
  ClientWithStats,
  CreateJobInput,
  JobWithRelations,
  PaymentMethod,
  ServiceCategory,
  TransportType,
  VehicleWithClient,
} from "@shared";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  CATEGORY_OPTIONS,
  METHOD_OPTIONS,
  TRANSPORT_OPTIONS,
} from "@/lib/constants";
import { lineAmount, sumItems, round2 } from "@/lib/money";
import { formatAED, salutationFor } from "@/lib/utils";

type Row = { id: string; category: ServiceCategory; description: string; qty: string; rate: string };
const newRow = (): Row => ({ id: crypto.randomUUID(), category: "MECHANICAL", description: "", qty: "1", rate: "" });
const todayISO = () => new Date().toISOString().slice(0, 10);

export default function NewJobPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  // reference data
  const { data: clients } = useQuery({ queryKey: ["clients", ""], queryFn: () => api.listClients("") as Promise<ClientWithStats[]> });
  const { data: vehicles } = useQuery({ queryKey: ["vehicles", ""], queryFn: () => api.listVehicles("") as Promise<VehicleWithClient[]> });
  const { data: jobs } = useQuery({ queryKey: ["jobs", "", "ALL"], queryFn: () => api.listJobs({}) as Promise<JobWithRelations[]> });

  const nextNo = useMemo(() => {
    const max = (jobs ?? []).reduce((m, j) => Math.max(m, parseInt(j.jobNo, 10) || 0), 0);
    return String(Math.max(max, 456) + 1).padStart(4, "0");
  }, [jobs]);

  // form state
  const [date, setDate] = useState(todayISO());
  const [transportType, setTransportType] = useState<TransportType>("SELF_DRIVE");
  const [mechanicName, setMechanicName] = useState("");
  const [promisedDate, setPromisedDate] = useState("");
  const [notes, setNotes] = useState("");

  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [clientId, setClientId] = useState("");
  const [newClient, setNewClient] = useState({ name: "", phone1: "", phone2: "" });

  const [vehicleMode, setVehicleMode] = useState<"existing" | "new">("existing");
  const [vehicleId, setVehicleId] = useState("");
  const [newVehicle, setNewVehicle] = useState({ plateNo: "", makeModel: "", color: "", year: "" });

  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("CASH");

  const clientVehicles = useMemo(
    () => (vehicles ?? []).filter((v) => v.client.id === clientId),
    [vehicles, clientId],
  );

  const selectedClientName =
    clientMode === "new" ? newClient.name : clients?.find((c) => c.id === clientId)?.name ?? "";

  const total = sumItems(rows.map((r) => ({ qty: Number(r.qty) || 0, rate: Number(r.rate) || 0 })));
  const received = round2(Number(payAmount) || 0);
  const balance = round2(Math.max(total - received, 0));

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function removeRow(id: string) {
    setRows((rs) => (rs.length === 1 ? rs : rs.filter((r) => r.id !== id)));
  }

  const create = useMutation({
    mutationFn: () => {
      const items = rows
        .filter((r) => r.description.trim() && Number(r.rate) > 0)
        .map((r) => ({
          category: r.category,
          description: r.description.trim(),
          qty: Number(r.qty) || 1,
          rate: Number(r.rate) || 0,
        }));

      const input: CreateJobInput = {
        date: new Date(date).toISOString(),
        transportType,
        mechanicName: mechanicName.trim() || undefined,
        promisedDate: promisedDate ? new Date(promisedDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
        items,
        ...(clientMode === "existing"
          ? { clientId }
          : { newClient: { name: newClient.name.trim(), phone1: newClient.phone1.trim(), phone2: newClient.phone2.trim() || undefined } }),
        ...(vehicleMode === "existing"
          ? { vehicleId }
          : {
              newVehicle: {
                plateNo: newVehicle.plateNo.trim(),
                makeModel: newVehicle.makeModel.trim(),
                color: newVehicle.color.trim() || undefined,
                year: newVehicle.year ? Number(newVehicle.year) : undefined,
              },
            }),
        ...(received > 0 ? { initialPayment: { amount: Math.min(received, total), method: payMethod } } : {}),
      };
      return api.createJob(input) as Promise<JobWithRelations>;
    },
    onSuccess: (job) => {
      qc.invalidateQueries();
      toast({ title: `Invoice No. ${job.jobNo} created`, variant: "success" });
      router.push(`/admin/jobs/${job.id}?print=1`);
    },
    onError: (e: Error) => toast({ title: "Couldn't save", description: e.message, variant: "error" }),
  });

  // validation
  const clientOk = clientMode === "existing" ? !!clientId : !!newClient.name.trim() && !!newClient.phone1.trim();
  const vehicleOk = vehicleMode === "existing" ? !!vehicleId : !!newVehicle.plateNo.trim() && !!newVehicle.makeModel.trim();
  const itemsOk = rows.some((r) => r.description.trim() && Number(r.rate) > 0);
  const canSave = clientOk && vehicleOk && itemsOk;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/jobs" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All jobs
      </Link>

      <PageHeader
        title="New estimate / invoice"
        description="Create a job that mirrors the shop's paper estimate."
        actions={
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Invoice</p>
            <p className="text-lg font-semibold text-gradient">No. {nextNo}</p>
          </div>
        }
      />

      <form
        onSubmit={(e) => { e.preventDefault(); if (canSave) create.mutate(); }}
        className="space-y-6"
      >
        {/* ---- Header details ---- */}
        <Card>
          <CardHeader><CardTitle>Job details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="promised">Promised date</Label>
              <Input id="promised" type="date" value={promisedDate} onChange={(e) => setPromisedDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transport">Transport type</Label>
              <Select id="transport" value={transportType} onChange={(e) => setTransportType(e.target.value as TransportType)} options={TRANSPORT_OPTIONS} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mechanic">Mechanic</Label>
              <Input id="mechanic" value={mechanicName} onChange={(e) => setMechanicName(e.target.value)} placeholder="Assigned to" />
            </div>
          </CardContent>
        </Card>

        {/* ---- Client + Vehicle ---- */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Client (Mr./M/s.)</CardTitle>
              <ModeToggle value={clientMode} onChange={(m) => setClientMode(m)} newLabel="New client" icon={UserPlus} />
            </CardHeader>
            <CardContent className="space-y-4">
              {clientMode === "existing" ? (
                <div className="space-y-1.5">
                  <Label>Select client</Label>
                  <Select
                    value={clientId}
                    onChange={(e) => { setClientId(e.target.value); setVehicleId(""); }}
                    placeholder="Choose a client"
                    options={(clients ?? []).map((c) => ({ value: c.id, label: `${c.name} · ${c.phone1}` }))}
                  />
                  {selectedClientName && (
                    <p className="pt-1 text-xs text-muted-foreground">
                      Invoice will read: <span className="font-medium text-foreground">{salutationFor(selectedClientName)} {selectedClientName}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Name *</Label>
                    <Input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} placeholder="Customer name" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Phone 1 *</Label>
                      <Input value={newClient.phone1} onChange={(e) => setNewClient({ ...newClient, phone1: e.target.value })} placeholder="05X-XXXXXXX" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone 2</Label>
                      <Input value={newClient.phone2} onChange={(e) => setNewClient({ ...newClient, phone2: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Vehicle</CardTitle>
              <ModeToggle value={vehicleMode} onChange={(m) => setVehicleMode(m)} newLabel="New vehicle" icon={Car} />
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicleMode === "existing" ? (
                <div className="space-y-1.5">
                  <Label>Select vehicle</Label>
                  <Select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    placeholder={clientMode === "existing" && !clientId ? "Choose a client first" : "Choose a vehicle"}
                    disabled={clientMode === "existing" && !clientId}
                    options={(clientMode === "existing" ? clientVehicles : (vehicles ?? [])).map((v) => ({
                      value: v.id,
                      label: `${v.makeModel} · ${v.plateNo}`,
                    }))}
                  />
                  {clientMode === "existing" && clientId && clientVehicles.length === 0 && (
                    <p className="pt-1 text-xs text-warning">This client has no vehicles — add one instead.</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Plate no *</Label>
                    <Input value={newVehicle.plateNo} onChange={(e) => setNewVehicle({ ...newVehicle, plateNo: e.target.value })} placeholder="e.g. 312 01" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Make / model *</Label>
                    <Input value={newVehicle.makeModel} onChange={(e) => setNewVehicle({ ...newVehicle, makeModel: e.target.value })} placeholder="e.g. Hiace" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Color</Label>
                    <Input value={newVehicle.color} onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Year</Label>
                    <Input type="number" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ---- Line items ---- */}
        <Card>
          <CardHeader><CardTitle>Line items</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="w-10 pb-2 text-left font-semibold">S.No</th>
                    <th className="pb-2 text-left font-semibold">Description</th>
                    <th className="w-40 pb-2 text-left font-semibold">Category</th>
                    <th className="w-20 pb-2 text-right font-semibold">Qty</th>
                    <th className="w-28 pb-2 text-right font-semibold">Rate (Dhs)</th>
                    <th className="w-32 pb-2 text-right font-semibold">Amount (Dhs)</th>
                    <th className="w-10 pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id} className="border-b border-border/60">
                      <td className="py-2 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 pr-2">
                        <Input value={r.description} onChange={(e) => updateRow(r.id, { description: e.target.value })} placeholder="e.g. Head light" className="h-9" />
                      </td>
                      <td className="py-2 pr-2">
                        <Select value={r.category} onChange={(e) => updateRow(r.id, { category: e.target.value as ServiceCategory })} options={CATEGORY_OPTIONS} className="h-9" />
                      </td>
                      <td className="py-2 pr-2">
                        <Input type="number" min={1} value={r.qty} onChange={(e) => updateRow(r.id, { qty: e.target.value })} className="h-9 text-right" />
                      </td>
                      <td className="py-2 pr-2">
                        <Input type="number" min={0} step="0.01" value={r.rate} onChange={(e) => updateRow(r.id, { rate: e.target.value })} className="h-9 text-right" placeholder="0.00" />
                      </td>
                      <td className="py-2 pr-2 text-right tabular-nums font-medium">
                        {lineAmount(Number(r.qty) || 0, Number(r.rate) || 0).toLocaleString("en-AE", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 text-right">
                        <Button type="button" variant="ghost" size="icon" className="size-8 text-danger hover:text-danger" onClick={() => removeRow(r.id)} disabled={rows.length === 1}>
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setRows((rs) => [...rs, newRow()])}>
                <Plus className="size-4" /> Add row
              </Button>
              <div className="flex items-center gap-3 rounded-xl bg-brand-gradient-soft px-5 py-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-semibold tabular-nums text-gradient">{formatAED(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---- Payment + notes ---- */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Payment received now</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="pay">Amount (Dhs)</Label>
                  <Input id="pay" type="number" min={0} step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="method">Method</Label>
                  <Select id="method" value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)} options={METHOD_OPTIONS} />
                </div>
              </div>
              <div className="space-y-2 rounded-xl border border-border p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="tabular-nums">{formatAED(total)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Paid now</span><span className="tabular-nums text-success">{formatAED(Math.min(received, total))}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Remaining balance</span><span className={`tabular-nums ${balance > 0 ? "text-danger" : "text-success"}`}>{formatAED(balance)}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes, complaint, special instructions…" />
            </CardContent>
          </Card>
        </div>

        {/* ---- Actions ---- */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/80 py-4 backdrop-blur">
          <Link href="/admin/jobs" className="text-sm text-muted-foreground hover:text-foreground">Cancel</Link>
          <Button type="submit" variant="brand" size="lg" disabled={!canSave || create.isPending}>
            {create.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save &amp; preview invoice
          </Button>
        </div>
        {!canSave && (
          <p className="pb-6 text-right text-xs text-muted-foreground">
            Add a client, a vehicle and at least one line item (with a rate) to continue.
          </p>
        )}
      </form>
    </div>
  );
}

function ModeToggle({
  value,
  onChange,
  newLabel,
  icon: Icon,
}: {
  value: "existing" | "new";
  onChange: (m: "existing" | "new") => void;
  newLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex rounded-lg border border-border p-0.5 text-xs">
      <button type="button" onClick={() => onChange("existing")} className={`rounded-md px-2.5 py-1 font-medium transition-colors ${value === "existing" ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
        Existing
      </button>
      <button type="button" onClick={() => onChange("new")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${value === "new" ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
        <Icon className="size-3.5" /> {newLabel}
      </button>
    </div>
  );
}
