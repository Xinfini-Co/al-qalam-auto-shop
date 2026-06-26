"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Car, Calendar, CircleDollarSign, Loader2, PackageSearch } from "lucide-react";
import type { TrackResult } from "@shared";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentBadge } from "@/components/ui/badge";
import { StatusTimeline } from "@/components/status-timeline";
import { CATEGORY_LABEL } from "@/lib/constants";
import { formatAED, formatDate } from "@/lib/utils";

export default function TrackPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const mutation = useMutation({
    mutationFn: (q: string) => api.track(q) as Promise<TrackResult | null>,
    onSettled: () => setSearched(true),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    mutation.mutate(query.trim());
  }

  const result = mutation.data;

  return (
    <div className="container max-w-3xl py-12 sm:py-16">
      <div className="text-center">
        <p className="text-sm font-medium text-brand-magenta">Track your job</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Where&apos;s my car?</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Enter your <strong>phone number</strong> or <strong>invoice number</strong> to see live
          status, the estimate, and your balance.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 0457  or  055-6620775"
            className="h-12 pl-10 text-base"
            aria-label="Phone or invoice number"
          />
        </div>
        <Button type="submit" variant="brand" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Track
        </Button>
      </form>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Demo tip: try invoice <button onClick={() => setQuery("0457")} className="font-medium text-brand-blue hover:underline">0457</button> or phone <button onClick={() => setQuery("055-6620775")} className="font-medium text-brand-blue hover:underline">055-6620775</button>
      </p>

      {searched && !mutation.isPending && !result && (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <PackageSearch className="size-10 text-muted-foreground" />
            <p className="font-medium">No job found</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              We couldn&apos;t find a job for that number. Double-check the invoice or phone number,
              or call us on {`055-6620775`}.
            </p>
          </CardContent>
        </Card>
      )}

      {result && <TrackResultCard result={result} />}
    </div>
  );
}

function TrackResultCard({ result }: { result: TrackResult }) {
  return (
    <div className="mt-8 space-y-6 animate-fade-up">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Invoice</p>
              <p className="text-2xl font-semibold">No. {result.jobNo}</p>
            </div>
            <PaymentBadge status={result.totals.paymentStatus} />
          </div>

          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5">
            <StatusTimeline status={result.status} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <InfoTile icon={Car} label="Vehicle">
              {result.vehicle.makeModel}
              <span className="block text-xs text-muted-foreground">
                {result.vehicle.plateNo}
                {result.vehicle.color ? ` · ${result.vehicle.color}` : ""}
              </span>
            </InfoTile>
            <InfoTile icon={Calendar} label="Booked">
              {formatDate(result.date)}
              {result.promisedDate && (
                <span className="block text-xs text-muted-foreground">
                  Promised {formatDate(result.promisedDate)}
                </span>
              )}
            </InfoTile>
            <InfoTile icon={CircleDollarSign} label="Customer">
              {result.clientName}
            </InfoTile>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold">Work &amp; estimate</h3>
          <ul className="mt-4 divide-y divide-border">
            {result.items.map((it, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium">{it.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABEL[it.category]} · Qty {it.qty}
                  </p>
                </div>
                <span className="text-sm tabular-nums">{formatAED(it.amount)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 rounded-xl bg-muted/40 p-4 text-sm">
            <Row label="Total" value={formatAED(result.totals.total)} />
            <Row label="Amount paid" value={formatAED(result.totals.paid)} className="text-success" />
            <div className="border-t border-border pt-2">
              <Row
                label="Remaining balance"
                value={formatAED(result.totals.balance)}
                strong
                className={result.totals.balance > 0 ? "text-danger" : "text-success"}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Car;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4" /> {label}
      </div>
      <p className="mt-1.5 text-sm font-medium">{children}</p>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  className = "",
}: {
  label: string;
  value: string;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</span>
      <span className={`tabular-nums ${strong ? "text-base font-semibold" : ""} ${className}`}>{value}</span>
    </div>
  );
}
