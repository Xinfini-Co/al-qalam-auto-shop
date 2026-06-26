import Link from "next/link";
import {
  ArrowRight,
  Hammer,
  SprayCan,
  Wrench,
  Zap,
  Snowflake,
  Cog,
  Phone,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SHOP, SERVICES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS = { Hammer, SprayCan, Wrench, Zap, Snowflake, Cog } as const;

const FEATURES = [
  { icon: ShieldCheck, title: "Genuine parts", desc: "OEM and quality aftermarket parts, fitted by certified hands." },
  { icon: Clock, title: "On-time delivery", desc: "Clear promised dates and live job tracking from your phone." },
  { icon: Sparkles, title: "Showroom finish", desc: "Oven-baked paint and computerised colour matching." },
];

export default function LandingPage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-brand-magenta/20 blur-[120px]" />
          <div className="absolute right-[10%] top-[20%] h-[320px] w-[320px] rounded-full bg-brand-blue/20 blur-[120px]" />
          <div className="absolute left-[8%] top-[40%] h-[280px] w-[280px] rounded-full bg-brand-red/10 blur-[120px]" />
        </div>

        <div className="container flex flex-col items-center pb-20 pt-16 text-center sm:pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-success" /> Now open · {SHOP.area}, Sharjah
          </div>

          <Logo size="lg" className="w-[min(480px,90vw)]" />

          <p className="mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            {SHOP.tagline}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/track" className={cn(buttonVariants({ variant: "brand", size: "lg" }))}>
              Track your job <ArrowRight className="size-4" />
            </Link>
            <Link href="/services" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Explore services
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {SHOP.phones.map((p) => (
              <a key={p} href={`tel:${p}`} className="flex items-center gap-2 hover:text-foreground">
                <Phone className="size-4 text-brand-red" /> {p}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Stats strip ---------------- */}
      <section className="border-y border-border bg-card/30">
        <div className="container grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {[
            { k: "15+", v: "Years on the road" },
            { k: "12k+", v: "Cars serviced" },
            { k: "6", v: "Specialist services" },
            { k: "4.9★", v: "Customer rating" },
          ].map((s) => (
            <div key={s.v} className="text-center">
              <div className="text-3xl font-semibold text-gradient sm:text-4xl">{s.k}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">Everything your car needs, under one roof</h2>
          <p className="mt-3 text-muted-foreground">
            From a tap-out dent to a full mechanical overhaul — handled by specialists.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => {
            const Icon = ICONS[s.icon as keyof typeof ICONS];
            return (
              <Card
                key={s.key}
                className="group relative overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-gradient transition-transform group-hover:scale-x-100" />
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand-magenta">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section className="border-t border-border bg-card/30">
        <div className="container grid gap-8 py-16 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-brand-blue">
                <f.icon className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CTA band ---------------- */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-2xl border border-border p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10 bg-brand-gradient opacity-[0.12]" />
          <h2 className="text-2xl font-semibold sm:text-3xl">Already dropped your car with us?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Track the live status, see the estimate, and check your balance — just enter your
            phone or invoice number.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/track" className={cn(buttonVariants({ variant: "brand", size: "lg" }))}>
              Track your job <ArrowRight className="size-4" />
            </Link>
            <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Get a quote
            </Link>
          </div>
          <ul className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["No login needed", "Live status", "Transparent pricing"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
