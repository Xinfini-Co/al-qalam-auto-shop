import type {
  JobItem,
  JobTotals,
  Payment,
  PaymentStatus,
} from "@shared";

/**
 * Single source of truth for money math on the frontend.
 *
 * The backend service layer performs the exact same calculations (see
 * backend/src/common/money.ts). UI components must NEVER add up money inline —
 * always go through these helpers so the demo and the real API agree.
 */

/** Amount for a single line item = qty * rate, rounded to fils. */
export function lineAmount(qty: number, rate: number): number {
  return round2((Number(qty) || 0) * (Number(rate) || 0));
}

export function sumItems(items: Pick<JobItem, "qty" | "rate">[]): number {
  return round2(items.reduce((acc, it) => acc + lineAmount(it.qty, it.rate), 0));
}

export function sumPayments(payments: Pick<Payment, "amount">[]): number {
  return round2(payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0));
}

export function paymentStatus(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return "UNPAID";
  if (paid >= total) return "PAID";
  return "PARTIAL";
}

/** Compute the full money summary for a job. */
export function jobTotals(
  items: Pick<JobItem, "qty" | "rate">[],
  payments: Pick<Payment, "amount">[],
): JobTotals {
  const total = sumItems(items);
  const paid = sumPayments(payments);
  const balance = round2(total - paid);
  return { total, paid, balance, paymentStatus: paymentStatus(total, paid) };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
