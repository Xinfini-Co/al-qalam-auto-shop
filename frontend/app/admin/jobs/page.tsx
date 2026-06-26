"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Wrench } from "lucide-react";
import type { JobStatus, JobWithRelations } from "@shared";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PaymentBadge } from "@/components/ui/badge";
import { LoadingBlock, EmptyState } from "@/components/admin/states";
import { STATUS_LABEL } from "@/lib/constants";
import { formatAED, formatDate, cn } from "@/lib/utils";

const FILTERS: { value: JobStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: STATUS_LABEL.PENDING },
  { value: "IN_PROGRESS", label: STATUS_LABEL.IN_PROGRESS },
  { value: "READY_FOR_PICKUP", label: STATUS_LABEL.READY_FOR_PICKUP },
  { value: "COMPLETED", label: STATUS_LABEL.COMPLETED },
];

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatus | "ALL">("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", search, status],
    queryFn: () => api.listJobs({ search, status }) as Promise<JobWithRelations[]>,
  });

  return (
    <div>
      <PageHeader
        title="Jobs & estimates"
        description="All workshop jobs, their status and balances."
        actions={
          <Link href="/admin/jobs/new" className={cn(buttonVariants({ variant: "brand" }))}>
            <Plus className="size-4" /> New job
          </Link>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatus(f.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    status === f.value
                      ? "border-transparent bg-brand-gradient text-white"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative sm:max-w-xs sm:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice, client, plate…" className="pl-10" />
            </div>
          </div>

          {isLoading ? (
            <LoadingBlock rows={8} />
          ) : !data || data.length === 0 ? (
            <EmptyState icon={Wrench} title="No jobs found" description="Adjust the filters or create a new job." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell>
                      <Link href={`/admin/jobs/${j.id}`} className="font-medium hover:text-brand-blue">No. {j.jobNo}</Link>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(j.date)}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{j.client.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {j.vehicle.makeModel}
                      <span className="block text-xs">{j.vehicle.plateNo}</span>
                    </TableCell>
                    <TableCell><StatusBadge status={j.status} /></TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatAED(j.totals.total)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <PaymentBadge status={j.totals.paymentStatus} />
                        {j.totals.balance > 0 && (
                          <span className="text-xs tabular-nums text-muted-foreground">{formatAED(j.totals.balance)} due</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
