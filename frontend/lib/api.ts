/**
 * The single data surface every component imports from.
 *
 * By default it serves the in-memory mock (so the demo runs with no backend).
 * Set NEXT_PUBLIC_USE_BACKEND=true (and run the NestJS app on :4000) to switch
 * to the real API — the function signatures are identical, so nothing else in
 * the UI changes. Everything is async to mirror real network calls and to make
 * the swap seamless.
 */
import type {
  Client,
  CreateJobInput,
  CreatePaymentInput,
  JobStatus,
  Vehicle,
} from "@shared";
import * as mock from "./mock-api";

const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === "true";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Tiny helper so the mock feels like a network call (and never throws sync). */
async function m<T>(fn: () => T): Promise<T> {
  await new Promise((r) => setTimeout(r, 120));
  return fn();
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("aqas_token") : null;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  // ---- auth ----
  login: (email: string, password: string) =>
    USE_BACKEND
      ? http<ReturnType<typeof mock.login>>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        })
      : m(() => mock.login(email, password)),

  // ---- dashboard ----
  dashboard: () => (USE_BACKEND ? http("/dashboard") : m(mock.getDashboard)),

  // ---- clients ----
  listClients: (search = "") =>
    USE_BACKEND
      ? http(`/clients?search=${encodeURIComponent(search)}`)
      : m(() => mock.listClients(search)),
  getClient: (clientId: string) =>
    USE_BACKEND ? http(`/clients/${clientId}`) : m(() => mock.getClient(clientId)),
  createClient: (input: Omit<Client, "id" | "createdAt">) =>
    USE_BACKEND
      ? http("/clients", { method: "POST", body: JSON.stringify(input) })
      : m(() => mock.createClient(input)),
  updateClient: (clientId: string, patch: Partial<Client>) =>
    USE_BACKEND
      ? http(`/clients/${clientId}`, { method: "PATCH", body: JSON.stringify(patch) })
      : m(() => mock.updateClient(clientId, patch)),
  deleteClient: (clientId: string) =>
    USE_BACKEND
      ? http(`/clients/${clientId}`, { method: "DELETE" })
      : m(() => mock.deleteClient(clientId)),

  // ---- vehicles ----
  listVehicles: (search = "") =>
    USE_BACKEND
      ? http(`/vehicles?search=${encodeURIComponent(search)}`)
      : m(() => mock.listVehicles(search)),
  createVehicle: (input: Omit<Vehicle, "id">) =>
    USE_BACKEND
      ? http("/vehicles", { method: "POST", body: JSON.stringify(input) })
      : m(() => mock.createVehicle(input)),
  updateVehicle: (vehicleId: string, patch: Partial<Vehicle>) =>
    USE_BACKEND
      ? http(`/vehicles/${vehicleId}`, { method: "PATCH", body: JSON.stringify(patch) })
      : m(() => mock.updateVehicle(vehicleId, patch)),
  deleteVehicle: (vehicleId: string) =>
    USE_BACKEND
      ? http(`/vehicles/${vehicleId}`, { method: "DELETE" })
      : m(() => mock.deleteVehicle(vehicleId)),

  // ---- jobs ----
  listJobs: (filters: mock.JobFilters = {}) =>
    USE_BACKEND
      ? http(`/jobs?search=${encodeURIComponent(filters.search ?? "")}&status=${filters.status ?? "ALL"}`)
      : m(() => mock.listJobs(filters)),
  getJob: (jobId: string) =>
    USE_BACKEND ? http(`/jobs/${jobId}`) : m(() => mock.getJob(jobId)),
  createJob: (input: CreateJobInput) =>
    USE_BACKEND
      ? http("/jobs", { method: "POST", body: JSON.stringify(input) })
      : m(() => mock.createJob(input)),
  updateJobStatus: (jobId: string, status: JobStatus) =>
    USE_BACKEND
      ? http(`/jobs/${jobId}/status`, { method: "PATCH", body: JSON.stringify({ status }) })
      : m(() => mock.updateJobStatus(jobId, status)),

  // ---- payments / accounting ----
  listPayments: () => (USE_BACKEND ? http("/payments") : m(mock.listPayments)),
  addPayment: (input: CreatePaymentInput) =>
    USE_BACKEND
      ? http("/payments", { method: "POST", body: JSON.stringify(input) })
      : m(() => mock.addPayment(input)),
  accounting: () => (USE_BACKEND ? http("/payments/accounting") : m(mock.getAccounting)),

  // ---- reports ----
  reports: (days = 30) =>
    USE_BACKEND ? http(`/reports?days=${days}`) : m(() => mock.getReports(days)),

  // ---- public tracking ----
  track: (query: string) =>
    USE_BACKEND
      ? http(`/track?q=${encodeURIComponent(query)}`)
      : m(() => mock.track(query)),
};

export type Api = typeof api;
