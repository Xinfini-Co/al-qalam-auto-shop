"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Car,
  Plus,
  Wallet,
  CircleDollarSign,
  Wrench,
} from "lucide-react";
import type { ClientWithStats, JobWithRelations } from "@shared";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PaymentBadge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner, EmptyState } from "@/components/admin/states";
import { StatCard } from "@/components/admin/stat-card";
import { VehicleFormDialog } from "@/components/admin/vehicle-form-dialog";
import { formatAED, formatDate, initials } from "@/lib/utils";

type ClientDetail = ClientWithStats & { jobs: JobWithRelations[] };

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [vehicleOpen, setVehicleOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: () => api.getClient(id) as Promise<ClientDetail>,
  });

  if (isLoading) return <Spinner />;
  if (!data)
    return (
      <EmptyState title="Client not found" action={<Link href="/admin/clients" className="text-brand-blue hover:underline">Back to clients</Link>} />
    );

  return (
    <div className="space-y-6">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All clients
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-semibold text-white">
              {initials(data.name)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{data.name}</h2>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {[data.phone1, data.phone2, data.phone3].filter(Boolean).map((p) => (
                  <span key={p} className="flex items-center gap-1.5"><Phone className="size-3.5" /> {p}</span>
                ))}
                {data.address && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {data.address}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total spent" value={formatAED(data.totalSpent)} icon={CircleDollarSign} accent="green" />
        <StatCard label="Outstanding" value={formatAED(data.totalOutstanding)} icon={Wallet} accent="red" />
        <StatCard label="Total jobs" value={String(data.jobCount)} icon={Wrench} accent="blue" />
      </div>

      {/* Vehicles */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Vehicles</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setVehicleOpen(true)}>
            <Plus className="size-4" /> Add vehicle
          </Button>
        </CardHeader>
        <CardContent>
          {data.vehicles.length === 0 ? (
            <EmptyState icon={Car} title="No vehicles yet" description="Add a vehicle to start booking jobs." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.vehicles.map((v) => (
                <div key={v.id} className="flex items-center gap-3 rounded-xl border border-border p-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand-gradient-soft text-brand-blue">
                    <Car className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{v.makeModel}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.plateNo}{v.color ? ` · ${v.color}` : ""}{v.year ? ` · ${v.year}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job history */}
      <Card>
        <CardHeader>
          <CardTitle>Job history</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {data.jobs.length === 0 ? (
            <div className="px-6"><EmptyState icon={Wrench} title="No jobs yet" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.jobs.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell>
                      <Link href={`/admin/jobs/${j.id}`} className="font-medium hover:text-brand-blue">{j.jobNo}</Link>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(j.date)}</TableCell>
                    <TableCell className="text-muted-foreground">{j.vehicle.plateNo}</TableCell>
                    <TableCell><StatusBadge status={j.status} /></TableCell>
                    <TableCell className="text-right tabular-nums">{formatAED(j.totals.total)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {j.totals.balance > 0 ? (
                          <span className="tabular-nums text-danger">{formatAED(j.totals.balance)}</span>
                        ) : null}
                        <PaymentBadge status={j.totals.paymentStatus} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <VehicleFormDialog open={vehicleOpen} onOpenChange={setVehicleOpen} defaultClientId={data.id} />
    </div>
  );
}
