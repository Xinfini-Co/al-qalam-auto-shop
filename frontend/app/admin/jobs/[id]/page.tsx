"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Printer,
  FileText,
  Plus,
  Calendar,
  Truck,
  Wrench,
  User,
  CircleDollarSign,
} from "lucide-react";
import type { JobStatus, JobWithRelations } from "@shared";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge, PaymentBadge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner, EmptyState } from "@/components/admin/states";
import { StatusTimeline } from "@/components/status-timeline";
import { PaymentDialog } from "@/components/admin/payment-dialog";
import { InvoicePreviewDialog } from "@/components/invoice/invoice-preview-dialog";
import { useToast } from "@/components/ui/toast";
import {
  CATEGORY_LABEL,
  METHOD_LABEL,
  STATUS_LABEL,
  TRANSPORT_LABEL,
} from "@/lib/constants";
import { formatAED, formatDate, salutationFor } from "@/lib/utils";

const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as JobStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }));

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [payOpen, setPayOpen] = useState(false);
  const [printClient, setPrintClient] = useState(false);
  const [printShop, setPrintShop] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => api.getJob(id) as Promise<JobWithRelations>,
  });

  // auto-open the client invoice preview right after creation (?print=1)
  useEffect(() => {
    if (job && new URLSearchParams(window.location.search).get("print") === "1") {
      setPrintClient(true);
    }
  }, [job]);

  const statusMutation = useMutation({
    mutationFn: (status: JobStatus) => api.updateJobStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries();
      toast({ title: "Status updated", variant: "success" });
    },
  });

  if (isLoading) return <Spinner />;
  if (!job)
    return <EmptyState title="Job not found" action={<Link href="/admin/jobs" className="text-brand-blue hover:underline">Back to jobs</Link>} />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All jobs
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPrintShop(true)}>
            <FileText className="size-4" /> Shop copy
          </Button>
          <Button variant="brand" size="sm" onClick={() => setPrintClient(true)}>
            <Printer className="size-4" /> Client invoice
          </Button>
        </div>
      </div>

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold">No. {job.jobNo}</h2>
                <StatusBadge status={job.status} />
                <PaymentBadge status={job.totals.paymentStatus} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                <Link href={`/admin/clients/${job.client.id}`} className="font-medium text-foreground hover:text-brand-blue">
                  {salutationFor(job.client.name)} {job.client.name}
                </Link>{" "}
                · {job.vehicle.makeModel} · {job.vehicle.plateNo}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={job.status}
                onChange={(e) => statusMutation.mutate(e.target.value as JobStatus)}
                options={STATUS_OPTIONS}
                className="w-44"
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5">
            <StatusTimeline status={job.status} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Meta icon={Calendar} label="Date">{formatDate(job.date)}</Meta>
            <Meta icon={Calendar} label="Promised">{job.promisedDate ? formatDate(job.promisedDate) : "—"}</Meta>
            <Meta icon={Truck} label="Transport">{TRANSPORT_LABEL[job.transportType]}</Meta>
            <Meta icon={Wrench} label="Mechanic">{job.mechanicName ?? "—"}</Meta>
          </div>

          {job.notes && (
            <div className="mt-4 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Notes: </span>{job.notes}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Line items</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">S.No</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.items.map((it, i) => (
                  <TableRow key={it.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{it.description}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{CATEGORY_LABEL[it.category]}</TableCell>
                    <TableCell className="text-center tabular-nums">{it.qty}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatAED(it.rate)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatAED(it.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Money + payments */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Total" value={formatAED(job.totals.total)} />
              <Row label="Paid" value={formatAED(job.totals.paid)} className="text-success" />
              <div className="border-t border-border pt-2">
                <Row label="Balance" value={formatAED(job.totals.balance)} strong className={job.totals.balance > 0 ? "text-danger" : "text-success"} />
              </div>
              <Button variant="brand" className="mt-3 w-full" onClick={() => setPayOpen(true)} disabled={job.totals.balance <= 0}>
                <Plus className="size-4" /> {job.totals.balance <= 0 ? "Fully paid" : "Record payment"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
            <CardContent>
              {job.payments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No payments yet.</p>
              ) : (
                <ul className="space-y-3">
                  {job.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success">
                          <CircleDollarSign className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium tabular-nums">{formatAED(p.amount)}</p>
                          <p className="text-xs text-muted-foreground">{METHOD_LABEL[p.method]} · {formatDate(p.date)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentDialog open={payOpen} onOpenChange={setPayOpen} job={job} />
      <InvoicePreviewDialog open={printClient} onOpenChange={setPrintClient} job={job} variant="client" />
      <InvoicePreviewDialog open={printShop} onOpenChange={setPrintShop} job={job} variant="shop" />
    </div>
  );
}

function Meta({ icon: Icon, label, children }: { icon: typeof Calendar; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-1 text-sm font-medium">{children}</p>
    </div>
  );
}

function Row({ label, value, strong, className = "" }: { label: string; value: string; strong?: boolean; className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</span>
      <span className={`tabular-nums ${strong ? "text-base font-semibold" : ""} ${className}`}>{value}</span>
    </div>
  );
}
