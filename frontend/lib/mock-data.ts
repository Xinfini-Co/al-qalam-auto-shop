import type {
  Client,
  Job,
  JobItem,
  JobStatus,
  Payment,
  PaymentMethod,
  ServiceCategory,
  TransportType,
  User,
  Vehicle,
} from "@shared";
import { lineAmount } from "./money";

/** ISO date (midday, to avoid TZ edge cases) for `n` days before now. */
function daysAgo(n: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysAhead(n: number): string {
  return daysAgo(-n);
}

export const demoUser: User = {
  id: "u1",
  email: "admin@alqalam.ae",
  name: "Workshop Admin",
  role: "ADMIN",
};

// ---------------------------------------------------------------------------
// Clients (8)
// ---------------------------------------------------------------------------
export const clients: Client[] = [
  { id: "c1", name: "Mohammed Al Falasi", phone1: "055-6620775", phone2: "050-1816957", address: "Al Nahda, Sharjah", createdAt: daysAgo(220) },
  { id: "c2", name: "Rashid Transport LLC", phone1: "054-5411245", phone2: "06-5331200", address: "Ind. Area No. 4, Sharjah", createdAt: daysAgo(190) },
  { id: "c3", name: "Ahmed Khan", phone1: "050-7781204", address: "Muweilah, Sharjah", createdAt: daysAgo(150) },
  { id: "c4", name: "Sara Ibrahim", phone1: "052-9930011", address: "Al Majaz, Sharjah", createdAt: daysAgo(120) },
  { id: "c5", name: "Gulf Movers Est.", phone1: "06-5567890", phone2: "055-1122334", address: "Ind. Area No. 2, Sharjah", createdAt: daysAgo(95) },
  { id: "c6", name: "Bilal Hussain", phone1: "056-4400291", address: "Al Qasimia, Sharjah", createdAt: daysAgo(60) },
  { id: "c7", name: "Fatima Abdullah", phone1: "050-2298764", address: "Al Khan, Sharjah", createdAt: daysAgo(35) },
  { id: "c8", name: "Desert Rose Rentals", phone1: "04-2211009", phone2: "055-9087611", address: "Industrial Area, Ajman", createdAt: daysAgo(18) },
];

// ---------------------------------------------------------------------------
// Vehicles (12)
// ---------------------------------------------------------------------------
export const vehicles: Vehicle[] = [
  { id: "v1", clientId: "c1", plateNo: "312 01", makeModel: "Toyota Hiace", color: "White", year: 2019 },
  { id: "v2", clientId: "c1", plateNo: "A 44821", makeModel: "Nissan Patrol", color: "Black", year: 2021 },
  { id: "v3", clientId: "c2", plateNo: "B 22310", makeModel: "Toyota Hiace", color: "White", year: 2018 },
  { id: "v4", clientId: "c2", plateNo: "C 11290", makeModel: "Mitsubishi Canter", color: "White", year: 2017 },
  { id: "v5", clientId: "c3", plateNo: "D 90211", makeModel: "Honda Civic", color: "Silver", year: 2020 },
  { id: "v6", clientId: "c4", plateNo: "E 33015", makeModel: "Nissan Sunny", color: "White", year: 2022 },
  { id: "v7", clientId: "c5", plateNo: "F 70188", makeModel: "Toyota Land Cruiser", color: "Grey", year: 2021 },
  { id: "v8", clientId: "c5", plateNo: "G 50542", makeModel: "Ford Transit", color: "White", year: 2019 },
  { id: "v9", clientId: "c6", plateNo: "H 60733", makeModel: "Hyundai Elantra", color: "Blue", year: 2020 },
  { id: "v10", clientId: "c7", plateNo: "I 80124", makeModel: "Kia Sportage", color: "Red", year: 2021 },
  { id: "v11", clientId: "c8", plateNo: "J 90810", makeModel: "Nissan Patrol", color: "White", year: 2023 },
  { id: "v12", clientId: "c8", plateNo: "K 12044", makeModel: "Toyota Hiace", color: "Silver", year: 2020 },
];

// ---------------------------------------------------------------------------
// Jobs — defined compactly, then expanded into flat typed arrays
// ---------------------------------------------------------------------------
type SeedItem = [ServiceCategory, string, number, number]; // category, desc, qty, rate
interface SeedJob {
  jobNo: string;
  clientId: string;
  vehicleId: string;
  date: number; // days ago
  promised?: number; // days ahead (from today)
  transportType: TransportType;
  status: JobStatus;
  mechanicName?: string;
  notes?: string;
  items: SeedItem[];
  payments: [number, PaymentMethod, number, string?][]; // amount, method, daysAgo, note
}

const MECHANICS = ["Imran", "Suresh", "Abdul Karim", "Ravi", "Jamal"];

const seed: SeedJob[] = [
  {
    jobNo: "0443", clientId: "c3", vehicleId: "v5", date: 28, transportType: "SELF_DRIVE",
    status: "COMPLETED", mechanicName: "Suresh", notes: "Customer reported AC not cooling.",
    items: [
      ["AC", "A/C compressor service", 1, 450],
      ["AC", "A/C gas refill", 1, 150],
      ["MECHANICAL", "Cabin filter", 1, 80],
    ],
    payments: [[680, "CASH", 27]],
  },
  {
    jobNo: "0444", clientId: "c5", vehicleId: "v7", date: 26, transportType: "SELF_DRIVE",
    status: "COMPLETED", mechanicName: "Imran",
    items: [
      ["MECHANICAL", "Front brake pads", 1, 320],
      ["MECHANICAL", "Brake disc skimming", 2, 90],
      ["MECHANICAL", "Engine oil + filter", 1, 240],
    ],
    payments: [[820, "CARD", 25]],
  },
  {
    jobNo: "0445", clientId: "c2", vehicleId: "v3", date: 24, transportType: "TOWED",
    status: "COMPLETED", mechanicName: "Abdul Karim", notes: "Front-end collision, left side.",
    items: [
      ["DENTING", "Front fender denting", 1, 400],
      ["PAINTING", "Front fender paint", 1, 350],
      ["AUTO_ELECTRIC", "Head light assembly", 1, 280],
      ["SPARE_PARTS", "Side mirror", 1, 160],
    ],
    payments: [[700, "CASH", 23], [490, "BANK_TRANSFER", 12]],
  },
  {
    jobNo: "0446", clientId: "c4", vehicleId: "v6", date: 22, transportType: "SELF_DRIVE",
    status: "READY_FOR_PICKUP", mechanicName: "Ravi",
    items: [
      ["PAINTING", "Full bumper respray", 1, 300],
      ["DENTING", "Rear door dent", 1, 220],
    ],
    payments: [[260, "CASH", 21]],
  },
  {
    jobNo: "0447", clientId: "c1", vehicleId: "v2", date: 20, transportType: "SELF_DRIVE",
    status: "COMPLETED", mechanicName: "Jamal",
    items: [
      ["MECHANICAL", "Suspension arm bushes", 2, 180],
      ["MECHANICAL", "Wheel alignment", 1, 120],
      ["AUTO_ELECTRIC", "Battery replacement", 1, 320],
    ],
    payments: [[800, "CARD", 19]],
  },
  {
    jobNo: "0448", clientId: "c6", vehicleId: "v9", date: 18, transportType: "SELF_DRIVE",
    status: "COMPLETED", mechanicName: "Suresh", notes: "Service due.",
    items: [
      ["MECHANICAL", "Major service", 1, 480],
      ["SPARE_PARTS", "Spark plugs", 4, 35],
    ],
    payments: [[620, "CASH", 17]],
  },
  {
    jobNo: "0449", clientId: "c8", vehicleId: "v11", date: 15, transportType: "PICKUP",
    status: "COMPLETED", mechanicName: "Imran", notes: "Fleet vehicle — invoice to office.",
    items: [
      ["AC", "A/C gas + leak test", 1, 260],
      ["MECHANICAL", "Radiator flush", 1, 180],
      ["AUTO_ELECTRIC", "Alternator repair", 1, 540],
    ],
    payments: [[980, "BANK_TRANSFER", 13]],
  },
  {
    jobNo: "0450", clientId: "c7", vehicleId: "v10", date: 13, transportType: "SELF_DRIVE",
    status: "COMPLETED", mechanicName: "Ravi",
    items: [
      ["DENTING", "Bonnet dent removal", 1, 350],
      ["PAINTING", "Bonnet respray", 1, 420],
    ],
    payments: [[400, "CASH", 12], [370, "CASH", 4]],
  },
  {
    jobNo: "0451", clientId: "c2", vehicleId: "v4", date: 11, transportType: "TOWED",
    status: "IN_PROGRESS", mechanicName: "Abdul Karim", notes: "Gearbox noise under load.",
    items: [
      ["MECHANICAL", "Clutch plate + pressure", 1, 900],
      ["MECHANICAL", "Gearbox oil", 1, 160],
      ["SPARE_PARTS", "Release bearing", 1, 140],
    ],
    payments: [[600, "CASH", 10]],
  },
  {
    jobNo: "0452", clientId: "c5", vehicleId: "v8", date: 9, transportType: "DELIVERY",
    status: "READY_FOR_PICKUP", mechanicName: "Jamal",
    items: [
      ["DENTING", "Side panel denting", 2, 300],
      ["PAINTING", "Side panel paint + blend", 1, 520],
      ["AUTO_ELECTRIC", "Indicator repair", 1, 90],
    ],
    payments: [[700, "BANK_TRANSFER", 7]],
  },
  {
    jobNo: "0453", clientId: "c3", vehicleId: "v5", date: 7, transportType: "SELF_DRIVE",
    status: "COMPLETED", mechanicName: "Suresh",
    items: [
      ["AUTO_ELECTRIC", "Central locking repair", 1, 240],
      ["AUTO_ELECTRIC", "Window motor", 1, 280],
    ],
    payments: [[520, "CARD", 6]],
  },
  {
    jobNo: "0454", clientId: "c4", vehicleId: "v6", date: 5, transportType: "SELF_DRIVE",
    status: "IN_PROGRESS", mechanicName: "Ravi", notes: "Waiting for paint to cure.",
    items: [
      ["DENTING", "Quarter panel pull", 1, 480],
      ["PAINTING", "Quarter panel paint", 1, 450],
      ["SPARE_PARTS", "Tail light", 1, 210],
    ],
    payments: [[500, "CASH", 4]],
  },
  {
    jobNo: "0455", clientId: "c6", vehicleId: "v9", date: 3, transportType: "SELF_DRIVE",
    status: "PENDING", mechanicName: "Imran", notes: "Estimate approved, awaiting parts.",
    items: [
      ["MECHANICAL", "Timing belt kit", 1, 680],
      ["MECHANICAL", "Water pump", 1, 240],
      ["SPARE_PARTS", "Coolant", 1, 90],
    ],
    payments: [],
  },
  {
    jobNo: "0456", clientId: "c8", vehicleId: "v12", date: 2, transportType: "PICKUP",
    status: "PENDING", notes: "Fleet inspection booked.",
    items: [
      ["MECHANICAL", "Full inspection", 1, 150],
      ["AC", "A/C check", 1, 80],
    ],
    payments: [],
  },
  // ----- The featured invoice 0457 — total 2970, partial payment -----------
  {
    jobNo: "0457", clientId: "c1", vehicleId: "v1", date: 1, promised: 3, transportType: "TOWED",
    status: "IN_PROGRESS", mechanicName: "Abdul Karim",
    notes: "Rear-end collision repair. Customer approved full estimate.",
    items: [
      ["AUTO_ELECTRIC", "Head light", 2, 150],
      ["AUTO_ELECTRIC", "Rear light", 2, 90],
      ["SPARE_PARTS", "Petrol tank", 1, 50],
      ["SPARE_PARTS", "Rear bumper", 1, 120],
      ["DENTING", "Rear door", 1, 650],
      ["PAINTING", "Dent + Paint", 1, 400],
      ["MECHANICAL", "Brake pads F + R", 2, 185],
      ["MECHANICAL", "Charge + radiator", 1, 200],
      ["AC", "A/C + A/C gas", 1, 700],
    ],
    payments: [[1500, "CASH", 1, "Advance against repair"]],
  },
];

// --- expand the compact seed into flat, fully-typed records ----------------
export const jobs: Job[] = [];
export const jobItems: JobItem[] = [];
export const payments: Payment[] = [];

seed.forEach((s, ji) => {
  const jobId = `j${ji + 1}`;
  jobs.push({
    id: jobId,
    jobNo: s.jobNo,
    clientId: s.clientId,
    vehicleId: s.vehicleId,
    date: daysAgo(s.date),
    transportType: s.transportType,
    status: s.status,
    mechanicName: s.mechanicName ?? MECHANICS[ji % MECHANICS.length],
    notes: s.notes ?? null,
    promisedDate: s.promised != null ? daysAhead(s.promised) : daysAgo(s.date - 2),
    createdAt: daysAgo(s.date),
  });
  s.items.forEach(([category, description, qty, rate], ii) => {
    jobItems.push({
      id: `${jobId}-i${ii + 1}`,
      jobId,
      category,
      description,
      qty,
      rate,
      amount: lineAmount(qty, rate),
    });
  });
  s.payments.forEach(([amount, method, d, note], pi) => {
    payments.push({
      id: `${jobId}-p${pi + 1}`,
      jobId,
      amount,
      method,
      date: daysAgo(d),
      note: note ?? null,
    });
  });
});

/** Next sequential job number after the highest seeded one. */
export function nextJobNo(existing: Job[]): string {
  const max = existing.reduce((m, j) => Math.max(m, parseInt(j.jobNo, 10) || 0), 0);
  return String(max + 1).padStart(4, "0");
}
