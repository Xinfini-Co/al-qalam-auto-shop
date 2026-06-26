import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// kept self-contained (no @shared import) so it runs with plain ts-node
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const lineAmount = (qty: number, rate: number) => round2((qty || 0) * (rate || 0));

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}
const daysAhead = (n: number) => daysAgo(-n);

type SeedItem = [string, string, number, number]; // category, desc, qty, rate
interface SeedJob {
  jobNo: string;
  clientKey: string;
  vehicleKey: string;
  date: number;
  promised?: number;
  transportType: string;
  status: string;
  mechanicName?: string;
  notes?: string;
  items: SeedItem[];
  payments: [number, string, number, string?][]; // amount, method, daysAgo, note
}

const clients = [
  { key: "c1", name: "Mohammed Al Falasi", phone1: "055-6620775", phone2: "050-1816957", address: "Al Nahda, Sharjah", createdAt: daysAgo(220) },
  { key: "c2", name: "Rashid Transport LLC", phone1: "054-5411245", phone2: "06-5331200", address: "Ind. Area No. 4, Sharjah", createdAt: daysAgo(190) },
  { key: "c3", name: "Ahmed Khan", phone1: "050-7781204", address: "Muweilah, Sharjah", createdAt: daysAgo(150) },
  { key: "c4", name: "Sara Ibrahim", phone1: "052-9930011", address: "Al Majaz, Sharjah", createdAt: daysAgo(120) },
  { key: "c5", name: "Gulf Movers Est.", phone1: "06-5567890", phone2: "055-1122334", address: "Ind. Area No. 2, Sharjah", createdAt: daysAgo(95) },
  { key: "c6", name: "Bilal Hussain", phone1: "056-4400291", address: "Al Qasimia, Sharjah", createdAt: daysAgo(60) },
  { key: "c7", name: "Fatima Abdullah", phone1: "050-2298764", address: "Al Khan, Sharjah", createdAt: daysAgo(35) },
  { key: "c8", name: "Desert Rose Rentals", phone1: "04-2211009", phone2: "055-9087611", address: "Industrial Area, Ajman", createdAt: daysAgo(18) },
];

const vehicles = [
  { key: "v1", clientKey: "c1", plateNo: "312 01", makeModel: "Toyota Hiace", color: "White", year: 2019 },
  { key: "v2", clientKey: "c1", plateNo: "A 44821", makeModel: "Nissan Patrol", color: "Black", year: 2021 },
  { key: "v3", clientKey: "c2", plateNo: "B 22310", makeModel: "Toyota Hiace", color: "White", year: 2018 },
  { key: "v4", clientKey: "c2", plateNo: "C 11290", makeModel: "Mitsubishi Canter", color: "White", year: 2017 },
  { key: "v5", clientKey: "c3", plateNo: "D 90211", makeModel: "Honda Civic", color: "Silver", year: 2020 },
  { key: "v6", clientKey: "c4", plateNo: "E 33015", makeModel: "Nissan Sunny", color: "White", year: 2022 },
  { key: "v7", clientKey: "c5", plateNo: "F 70188", makeModel: "Toyota Land Cruiser", color: "Grey", year: 2021 },
  { key: "v8", clientKey: "c5", plateNo: "G 50542", makeModel: "Ford Transit", color: "White", year: 2019 },
  { key: "v9", clientKey: "c6", plateNo: "H 60733", makeModel: "Hyundai Elantra", color: "Blue", year: 2020 },
  { key: "v10", clientKey: "c7", plateNo: "I 80124", makeModel: "Kia Sportage", color: "Red", year: 2021 },
  { key: "v11", clientKey: "c8", plateNo: "J 90810", makeModel: "Nissan Patrol", color: "White", year: 2023 },
  { key: "v12", clientKey: "c8", plateNo: "K 12044", makeModel: "Toyota Hiace", color: "Silver", year: 2020 },
];

