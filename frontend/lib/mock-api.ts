/**
 * Mock API layer — lets the frontend run fully standalone for the demo.
 *
 * It holds an in-memory, mutable copy of the seed data and exposes the exact
 * same shapes the NestJS backend returns. All money math goes through
 * `lib/money.ts`, never inline. `lib/api.ts` decides whether to call this or
 * the real backend.
 */
import type {
  Client,
  ClientWithStats,
  CreateJobInput,
  CreatePaymentInput,
  DashboardPayload,
  DebtorRow,
  Job,
  JobItem,
  JobStatus,
  JobWithRelations,
  LoginResponse,
  Payment,
  ReportsPayload,
  RevenuePoint,
  ServiceCategory,
  ServiceRevenue,
  StatusCount,
  TopClient,
  TrackResult,
  Vehicle,
  VehicleWithClient,
} from "@shared";
import { jobTotals, lineAmount, sumPayments } from "./money";
import {
  clients as seedClients,
  demoUser,
  jobItems as seedItems,
  jobs as seedJobs,
  nextJobNo,
  payments as seedPayments,
  vehicles as seedVehicles,
} from "./mock-data";

const ALL_STATUSES: JobStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "READY_FOR_PICKUP",
];

// --- mutable in-memory store (singleton in the browser) --------------------
const db = {
  clients: structuredClone(seedClients) as Client[],
  vehicles: structuredClone(seedVehicles) as Vehicle[],
  jobs: structuredClone(seedJobs) as Job[],
  items: structuredClone(seedItems) as JobItem[],
  payments: structuredClone(seedPayments) as Payment[],
};

let idSeq = 1000;
const id = (p: string) => `${p}${++idSeq}`;
const dayKey = (iso: string) => iso.slice(0, 10);
const todayKey = () => new Date().toISOString().slice(0, 10);

