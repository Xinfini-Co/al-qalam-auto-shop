import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an AED amount as "Dhs. 2,970.00". */
export function formatAED(amount: number): string {
  return `Dhs. ${amount.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Compact AED for stat cards: "Dhs. 12.4k". */
export function formatAEDCompact(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return `Dhs. ${(amount / 1000).toLocaleString("en-AE", {
      maximumFractionDigits: 1,
    })}k`;
  }
  return formatAED(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Split a money value into Dhs (integer) and Fils (2-digit) for invoices. */
export function splitFils(amount: number): { dhs: string; fils: string } {
  const dhs = Math.floor(amount);
  const fils = Math.round((amount - dhs) * 100);
  return {
    dhs: dhs.toLocaleString("en-AE"),
    fils: fils.toString().padStart(2, "0"),
  };
}

/**
 * "Mr." for individuals, "M/s." (Messrs) for companies — matches the paper
 * estimate's "Mr./M/s." line. Inferred from the name so it needs no extra field.
 */
export function salutationFor(name: string): "Mr." | "M/s." {
  return /\b(llc|est\.?|establishment|trading|transport|movers|rentals|company|co\.?|group|services|workshop|garage|fz[ce]?)\b/i.test(
    name,
  )
    ? "M/s."
    : "Mr.";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