const jobs: SeedJob[] = [
  { jobNo: "0443", clientKey: "c3", vehicleKey: "v5", date: 28, transportType: "SELF_DRIVE", status: "COMPLETED", mechanicName: "Suresh", notes: "Customer reported AC not cooling.", items: [["AC", "A/C compressor service", 1, 450], ["AC", "A/C gas refill", 1, 150], ["MECHANICAL", "Cabin filter", 1, 80]], payments: [[680, "CASH", 27]] },
  { jobNo: "0444", clientKey: "c5", vehicleKey: "v7", date: 26, transportType: "SELF_DRIVE", status: "COMPLETED", mechanicName: "Imran", items: [["MECHANICAL", "Front brake pads", 1, 320], ["MECHANICAL", "Brake disc skimming", 2, 90], ["MECHANICAL", "Engine oil + filter", 1, 240]], payments: [[820, "CARD", 25]] },
  { jobNo: "0445", clientKey: "c2", vehicleKey: "v3", date: 24, transportType: "TOWED", status: "COMPLETED", mechanicName: "Abdul Karim", notes: "Front-end collision, left side.", items: [["DENTING", "Front fender denting", 1, 400], ["PAINTING", "Front fender paint", 1, 350], ["AUTO_ELECTRIC", "Head light assembly", 1, 280], ["SPARE_PARTS", "Side mirror", 1, 160]], payments: [[700, "CASH", 23], [490, "BANK_TRANSFER", 12]] },
  { jobNo: "0446", clientKey: "c4", vehicleKey: "v6", date: 22, transportType: "SELF_DRIVE", status: "READY_FOR_PICKUP", mechanicName: "Ravi", items: [["PAINTING", "Full bumper respray", 1, 300], ["DENTING", "Rear door dent", 1, 220]], payments: [[260, "CASH", 21]] },
  { jobNo: "0447", clientKey: "c1", vehicleKey: "v2", date: 20, transportType: "SELF_DRIVE", status: "COMPLETED", mechanicName: "Jamal", items: [["MECHANICAL", "Suspension arm bushes", 2, 180], ["MECHANICAL", "Wheel alignment", 1, 120], ["AUTO_ELECTRIC", "Battery replacement", 1, 320]], payments: [[800, "CARD", 19]] },
  { jobNo: "0448", clientKey: "c6", vehicleKey: "v9", date: 18, transportType: "SELF_DRIVE", status: "COMPLETED", mechanicName: "Suresh", notes: "Service due.", items: [["MECHANICAL", "Major service", 1, 480], ["SPARE_PARTS", "Spark plugs", 4, 35]], payments: [[620, "CASH", 17]] },
  { jobNo: "0449", clientKey: "c8", vehicleKey: "v11", date: 15, transportType: "PICKUP", status: "COMPLETED", mechanicName: "Imran", notes: "Fleet vehicle — invoice to office.", items: [["AC", "A/C gas + leak test", 1, 260], ["MECHANICAL", "Radiator flush", 1, 180], ["AUTO_ELECTRIC", "Alternator repair", 1, 540]], payments: [[980, "BANK_TRANSFER", 13]] },
  { jobNo: "0450", clientKey: "c7", vehicleKey: "v10", date: 13, transportType: "SELF_DRIVE", status: "COMPLETED", mechanicName: "Ravi", items: [["DENTING", "Bonnet dent removal", 1, 350], ["PAINTING", "Bonnet respray", 1, 420]], payments: [[400, "CASH", 12], [370, "CASH", 4]] },
  { jobNo: "0451", clientKey: "c2", vehicleKey: "v4", date: 11, transportType: "TOWED", status: "IN_PROGRESS", mechanicName: "Abdul Karim", notes: "Gearbox noise under load.", items: [["MECHANICAL", "Clutch plate + pressure", 1, 900], ["MECHANICAL", "Gearbox oil", 1, 160], ["SPARE_PARTS", "Release bearing", 1, 140]], payments: [[600, "CASH", 10]] },
  { jobNo: "0452", clientKey: "c5", vehicleKey: "v8", date: 9, transportType: "DELIVERY", status: "READY_FOR_PICKUP", mechanicName: "Jamal", items: [["DENTING", "Side panel denting", 2, 300], ["PAINTING", "Side panel paint + blend", 1, 520], ["AUTO_ELECTRIC", "Indicator repair", 1, 90]], payments: [[700, "BANK_TRANSFER", 7]] },
  { jobNo: "0453", clientKey: "c3", vehicleKey: "v5", date: 7, transportType: "SELF_DRIVE", status: "COMPLETED", mechanicName: "Suresh", items: [["AUTO_ELECTRIC", "Central locking repair", 1, 240], ["AUTO_ELECTRIC", "Window motor", 1, 280]], payments: [[520, "CARD", 6]] },
  { jobNo: "0454", clientKey: "c4", vehicleKey: "v6", date: 5, transportType: "SELF_DRIVE", status: "IN_PROGRESS", mechanicName: "Ravi", notes: "Waiting for paint to cure.", items: [["DENTING", "Quarter panel pull", 1, 480], ["PAINTING", "Quarter panel paint", 1, 450], ["SPARE_PARTS", "Tail light", 1, 210]], payments: [[500, "CASH", 4]] },
  { jobNo: "0455", clientKey: "c6", vehicleKey: "v9", date: 3, transportType: "SELF_DRIVE", status: "PENDING", mechanicName: "Imran", notes: "Estimate approved, awaiting parts.", items: [["MECHANICAL", "Timing belt kit", 1, 680], ["MECHANICAL", "Water pump", 1, 240], ["SPARE_PARTS", "Coolant", 1, 90]], payments: [] },
  { jobNo: "0456", clientKey: "c8", vehicleKey: "v12", date: 2, transportType: "PICKUP", status: "PENDING", mechanicName: "Jamal", notes: "Fleet inspection booked.", items: [["MECHANICAL", "Full inspection", 1, 150], ["AC", "A/C check", 1, 80]], payments: [] },
  // ---- featured invoice 0457 — total 2970, partial payment ----
  { jobNo: "0457", clientKey: "c1", vehicleKey: "v1", date: 1, promised: 3, transportType: "TOWED", status: "IN_PROGRESS", mechanicName: "Abdul Karim", notes: "Rear-end collision repair. Customer approved full estimate.", items: [["AUTO_ELECTRIC", "Head light", 2, 150], ["AUTO_ELECTRIC", "Rear light", 2, 90], ["SPARE_PARTS", "Petrol tank", 1, 50], ["SPARE_PARTS", "Rear bumper", 1, 120], ["DENTING", "Rear door", 1, 650], ["PAINTING", "Dent + Paint", 1, 400], ["MECHANICAL", "Brake pads F + R", 2, 185], ["MECHANICAL", "Charge + radiator", 1, 200], ["AC", "A/C + A/C gas", 1, 700]], payments: [[1500, "CASH", 1, "Advance against repair"]] },
];

