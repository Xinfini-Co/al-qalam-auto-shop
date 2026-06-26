"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Car } from "lucide-react";
import type { Vehicle, VehicleWithClient } from "@shared";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingBlock, EmptyState } from "@/components/admin/states";
import { VehicleFormDialog } from "@/components/admin/vehicle-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export default function VehiclesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<VehicleWithClient | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", search],
    queryFn: () => api.listVehicles(search) as Promise<VehicleWithClient[]>,
  });

  const del = useMutation({
    mutationFn: () => api.deleteVehicle(deleting!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      toast({ title: "Vehicle deleted", variant: "success" });
      setDeleting(null);
    },
    onError: (e: Error) => toast({ title: "Couldn't delete", description: e.message, variant: "error" }),
  });

  return (
    <div>
      <PageHeader
        title="Vehicles"
        description="Every vehicle in the system, linked to its owner."
        actions={
          <Button variant="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> Add vehicle
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plate, make or owner…" className="pl-10" />
          </div>

          {isLoading ? (
            <LoadingBlock rows={6} />
          ) : !data || data.length === 0 ? (
            <EmptyState icon={Car} title="No vehicles found" description={search ? "Try a different search." : "Add a vehicle to get started."} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Plate no</TableHead>
                  <TableHead className="hidden sm:table-cell">Color</TableHead>
                  <TableHead className="hidden sm:table-cell">Year</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="hidden lg:table-cell text-center">Jobs</TableHead>
                  <TableHead className="w-[88px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-gradient-soft text-brand-blue">
                          <Car className="size-4" />
                        </div>
                        <span className="font-medium">{v.makeModel}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{v.plateNo}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{v.color ?? "—"}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{v.year ?? "—"}</TableCell>
                    <TableCell>
                      <Link href={`/admin/clients/${v.client.id}`} className="hover:text-brand-blue">{v.client.name}</Link>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-center tabular-nums">{v.jobCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(v); setFormOpen(true); }} title="Edit">
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-danger hover:text-danger" onClick={() => setDeleting(v)} title="Delete">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <VehicleFormDialog open={formOpen} onOpenChange={setFormOpen} vehicle={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.makeModel} (${deleting?.plateNo})?`}
        description="Vehicles with existing jobs can't be deleted."
        onConfirm={() => del.mutate()}
        loading={del.isPending}
      />
    </div>
  );
}
