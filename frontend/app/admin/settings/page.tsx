"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Database, Building2, Palette, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { SHOP } from "@/lib/constants";

const PALETTE = [
  { name: "Primary (red)", hex: "#E31937" },
  { name: "Mid (magenta)", hex: "#9B1C8E" },
  { name: "Secondary (blue)", hex: "#2563EB" },
  { name: "Success", hex: "#22C55E" },
  { name: "Warning", hex: "#F59E0B" },
  { name: "Danger", hex: "#EF4444" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Shop profile, appearance and demo configuration." />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="size-4 text-brand-magenta" /> Shop profile</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Workshop name" value={SHOP.name} />
          <Field label="Area" value={SHOP.area} />
          <Field label="City" value={SHOP.city} />
          <Field label="P.O. Box" value={SHOP.poBox} />
          <Field label="Phone 1" value={SHOP.phones[0]} />
          <Field label="Phone 2" value={SHOP.phones[1]} />
          <Field label="Phone 3" value={SHOP.phones[2]} />
          <Field label="Email" value={SHOP.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="size-4 text-brand-blue" /> Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Switch between dark and light mode.</p>
            </div>
            <div className="flex rounded-lg border border-border p-0.5">
              <Button variant={mounted && theme === "light" ? "secondary" : "ghost"} size="sm" onClick={() => setTheme("light")}>
                <Sun className="size-4" /> Light
              </Button>
              <Button variant={mounted && theme === "dark" ? "secondary" : "ghost"} size="sm" onClick={() => setTheme("dark")}>
                <Moon className="size-4" /> Dark
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Brand palette</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PALETTE.map((c) => (
                <div key={c.hex} className="flex items-center gap-2 rounded-lg border border-border p-2">
                  <span className="size-7 rounded-md" style={{ background: c.hex }} />
                  <div className="text-xs">
                    <p className="font-medium">{c.name}</p>
                    <p className="font-mono text-muted-foreground">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4 text-success" /> Account</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={user?.name ?? "—"} />
          <Field label="Email" value={user?.email ?? "—"} />
          <Field label="Role" value={user?.role ?? "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="size-4 text-warning" /> Demo data</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            This build runs on an in-memory mock dataset so it works with no backend. Changes you make
            (new jobs, payments, clients) persist until you refresh the page.
          </p>
          <p>
            To connect the real NestJS API, set <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_USE_BACKEND=true</code> and
            run the backend on port 4000.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} readOnly className="bg-muted/40" />
    </div>
  );
}
