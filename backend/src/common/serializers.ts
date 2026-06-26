import type {
  Client,
  DebtorRow,
  JobItem,
  JobStatus,
  JobWithRelations,
  Payment,
  ServiceCategory,
  TrackResult,
  TransportType,
  Vehicle,
} from "@shared";
import { jobTotals } from "./money";

/** Structural shape of a Prisma Job with its relations included. */
export interface FullJob {
  id: string;
  jobNo: string;
  clientId: string;
  vehicleId: string;
  date: Date;
  transportType: string;
  status: string;
  mechanicName: string | null;
  notes: string | null;
  promisedDate: Date | null;
  createdAt: Date;
  client: ClientRow;
  vehicle: VehicleRow;
  items: ItemRow[];
  payments: PaymentRow[];
}
interface ClientRow {
  id: string; name: string; phone1: string; phone2: string | null; phone3: string | null;
  address: string | null; createdAt: Date;
}
interface VehicleRow {
  id: string; clientId: string; plateNo: string; makeModel: string; color: string | null; year: number | null;
}
interface ItemRow {
  id: string; jobId: string; category: string; description: string; qty: number; rate: number; amount: number;
}
interface PaymentRow {
  id: string; jobId: string; amount: number; method: string; date: Date; note: string | null;
}

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function serializeClient(c: ClientRow): Client {
  return { ...c, createdAt: c.createdAt.toISOString() };
}
export function serializeVehicle(v: VehicleRow): Vehicle {
  return { ...v };
}
export function serializeItem(i: ItemRow): JobItem {
  return { ...i, category: i.category as ServiceCategory };
}
export function serializePayment(p: PaymentRow): Payment {
  return { ...p, method: p.method as Payment["method"], date: p.date.toISOString() };
}

export function serializeJob(job: FullJob): JobWithRelations {
  const items = job.items.map(serializeItem);
  const payments = job.payments
    .map(serializePayment)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return {
    id: job.id,
    jobNo: job.jobNo,
    clientId: job.clientId,
    vehicleId: job.vehicleId,
    date: job.date.toISOString(),
    transportType: job.transportType as TransportType,
    status: job.status as JobStatus,
    mechanicName: job.mechanicName,
    notes: job.notes,
    promisedDate: iso(job.promisedDate),
    createdAt: job.createdAt.toISOString(),
    client: serializeClient(job.client),
    vehicle: serializeVehicle(job.vehicle),
    items,
    payments,
    totals: jobTotals(items, payments),
  };
}

export function debtorRow(job: FullJob): DebtorRow {
  const jr = serializeJob(job);
  return {
    jobId: job.id,
    jobNo: job.jobNo,
    clientName: jr.client.name,
    phone: jr.client.phone1,
    vehicle: `${jr.vehicle.makeModel} · ${jr.vehicle.plateNo}`,
    total: jr.totals.total,
    paid: jr.totals.paid,
    balance: jr.totals.balance,
  };
}

export function toTrackResult(job: FullJob): TrackResult {
  const jr = serializeJob(job);
  return {
    jobNo: jr.jobNo,
    status: jr.status,
    date: jr.date,
    promisedDate: jr.promisedDate,
    clientName: jr.client.name,
    vehicle: { plateNo: jr.vehicle.plateNo, makeModel: jr.vehicle.makeModel, color: jr.vehicle.color },
    items: jr.items.map((i) => ({ description: i.description, qty: i.qty, amount: i.amount, category: i.category })),
    totals: jr.totals,
  };
}

/** Standard `include` for fetching a job with everything needed. */
export const JOB_INCLUDE = {
  client: true,
  vehicle: true,
  items: true,
  payments: true,
} as const;