// --- relation / derivation helpers -----------------------------------------
function itemsFor(jobId: string) {
  return db.items.filter((i) => i.jobId === jobId);
}
function paymentsFor(jobId: string) {
  return db.payments
    .filter((p) => p.jobId === jobId)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function toJobWithRelations(job: Job): JobWithRelations {
  const client = db.clients.find((c) => c.id === job.clientId)!;
  const vehicle = db.vehicles.find((v) => v.id === job.vehicleId)!;
  const items = itemsFor(job.id);
  const pays = paymentsFor(job.id);
  return { ...job, client, vehicle, items, payments: pays, totals: jobTotals(items, pays) };
}

function clientStats(client: Client): ClientWithStats {
  const vs = db.vehicles.filter((v) => v.clientId === client.id);
  const cJobs = db.jobs.filter((j) => j.clientId === client.id);
  let totalSpent = 0;
  let totalOutstanding = 0;
  for (const j of cJobs) {
    const t = jobTotals(itemsFor(j.id), paymentsFor(j.id));
    totalSpent += t.paid;
    totalOutstanding += t.balance;
  }
  return { ...client, vehicles: vs, jobCount: cJobs.length, totalSpent, totalOutstanding };
}

function debtorRow(job: Job): DebtorRow {
  const jr = toJobWithRelations(job);
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

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------
export function login(email: string, password: string): LoginResponse {
  if (email.trim().toLowerCase() === "admin@alqalam.ae" && password === "admin123") {
    return { token: `demo.${btoa(email)}.token`, user: demoUser };
  }
  throw new Error("Invalid email or password");
}

// ---------------------------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------------------------
export function getDashboard(): DashboardPayload {
  const today = todayKey();
  const todayRevenue = sumPayments(db.payments.filter((p) => dayKey(p.date) === today));

  const pendingJobs = db.jobs.filter(
    (j) => j.status === "PENDING" || j.status === "IN_PROGRESS",
  ).length;
  const carsInShop = db.jobs.filter((j) => j.status !== "COMPLETED").length;

  const outstanding = db.jobs
    .map(debtorRow)
    .filter((d) => d.balance > 0.001)
    .sort((a, b) => b.balance - a.balance);
  const totalOutstanding = outstanding.reduce((s, d) => s + d.balance, 0);

  const statusBreakdown: StatusCount[] = ALL_STATUSES.map((status) => ({
    status,
    count: db.jobs.filter((j) => j.status === status).length,
  }));

  const recentJobs = [...db.jobs]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6)
    .map(toJobWithRelations);

  return {
    stats: { todayRevenue, pendingJobs, carsInShop, totalOutstanding },
    revenue30d: revenueSeries(30),
    statusBreakdown,
    recentJobs,
    outstanding,
  };
}

function revenueSeries(days: number): RevenuePoint[] {
  const out: RevenuePoint[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const revenue = sumPayments(db.payments.filter((p) => dayKey(p.date) === key));
    out.push({ date: d.toISOString(), revenue });
  }
  return out;
}

// ---------------------------------------------------------------------------
// CLIENTS
// ---------------------------------------------------------------------------
export function listClients(search = ""): ClientWithStats[] {
  const q = search.trim().toLowerCase();
  return db.clients
    .filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone1.includes(q) ||
        (c.phone2 ?? "").includes(q) ||
        (c.phone3 ?? "").includes(q),
    )
    .map(clientStats)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getClient(clientId: string) {
  const c = db.clients.find((x) => x.id === clientId);
  if (!c) throw new Error("Client not found");
  const stats = clientStats(c);
  const jobs = db.jobs
    .filter((j) => j.clientId === clientId)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map(toJobWithRelations);
  return { ...stats, jobs };
}

export function createClient(input: Omit<Client, "id" | "createdAt">): Client {
  const c: Client = { ...input, id: id("c"), createdAt: new Date().toISOString() };
  db.clients.push(c);
  return c;
}

export function updateClient(clientId: string, patch: Partial<Client>): Client {
  const c = db.clients.find((x) => x.id === clientId);
  if (!c) throw new Error("Client not found");
  Object.assign(c, patch);
  return c;
}

export function deleteClient(clientId: string): { ok: true } {
  const hasJobs = db.jobs.some((j) => j.clientId === clientId);
  if (hasJobs) throw new Error("Cannot delete a client with existing jobs");
  db.clients = db.clients.filter((c) => c.id !== clientId);
  db.vehicles = db.vehicles.filter((v) => v.clientId !== clientId);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// VEHICLES
// ---------------------------------------------------------------------------
export function listVehicles(search = ""): VehicleWithClient[] {
  const q = search.trim().toLowerCase();
  return db.vehicles
    .map((v) => {
      const client = db.clients.find((c) => c.id === v.clientId)!;
      const jobCount = db.jobs.filter((j) => j.vehicleId === v.id).length;
      return {
        ...v,
        client: { id: client.id, name: client.name, phone1: client.phone1 },
        jobCount,
      };
    })
    .filter(
      (v) =>
        !q ||
        v.plateNo.toLowerCase().includes(q) ||
        v.makeModel.toLowerCase().includes(q) ||
        v.client.name.toLowerCase().includes(q),
    )
    .sort((a, b) => a.makeModel.localeCompare(b.makeModel));
}

export function createVehicle(input: Omit<Vehicle, "id">): Vehicle {
  const v: Vehicle = { ...input, id: id("v") };
  db.vehicles.push(v);
  return v;
}

export function updateVehicle(vehicleId: string, patch: Partial<Vehicle>): Vehicle {
  const v = db.vehicles.find((x) => x.id === vehicleId);
  if (!v) throw new Error("Vehicle not found");
  Object.assign(v, patch);
  return v;
}

export function deleteVehicle(vehicleId: string): { ok: true } {
  const hasJobs = db.jobs.some((j) => j.vehicleId === vehicleId);
  if (hasJobs) throw new Error("Cannot delete a vehicle with existing jobs");
  db.vehicles = db.vehicles.filter((v) => v.id !== vehicleId);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// JOBS
// ---------------------------------------------------------------------------
export interface JobFilters {
  search?: string;
  status?: JobStatus | "ALL";
}
export function listJobs(filters: JobFilters = {}): JobWithRelations[] {
  const q = (filters.search ?? "").trim().toLowerCase();
  return db.jobs
    .map(toJobWithRelations)
    .filter((j) => filters.status && filters.status !== "ALL" ? j.status === filters.status : true)
    .filter(
      (j) =>
        !q ||
        j.jobNo.includes(q) ||
        j.client.name.toLowerCase().includes(q) ||
        j.vehicle.plateNo.toLowerCase().includes(q) ||
        j.vehicle.makeModel.toLowerCase().includes(q),
    )
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getJob(jobId: string): JobWithRelations {
  const j = db.jobs.find((x) => x.id === jobId);
  if (!j) throw new Error("Job not found");
  return toJobWithRelations(j);
}

export function getJobByNo(jobNo: string): JobWithRelations | null {
  const j = db.jobs.find((x) => x.jobNo === jobNo.trim().padStart(4, "0"));
  return j ? toJobWithRelations(j) : null;
}

export function createJob(input: CreateJobInput): JobWithRelations {
  // resolve / create client
  let clientId = input.clientId;
  if (!clientId && input.newClient) {
    clientId = createClient({
      name: input.newClient.name,
      phone1: input.newClient.phone1,
      phone2: input.newClient.phone2 ?? null,
    }).id;
  }
  if (!clientId) throw new Error("A client is required");

  // resolve / create vehicle
  let vehicleId = input.vehicleId;
  if (!vehicleId && input.newVehicle) {
    vehicleId = createVehicle({
      clientId,
      plateNo: input.newVehicle.plateNo,
      makeModel: input.newVehicle.makeModel,
      color: input.newVehicle.color ?? null,
      year: input.newVehicle.year ?? null,
    }).id;
  }
  if (!vehicleId) throw new Error("A vehicle is required");

  if (!input.items.length) throw new Error("Add at least one line item");

  const jobId = id("j");
  const job: Job = {
    id: jobId,
    jobNo: nextJobNo(db.jobs),
    clientId,
    vehicleId,
    date: input.date || new Date().toISOString(),
    transportType: input.transportType,
    status: "PENDING",
    mechanicName: input.mechanicName ?? null,
    notes: input.notes ?? null,
    promisedDate: input.promisedDate ?? null,
    createdAt: new Date().toISOString(),
  };
  db.jobs.push(job);

  input.items.forEach((it) => {
    db.items.push({
      id: id("i"),
      jobId,
      category: it.category,
      description: it.description,
      qty: it.qty,
      rate: it.rate,
      amount: lineAmount(it.qty, it.rate),
    });
  });

  if (input.initialPayment && input.initialPayment.amount > 0) {
    db.payments.push({
      id: id("p"),
      jobId,
      amount: input.initialPayment.amount,
      method: input.initialPayment.method,
      date: new Date().toISOString(),
      note: "Initial payment",
    });
  }

  return toJobWithRelations(job);
}

export function updateJobStatus(jobId: string, status: JobStatus): JobWithRelations {
  const j = db.jobs.find((x) => x.id === jobId);
  if (!j) throw new Error("Job not found");
  j.status = status;
  return toJobWithRelations(j);
}

export function updateJob(jobId: string, patch: Partial<Job>): JobWithRelations {
  const j = db.jobs.find((x) => x.id === jobId);
  if (!j) throw new Error("Job not found");
  Object.assign(j, patch);
  return toJobWithRelations(j);
}

// ---------------------------------------------------------------------------
// PAYMENTS
// ---------------------------------------------------------------------------
export function listPayments(): (Payment & { job: { jobNo: string; clientName: string } })[] {
  return [...db.payments]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map((p) => {
      const job = db.jobs.find((j) => j.id === p.jobId)!;
      const client = db.clients.find((c) => c.id === job.clientId)!;
      return { ...p, job: { jobNo: job.jobNo, clientName: client.name } };
    });
}

export function addPayment(input: CreatePaymentInput): JobWithRelations {
  const job = db.jobs.find((j) => j.id === input.jobId);
  if (!job) throw new Error("Job not found");
  if (input.amount <= 0) throw new Error("Amount must be greater than zero");
  const { balance } = jobTotals(itemsFor(job.id), paymentsFor(job.id));
  if (input.amount > balance + 0.001) {
    throw new Error(`Amount exceeds the remaining balance of ${balance.toFixed(2)}`);
  }
  db.payments.push({
    id: id("p"),
    jobId: input.jobId,
    amount: input.amount,
    method: input.method,
    date: new Date().toISOString(),
    note: input.note ?? null,
  });
  return toJobWithRelations(job);
}

/** Accounting summary: daily cash collected vs outstanding, debtors, monthly. */
export function getAccounting() {
  const today = todayKey();
  const todayPayments = db.payments.filter((p) => dayKey(p.date) === today);
  const collectedToday = sumPayments(todayPayments);

  const byMethod = (["CASH", "CARD", "BANK_TRANSFER"] as const).map((m) => ({
    method: m,
    amount: sumPayments(todayPayments.filter((p) => p.method === m)),
  }));

  const debtors = db.jobs
    .map(debtorRow)
    .filter((d) => d.balance > 0.001)
    .sort((a, b) => b.balance - a.balance);
  const totalOutstanding = debtors.reduce((s, d) => s + d.balance, 0);

  const monthly = monthlySeries(6);

  return { collectedToday, byMethod, debtors, totalOutstanding, monthly, last30: revenueSeries(30) };
}

function monthlySeries(months: number) {
  const out: { month: string; revenue: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const revenue = sumPayments(db.payments.filter((p) => p.date.slice(0, 7) === key));
    out.push({ month: d.toLocaleDateString("en-GB", { month: "short" }), revenue });
  }
  return out;
}

// ---------------------------------------------------------------------------
// REPORTS
// ---------------------------------------------------------------------------
export function getReports(days = 30): ReportsPayload {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);

  const revenueByService = serviceRevenue();

  const topClients: TopClient[] = db.clients
    .map((c) => {
      const stats = clientStats(c);
      return { clientId: c.id, name: c.name, totalSpent: stats.totalSpent, jobCount: stats.jobCount };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 6);

  const receivables = db.jobs
    .map(debtorRow)
    .filter((d) => d.balance > 0.001)
    .sort((a, b) => b.balance - a.balance);

  return { revenueByPeriod: revenueSeries(days), revenueByService, topClients, receivables };
}

function serviceRevenue(): ServiceRevenue[] {
  const totals = new Map<ServiceCategory, number>();
  for (const it of db.items) {
    totals.set(it.category, (totals.get(it.category) ?? 0) + it.amount);
  }
  return [...totals.entries()]
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ---------------------------------------------------------------------------
// PUBLIC TRACKING
// ---------------------------------------------------------------------------
export function track(query: string): TrackResult | null {
  const q = query.trim();
  if (!q) return null;

  // try invoice / job number first
  const byNo = db.jobs.find((j) => j.jobNo === q.padStart(4, "0") || j.jobNo === q);
  let job = byNo;

  // else match by any client phone, returning their latest job
  if (!job) {
    const digits = q.replace(/\D/g, "");
    const client = db.clients.find((c) =>
      [c.phone1, c.phone2, c.phone3]
        .filter(Boolean)
        .some((p) => (p as string).replace(/\D/g, "").includes(digits) && digits.length >= 4),
    );
    if (client) {
      job = db.jobs
        .filter((j) => j.clientId === client.id)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
    }
  }
  if (!job) return null;

  const jr = toJobWithRelations(job);
  return {
    jobNo: jr.jobNo,
    status: jr.status,
    date: jr.date,
    promisedDate: jr.promisedDate,
    clientName: jr.client.name,
    vehicle: { plateNo: jr.vehicle.plateNo, makeModel: jr.vehicle.makeModel, color: jr.vehicle.color },
    items: jr.items.map((i) => ({
      description: i.description,
      qty: i.qty,
      amount: i.amount,
      category: i.category,
    })),
    totals: jr.totals,
  };
}
