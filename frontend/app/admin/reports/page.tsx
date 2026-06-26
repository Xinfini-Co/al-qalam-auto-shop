"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Trophy, TrendingUp } from "lucide-react";
import type { ReportsPayload } from "@shared";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { RevenueAreaChart, ServiceBarChart } from "@/components/admin/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner, EmptyState } from "@/components/admin/states";
import { formatAED, cn } from "@/lib/utils";

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export default function ReportsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({
    queryKey: ["reports", days],
    queryFn: () => api.reports(days) as Promise<ReportsPayload>,
  });

  const periodTotal = (data?.revenueByPeriod ?? []).reduce((s, p) => s + p.revenue, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Revenue trends, service mix, top clients and receivables."
        actions={
          <div className="flex rounded-lg border border-border p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDays(r.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  days === r.value ? "bg-brand-gradient text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {isLoading || !data ? (
        <Spinner />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Revenue by period</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Last {days} days</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><TrendingUp className="size-3.5" /> Total</p>
                  <p className="text-lg font-semibold text-gradient">{formatAED(periodTotal)}</p>
                </div>
              </CardHeader>
              <CardContent><RevenueAreaChart data={data.revenueByPeriod} /></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Revenue by service</CardTitle></CardHeader>
              <CardContent>
                {data.revenueByService.length === 0 ? <EmptyState title="No data" /> : <ServiceBarChart data={data.revenueByService} />}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top clients */}
            <Card>
              <CardHeader><CardTitle>Top clients</CardTitle></CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="text-center">Jobs</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topClients.map((c, i) => (
                      <TableRow key={c.clientId}>
                        <TableCell>
                          {i < 3 ? (
                            <span className={cn("flex size-6 items-center justify-center rounded-full text-xs font-bold text-white",
                              i === 0 ? "bg-warning" : i === 1 ? "bg-zinc-400" : "bg-amber-700")}>
                              {i + 1}
                            </span>
                          ) : (
                            <span className="pl-1.5 text-muted-foreground">{i + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/clients/${c.clientId}`} className="font-medium hover:text-brand-blue">{c.name}</Link>
                        </TableCell>
                        <TableCell className="text-center tabular-nums">{c.jobCount}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{formatAED(c.totalSpent)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Receivables */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Outstanding receivables</CardTitle>
                <Trophy className="size-4 text-warning" />
              </CardHeader>
              <CardContent className="px-0">
                {data.receivables.length === 0 ? (
                  <div className="px-6"><EmptyState title="Nothing outstanding" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.receivables.map((d) => (
                        <TableRow key={d.jobId}>
                          <TableCell>
                            <Link href={`/admin/jobs/${d.jobId}`} className="font-medium hover:text-brand-blue">No. {d.jobNo}</Link>
                          </TableCell>
                          <TableCell>{d.clientName}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold text-danger">{formatAED(d.balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
