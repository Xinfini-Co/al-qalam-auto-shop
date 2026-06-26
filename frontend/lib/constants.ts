import type {
  JobStatus,
  PaymentMethod,
  PaymentStatus,
  ServiceCategory,
  TransportType,
} from "@shared";

/** Shop identity — single source of truth for headers, footers, invoices. */
export const SHOP = {
  name: "AL QALAM AUTO MAINTENANCE W.SHOP",
  shortName: "Al Qalam Auto Shop",
  tagline: "Denting · Painting · Mechanical · Auto Electric · A/C Repairing Works",
  city: "Sharjah – U.A.E.",
  area: "Ind. Area No. 2",
  poBox: "P.O. Box 22202",
  phones: ["055-6620775", "054-5411245", "050-1816957"],
  email: "info@alqalam.ae",
} as const;

export const STATUS_LABEL: Record<JobStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  READY_FOR_PICKUP: "Ready for pickup",
};

/** Tailwind classes for status pills. Neutral + a single accent per state. */
export const STATUS_STYLE: Record<JobStatus, string> = {
  PENDING:
    "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 ring-1 ring-inset ring-zinc-500/20",
  IN_PROGRESS:
    "bg-brand-blue/10 text-brand-blue ring-1 ring-inset ring-brand-blue/25",
  COMPLETED:
    "bg-success/10 text-success ring-1 ring-inset ring-success/25",
  READY_FOR_PICKUP:
    "bg-warning/10 text-warning ring-1 ring-inset ring-warning/25",
};

/** Ordered timeline used on the public /track page. */
export const STATUS_FLOW: JobStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "READY_FOR_PICKUP",
];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PAID: "Paid",
  PARTIAL: "Partial",
  UNPAID: "Unpaid",
};

export const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  PAID: "bg-success/10 text-success ring-1 ring-inset ring-success/25",
  PARTIAL: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/25",
  UNPAID: "bg-danger/10 text-danger ring-1 ring-inset ring-danger/25",
};

export const TRANSPORT_LABEL: Record<TransportType, string> = {
  SELF_DRIVE: "Self drive",
  TOWED: "Towed",
  PICKUP: "Pickup",
  DELIVERY: "Delivery",
};

export const TRANSPORT_OPTIONS: { value: TransportType; label: string }[] =
  Object.entries(TRANSPORT_LABEL).map(([value, label]) => ({
    value: value as TransportType,
    label,
  }));

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
};

export const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] =
  Object.entries(METHOD_LABEL).map(([value, label]) => ({
    value: value as PaymentMethod,
    label,
  }));

export const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  DENTING: "Denting",
  PAINTING: "Painting",
  MECHANICAL: "Mechanical",
  AUTO_ELECTRIC: "Auto electric",
  AC: "A/C",
  SPARE_PARTS: "Spare parts",
};

export const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] =
  Object.entries(CATEGORY_LABEL).map(([value, label]) => ({
    value: value as ServiceCategory,
    label,
  }));

/** Fixed brand colors for charts so accents stay on-brand. */
export const CHART_COLORS = {
  red: "#E31937",
  magenta: "#9B1C8E",
  blue: "#2563EB",
  green: "#22C55E",
  amber: "#F59E0B",
  zinc: "#71717A",
} as const;

export const STATUS_CHART_COLOR: Record<JobStatus, string> = {
  PENDING: CHART_COLORS.zinc,
  IN_PROGRESS: CHART_COLORS.blue,
  COMPLETED: CHART_COLORS.green,
  READY_FOR_PICKUP: CHART_COLORS.amber,
};

export const CATEGORY_CHART_COLOR: Record<ServiceCategory, string> = {
  DENTING: CHART_COLORS.red,
  PAINTING: CHART_COLORS.magenta,
  MECHANICAL: CHART_COLORS.blue,
  AUTO_ELECTRIC: "#0EA5E9",
  AC: "#14B8A6",
  SPARE_PARTS: CHART_COLORS.amber,
};

export const SERVICES = [
  {
    key: "DENTING",
    title: "Denting",
    desc: "Precision panel beating and dent removal that restores factory lines.",
    icon: "Hammer",
  },
  {
    key: "PAINTING",
    title: "Painting",
    desc: "Computerised colour matching and oven-baked finishes.",
    icon: "SprayCan",
  },
  {
    key: "MECHANICAL",
    title: "Mechanical",
    desc: "Engine, brakes, suspension and full diagnostics.",
    icon: "Wrench",
  },
  {
    key: "AUTO_ELECTRIC",
    title: "Auto electric",
    desc: "Wiring, batteries, alternators and computerised fault finding.",
    icon: "Zap",
  },
  {
    key: "AC",
    title: "A/C repair",
    desc: "Gas top-up, compressor service and cooling diagnostics.",
    icon: "Snowflake",
  },
  {
    key: "SPARE_PARTS",
    title: "Genuine spare parts",
    desc: "Sourcing and fitting of OEM and quality aftermarket parts.",
    icon: "Cog",
  },
] as const;
