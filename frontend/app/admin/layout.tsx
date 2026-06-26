"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Plus,
  Loader2,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav, NAV } from "@/components/admin/sidebar-nav";
import { useAuth, clearSession } from "@/lib/auth";
import { initials, cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  // The login page renders its own full-screen layout.
  if (isLogin) return <>{children}</>;

  return <AdminShell>{children}</AdminShell>;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthed, ready, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (ready && !isAuthed) router.replace("/admin/login");
  }, [ready, isAuthed, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!ready || !isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const title = NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label ?? "Dashboard";

  function logout() {
    clearSession();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ---- Desktop sidebar ---- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card/40 backdrop-blur transition-[width] lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-border", collapsed ? "justify-center px-2" : "px-5")}>
          <Link href="/admin" className="flex items-center gap-2">
            <Logo variant="mark" />
            {!collapsed && <span className="text-sm font-semibold tracking-tight">AQAS Admin</span>}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scroll-slim">
          <SidebarNav collapsed={collapsed} />
        </div>

        <div className="border-t border-border p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : (<><PanelLeftClose className="size-4" /> Collapse</>)}
          </button>
        </div>
      </aside>

      {/* ---- Mobile drawer ---- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Link href="/admin" className="flex items-center gap-2">
                <Logo variant="mark" />
                <span className="text-sm font-semibold">AQAS Admin</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* ---- Main column ---- */}
      <div className={cn("flex min-h-screen flex-col transition-[padding] lg:pl-64", collapsed && "lg:pl-[76px]")}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="size-5" />
            </Button>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/jobs/new"
              className={cn(buttonVariants({ variant: "brand", size: "sm" }), "hidden sm:inline-flex")}
            >
              <Plus className="size-4" /> New job
            </Link>
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
              <div className="flex size-7 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                {initials(user?.name ?? "Admin")}
              </div>
              <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
              <Button variant="ghost" size="icon" className="size-7" onClick={logout} title="Sign out">
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
