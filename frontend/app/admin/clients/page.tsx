"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Users, Phone, ChevronRight } from "lucide-react";
import type { Client, ClientWithStats } from "@shared";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingBlock, EmptyState } from "@/components/admin/states";
import { ClientFormDialog } from "@/components/admin/client-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { formatAED, initials } from "@/lib/utils";

export default function ClientsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<ClientWithStats | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: () => api.listClients(search) as Promise<ClientWithStats[]>,
  });

  const del = useMutation({
    mutationFn: () => api.deleteClient(deleting!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Client deleted", variant: "success" });
      setDeleting(null);
    },
    onError: (e: Error) => toast({ title: "Couldn't delete", description: e.message, variant: "error" }),
  });

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Customers, their vehicles and account balances."
        actions={
          <Button variant="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> Add client
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone…" className="pl-10" />
          </div>

          {isLoading ? (
            <LoadingBlock rows={6} />
          ) : !data || data.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients found"
              description={search ? "Try a different search." : "Add your first client to get started."}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">Vehicles</TableHead>
                  <TableHead className="hidden lg:table-cell text-center">Jobs</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="w-[88px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-3 group">
                        <div className="flex size-9 items-center justify-center rounded-full bg-brand-gradient-soft text-xs font-semibold text-brand-magenta">
                          {initials(c.name)}
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-brand-blue">{c.name}</p>
                          <p className="text-xs text-muted-foreground">Spent {formatAED(c.totalSpent)}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="size-3.5" /> {c.phone1}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center tabular-nums">{c.vehicles.length}</TableCell>
                    <TableCell className="hidden lg:table-cell text-center tabular-nums">{c.jobCount}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.totalOutstanding > 0 ? (
                        <span className="font-medium text-danger">{formatAED(c.totalOutstanding)}</span>
                      ) : (
                        <span className="text-success">Clear</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(c); setFormOpen(true); }} title="Edit">
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-danger hover:text-danger" onClick={() => setDeleting(c)} title="Delete">
                          <Trash2 className="size-4" />
                        </Button>
                        <Link href={`/admin/clients/${c.id}`} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
                          <ChevronRight className="size-4" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ClientFormDialog open={formOpen} onOpenChange={setFormOpen} client={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="This permanently removes the client and their vehicles. Clients with existing jobs can't be deleted."
        onConfirm={() => del.mutate()}
        loading={del.isPending}
      />
    </div>
  );
}
