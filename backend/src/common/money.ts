import type { PaymentStatus } from "@shared";

/**
 * Single source of truth for money math on the backend — mirrors
 * frontend/lib/money.ts. Keep these two in sync. Controllers/services must
 * never add money inline; always route through here.
 */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function lineAmount(qty: number, rate: number): number {
  return round2((Number(qty) || 0) * (Number(rate) || 0));
}

export function sumItems(items: { qty: number; rate: number }[]): number {
  return round2(items.reduce((acc, it) => acc + lineAmount(it.qty, it.rate), 0));
}

export function sumPayments(payments: { amount: number }[]): number {
  return round2(payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0));
}

export function paymentStatus(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return "UNPAID";
  if (paid >= total) return "PAID";
  return "PARTIAL";
}

export function jobTotals(
  items: { qty: number; rate: number }[],
  payments: { amount: number }[],
) {
  const total = sumItems(items);
  const paid = sumPayments(payments);
  const balance = round2(total - paid);
  return { total, paid, balance, paymentStatus: paymentStatus(total, paid) };
}
