import type { Metadata } from "next";
import Link from "next/link";
import { Hammer, SprayCan, Wrench, Zap, Snowflake, Cog, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SERVICES, SHOP } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Services" };

const ICONS = { Hammer, SprayCan, Wrench, Zap, Snowflake, Cog } as const;

const DETAILS: Record<string, string[]> = {
  DENTING: ["Panel beating", "Dent pulling", "Chassis straightening", "Hail damage repair"],
  PAINTING: ["Computerised colour match", "Oven-baked finish", "Scratch & scuff repair", "Full respray"],
  MECHANICAL: ["Engine diagnostics", "Brakes & suspension", "Clutch & gearbox", "Periodic service"],
  AUTO_ELECTRIC: ["Battery & alternator", "Wiring & lighting", "ECU fault finding", "Central locking"],
  AC: ["Gas top-up", "Compressor service", "Leak detection", "Cooling diagnostics"],
  SPARE_PARTS: ["Genuine OEM parts", "Quality aftermarket", "Sourcing & supply", "Fitting included"],
};

export default function ServicesPage() {
  return (
    <>
      <section className="border-b border-border bg-card/30">
        <div className="container py-16 text-center">
          <p className="text-sm font-medium text-brand-magenta">What we do</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Specialist auto care</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{SHOP.tagline}</p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {SERVICES.map((s) => {
            const Icon = ICONS[s.icon as keyof typeof ICONS];
            return (
              <Card key={s.key} className="p-7">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand-magenta">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{s.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
                <ul className="mt-5 grid grid-cols-2 gap-2 text-sm">
                  {DETAILS[s.key].map((d) => (
                    <li key={d} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-success" /> {d}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/contact" className={cn(buttonVariants({ variant: "brand", size: "lg" }))}>
            Request an estimate <ArrowRight className="size-4" />
          </Link>
          <Link href="/track" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Track an existing job
          </Link>
        </div>
      </section>
    </>
  );
}
