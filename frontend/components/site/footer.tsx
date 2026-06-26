import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { SHOP } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo size="sm" />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{SHOP.tagline}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Visit us</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-magenta" />
              <span>{SHOP.area}, {SHOP.city}<br />{SHOP.poBox}</span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-blue" />
              <a href={`mailto:${SHOP.email}`} className="hover:text-foreground">{SHOP.email}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Call us</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {SHOP.phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p}`} className="flex items-center gap-2 hover:text-foreground">
                  <Phone className="size-4 text-brand-red" /> {p}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex gap-3 text-sm">
            <Link href="/services" className="text-muted-foreground hover:text-foreground">Services</Link>
            <Link href="/track" className="text-muted-foreground hover:text-foreground">Track</Link>
            <Link href="/admin/login" className="text-muted-foreground hover:text-foreground">Staff login</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {SHOP.name}. All rights reserved.</p>
          <p>Sharjah · United Arab Emirates</p>
        </div>
      </div>
    </footer>
  );
}
