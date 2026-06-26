"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import type { LoginResponse } from "@shared";
import Logo from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("admin@alqalam.ae");
  const [password, setPassword] = useState("admin123");

  const mutation = useMutation({
    mutationFn: () => api.login(email, password) as Promise<LoginResponse>,
    onSuccess: (res) => {
      saveSession(res.token, res.user);
      toast({ title: `Welcome back, ${res.user.name}`, variant: "success" });
      router.push("/admin");
    },
    onError: (err: Error) =>
      toast({ title: "Login failed", description: err.message, variant: "error" }),
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-magenta/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[320px] w-[320px] rounded-full bg-brand-blue/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-glow backdrop-blur">
          <div className="mb-6">
            <h1 className="text-xl font-semibold">Staff sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Access the workshop management dashboard.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" variant="brand" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              Sign in
            </Button>
          </form>

          <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Demo credentials</span> — already filled in:
            <br />
            admin@alqalam.ae · admin123
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to website
        </Link>
      </div>
    </div>
  );
}
