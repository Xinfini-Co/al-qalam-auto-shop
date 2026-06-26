/**
 * Shared domain types for Al Qalam Auto Shop (AQAS).
 *
 * IMPORTANT: this package is TYPE-ONLY. It must not export runtime values,
 * because both the Next.js frontend and the NestJS backend import it across
 * package boundaries via the `@shared/*` path alias. Keeping it type-only means
 * the imports are fully erased at compile time and nothing needs bundling.
 *
 * Runtime constants (category lists, status colors, etc.) live inside each app.
 */

// ---------------------------------------------------------------------------
// Enums expressed as string-literal unions (type-only, no runtime cost)
// ---------------------------------------------------------------------------

export type UserRole = "ADMIN" | "STAFF";

export type JobStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "READY_FOR_PICKUP";

export type TransportType = "SELF_DRIVE" | "TOWED" | "PICKUP" | "DELIVERY";

export type ServiceCategory =
  | "DENTING"
  | "PAINTING"
  | "MECHANICAL"
  | "AUTO_ELECTRIC"
  | "AC"
  | "SPARE_PARTS";

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER";

export type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";

// ---------------------------------------------------------------------------
// Core records (mirror the Prisma models)
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Client {
  id: string;
  name: string;
  phone1: string;
  phone2?: string | null;
  phone3?: string | null;
  address?: string | null;
  createdAt: string; // ISO date
}

export interface Vehicle {
  id: string;
  clientId: string;
  plateNo: string;
  makeModel: string;
  color?: string | null;
  year?: number | null;
}

export interface JobItem {
  id: string;
  jobId: string;
  category: ServiceCategory;
  description: string;
  qty: number;
  rate: number; // AED, money math is centralised
  amount: number; // qty * rate, computed in the service / money layer
}

export interface Payment {
  id: string;
  jobId: string;
  amount: number;
  method: PaymentMethod;
  date: string; // ISO date
  note?: string | null;
}

export interface Job {
  id: string;
  jobNo: string; // e.g. "0457"
  clientId: string;
  vehicleId: string;
  date: string; // ISO date
  transportType: TransportType;
  status: JobStatus;
  mechanicName?: string | null;
  notes?: string | null;
  promisedDate?: string | null; // ISO date
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Derived / view models used across the UI and API responses
// ---------------------------------------------------------------------------

/** A money summary computed from a job's items and payments. */
export interface JobTotals {
  total: number;
  paid: number;
  balance: number;
  paymentStatus: PaymentStatus;
}

export interface JobWithRelations extends Job {
  client: Client;
  vehicle: Vehicle;
  items: JobItem[];
  payments: Payment[];
  totals: JobTotals;
}

export interface ClientWithStats extends Client {
  vehicles: Vehicle[];
  jobCount: number;
  totalSpent: number;
  totalOutstanding: number;
}

export interface VehicleWithClient extends Vehicle {
  client: Pick<Client, "id" | "name" | "phone1">;
  jobCount: number;
}

// ---------------------------------------------------------------------------
// Dashboard / reports payloads
// ---------------------------------------------------------------------------

export interface DashboardStats {
  todayRevenue: number;
  pendingJobs: number;
  carsInShop: number;
  totalOutstanding: number;
}

export interface RevenuePoint {
  date: string; // ISO date (day)
  revenue: number;
}

export interface StatusCount {
  status: JobStatus;
  count: number;
}

export interface ServiceRevenue {
  category: ServiceCategory;
  revenue: number;
}

export interface TopClient {
  clientId: string;
  name: string;
  totalSpent: number;
  jobCount: number;
}

export interface DebtorRow {
  jobId: string;
  jobNo: string;
  clientName: string;
  phone: string;
  vehicle: string;
  total: number;
  paid: number;
  balance: number;
}

export interface DashboardPayload {
  stats: DashboardStats;
  revenue30d: RevenuePoint[];
  statusBreakdown: StatusCount[];
  recentJobs: JobWithRelations[];
  outstanding: DebtorRow[];
}

export interface ReportsPayload {
  revenueByPeriod: RevenuePoint[];
  revenueByService: ServiceRevenue[];
  topClients: TopClient[];
  receivables: DebtorRow[];
}

// ---------------------------------------------------------------------------
// Auth + request payloads
// ---------------------------------------------------------------------------

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateJobItemInput {
  category: ServiceCategory;
  description: string;
  qty: number;
  rate: number;
}

export interface CreateJobInput {
  clientId?: string;
  newClient?: { name: string; phone1: string; phone2?: string };
  vehicleId?: string;
  newVehicle?: { plateNo: string; makeModel: string; color?: string; year?: number };
  date: string;
  transportType: TransportType;
  mechanicName?: string;
  promisedDate?: string;
  notes?: string;
  items: CreateJobItemInput[];
  initialPayment?: { amount: number; method: PaymentMethod };
}

export interface CreatePaymentInput {
  jobId: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
}

/** Public job-tracking result (no sensitive internal fields). */
export interface TrackResult {
  jobNo: string;
  status: JobStatus;
  date: string;
  promisedDate?: string | null;
  clientName: string;
  vehicle: { plateNo: string; makeModel: string; color?: string | null };
  items: Pick<JobItem, "description" | "qty" | "amount" | "category">[];
  totals: JobTotals;
}
