import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SHOP } from "@/lib/constants";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-border bg-card/30">
        <div className="container py-16 text-center">
          <p className="text-sm font-medium text-brand-magenta">Get in touch</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Visit the workshop</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Drop by, call us, or send a message and we&apos;ll get right back to you.
          </p>
        </div>
      </section>

      <section className="container grid gap-10 py-16 lg:grid-cols-2">
        <div className="space-y-4">
          <InfoRow icon={MapPin} title="Address">
            {SHOP.area}, {SHOP.city}
            <br />
            {SHOP.poBox}
          </InfoRow>
          <InfoRow icon={Phone} title="Phone">
            <div className="flex flex-col gap-1">
              {SHOP.phones.map((p) => (
                <a key={p} href={`tel:${p}`} className="hover:text-foreground">
                  {p}
                </a>
              ))}
            </div>
          </InfoRow>
          <InfoRow icon={Mail} title="Email">
            <a href={`mailto:${SHOP.email}`} className="hover:text-foreground">
              {SHOP.email}
            </a>
          </InfoRow>
          <InfoRow icon={Clock} title="Working hours">
            Saturday – Thursday · 8:00 AM – 8:00 PM
            <br />
            Friday · 2:00 PM – 8:00 PM
          </InfoRow>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="relative flex h-56 items-center justify-center bg-brand-gradient-soft">
              <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-5 text-brand-red" /> {SHOP.area}, Sharjah – U.A.E.
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <ContactForm />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient-soft text-brand-blue">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="mt-1 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