async function main() {
  console.log("🌱  Seeding Al Qalam Auto Shop…");

  // clean (respecting FK order)
  await prisma.payment.deleteMany();
  await prisma.jobItem.deleteMany();
  await prisma.job.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: "admin@alqalam.ae",
      passwordHash: bcrypt.hashSync("admin123", 10),
      name: "Workshop Admin",
      role: "ADMIN",
    },
  });

  const clientIds: Record<string, string> = {};
  for (const c of clients) {
    const created = await prisma.client.create({
      data: { name: c.name, phone1: c.phone1, phone2: c.phone2 ?? null, address: c.address ?? null, createdAt: c.createdAt },
    });
    clientIds[c.key] = created.id;
  }

  const vehicleIds: Record<string, string> = {};
  for (const v of vehicles) {
    const created = await prisma.vehicle.create({
      data: { clientId: clientIds[v.clientKey], plateNo: v.plateNo, makeModel: v.makeModel, color: v.color, year: v.year },
    });
    vehicleIds[v.key] = created.id;
  }

  for (const j of jobs) {
    await prisma.job.create({
      data: {
        jobNo: j.jobNo,
        clientId: clientIds[j.clientKey],
        vehicleId: vehicleIds[j.vehicleKey],
        date: daysAgo(j.date),
        transportType: j.transportType,
        status: j.status,
        mechanicName: j.mechanicName ?? null,
        notes: j.notes ?? null,
        promisedDate: j.promised != null ? daysAhead(j.promised) : daysAgo(j.date - 2),
        createdAt: daysAgo(j.date),
        items: {
          create: j.items.map(([category, description, qty, rate]) => ({
            category, description, qty, rate, amount: lineAmount(qty, rate),
          })),
        },
        payments: {
          create: j.payments.map(([amount, method, d, note]) => ({
            amount, method, date: daysAgo(d), note: note ?? null,
          })),
        },
      },
    });
  }

  console.log(`✅  Seeded ${clients.length} clients, ${vehicles.length} vehicles, ${jobs.length} jobs.`);
  console.log("   Login: admin@alqalam.ae / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
