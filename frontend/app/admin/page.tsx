"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CircleDollarSign,
  Clock,
  Car,
  Wallet,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import type { DashboardPayload } from "@shared";
import { api } from "@/lib/api";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueAreaChart, StatusDonut } from "@/components/admin/charts";
import { LoadingBlock, Spinner } from "@/components/admin/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PaymentBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAED, formatAEDCompact, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.dashboard() as Promise<DashboardPayload>,
  });

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
        ) : (
          <>
            <StatCard label="Today's revenue" value={formatAEDCompact(data.stats.todayRevenue)} icon={CircleDollarSign} accent="green" hint="Cash collected today" />
            <StatCard label="Active jobs" value={String(data.stats.pendingJobs)} icon={Clock} accent="blue" hint="Pending + in progress" />
            <StatCard label="Cars in shop" value={String(data.stats.carsInShop)} icon={Car} accent="magenta" hint="Not yet delivered" />
            <StatCard label="Total outstanding" value={formatAEDCompact(data.stats.totalOutstanding)} icon={Wallet} accent="red" hint="Across all jobs" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Revenue</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Last 30 days</p>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-[280px] w-full" /> : <RevenueAreaChart data={data.revenue30d} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jobs by status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="mx-auto h-[240px] w-[240px] rounded-full" /> : <StatusDonut data={data.statusBreakdown} />}
          </CardContent>
        </Card>
      </div>

      {/* Recent jobs + outstanding */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent jobs</CardTitle>
            <Link href="/admin/jobs" className="flex items-center gap-1 text-sm text-brand-blue hover:underline">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="px-0">
            {isLoading || !data ? (
              <div className="px-6"><LoadingBlock rows={5} /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden sm:table-cell">Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentJobs.map((j) => (
                    <TableRow key={j.id} className="cursor-pointer">
                      <TableCell>
                        <Link href={`/admin/jobs/${j.id}`} className="font-medium hover:text-brand-blue">
                          {j.jobNo}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">{j.client.name}</TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {j.vehicle.makeModel}
                        <span className="block text-xs">{j.vehicle.plateNo}</span>
                      </TableCell>
                      <TableCell><StatusBadge status={j.status} /></TableCell>
                      <TableCell className="text-right tabular-nums">
                        {j.totals.balance > 0 ? (
                          <span className="text-danger">{formatAED(j.totals.balance)}</span>
                        ) : (
                          <span className="text-success">Settled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Outstanding</CardTitle>
            <Link href="/admin/payments" className="flex items-center gap-1 text-sm text-brand-blue hover:underline">
              Accounting <ArrowUpRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <LoadingBlock rows={5} />
            ) : data.outstanding.length === 0 ? (
              <Spinner />
            ) : (
              <ul className="space-y-1">
                {data.outstanding.slice(0, 6).map((d) => (
                  <li key={d.jobId}>
                    <Link
                      href={`/admin/jobs/${d.jobId}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{d.clientName}</p>
                        <p className="text-xs text-muted-foreground">No. {d.jobNo} · {d.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums text-danger">{formatAED(d.balance)}</p>
                        <PaymentBadge status={d.paid > 0 ? "PARTIAL" : "UNPAID"} className="mt-0.5" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
