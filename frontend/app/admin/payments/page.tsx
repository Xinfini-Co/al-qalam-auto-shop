"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Wallet, CircleDollarSign, Banknote, CreditCard, Landmark, Plus } from "lucide-react";
import type { JobWithRelations, Payment } from "@shared";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { MonthlyBarChart } from "@/components/admin/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner, EmptyState } from "@/components/admin/states";
import { PaymentDialog } from "@/components/admin/payment-dialog";
import { METHOD_LABEL } from "@/lib/constants";
import { formatAED, formatDate } from "@/lib/utils";

type Accounting = {
  collectedToday: number;
  byMethod: { method: "CASH" | "CARD" | "BANK_TRANSFER"; amount: number }[];
  debtors: { jobId: string; jobNo: string; clientName: string; phone: string; vehicle: string; total: number; paid: number; balance: number }[];
  totalOutstanding: number;
  monthly: { month: string; revenue: number }[];
  last30: { date: string; revenue: number }[];
};

const METHOD_ICON = { CASH: Banknote, CARD: CreditCard, BANK_TRANSFER: Landmark } as const;

export default function PaymentsPage() {
  const [recordJobId, setRecordJobId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["accounting"], queryFn: () => api.accounting() as Promise<Accounting> });
  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: () => api.listPayments() as Promise<(Payment & { job: { jobNo: string; clientName: string } })[]>,
  });

  // fetch the selected job only when recording a payment
  const { data: recordJob } = useQuery({
    queryKey: ["job", recordJobId],
    queryFn: () => api.getJob(recordJobId!) as Promise<JobWithRelations>,
    enabled: !!recordJobId,
  });

  if (isLoading || !data) return <Spinner />;

  const monthRevenue = data.monthly.at(-1)?.revenue ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Payments & accounting" description="Daily cash, outstanding debtors and monthly revenue." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected today" value={formatAED(data.collectedToday)} icon={CircleDollarSign} accent="green" />
        <StatCard label="This month" value={formatAED(monthRevenue)} icon={Banknote} accent="blue" />
        <StatCard label="Total outstanding" value={formatAED(data.totalOutstanding)} icon={Wallet} accent="red" hint={`${data.debtors.length} debtor${data.debtors.length === 1 ? "" : "s"}`} />
        <StatCard label="Debtors" value={String(data.debtors.length)} icon={CreditCard} accent="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Monthly revenue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly revenue</CardTitle>
            <p className="text-sm text-muted-foreground">Cash collected over the last 6 months</p>
          </CardHeader>
          <CardContent><MonthlyBarChart data={data.monthly} /></CardContent>
        </Card>

        {/* Daily cash by method */}
        <Card>
          <CardHeader><CardTitle>Today&apos;s cash report</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.byMethod.map((m) => {
              const Icon = METHOD_ICON[m.method];
              return (
                <div key={m.method} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="size-4" /> {METHOD_LABEL[m.method]}
                  </span>
                  <span className="font-medium tabular-nums">{formatAED(m.amount)}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between border-t border-border pt-3 font-semibold">
              <span>Collected</span>
              <span className="tabular-nums text-success">{formatAED(data.collectedToday)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debtors */}
      <Card>
        <CardHeader><CardTitle>Debtors · outstanding balances</CardTitle></CardHeader>
        <CardContent className="px-0">
          {data.debtors.length === 0 ? (
            <div className="px-6"><EmptyState title="No outstanding balances" description="Every job is fully settled." /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="w-[120px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.debtors.map((d) => (
                  <TableRow key={d.jobId}>
                    <TableCell>
                      <Link href={`/admin/jobs/${d.jobId}`} className="font-medium hover:text-brand-blue">No. {d.jobNo}</Link>
                    </TableCell>
                    <TableCell>
                      <p>{d.clientName}</p>
                      <p className="text-xs text-muted-foreground">{d.phone}</p>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{d.vehicle}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatAED(d.total)}</TableCell>
                    <TableCell className="text-right tabular-nums text-success">{formatAED(d.paid)}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-danger">{formatAED(d.balance)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setRecordJobId(d.jobId)}>
                        <Plus className="size-3.5" /> Record
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent payments */}
      <Card>
        <CardHeader><CardTitle>Recent payments</CardTitle></CardHeader>
        <CardContent className="px-0">
          {!payments || payments.length === 0 ? (
            <div className="px-6"><EmptyState title="No payments yet" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, 12).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-muted-foreground">{formatDate(p.date)}</TableCell>
                    <TableCell>
                      <Link href={`/admin/jobs/${p.jobId}`} className="font-medium hover:text-brand-blue">No. {p.job.jobNo}</Link>
                    </TableCell>
                    <TableCell>{p.job.clientName}</TableCell>
                    <TableCell className="text-muted-foreground">{METHOD_LABEL[p.method]}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-success">{formatAED(p.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {recordJob && (
        <PaymentDialog open={!!recordJobId} onOpenChange={(o) => !o && setRecordJobId(null)} job={recordJob} />
      )}
    </div>
  );
}
